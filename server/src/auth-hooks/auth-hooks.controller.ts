import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/public.decorator';
import { UnisenderService } from '../notifications/unisender.service';
import { pickLang, renderEmail, type EmailAction } from './auth-email.templates';

/** То, что присылает служба входа, когда человеку надо отправить письмо. */
type HookPayload = {
  user?: { email?: string; user_metadata?: Record<string, unknown> };
  email_data?: {
    token_hash?: string;
    token_hash_new?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
};

const KNOWN_ACTIONS: EmailAction[] = [
  'signup',
  'magiclink',
  'recovery',
  'email_change',
  'invite',
];

/**
 * Письма для входа и регистрации отправляет наш код, а не сама служба входа.
 *
 * Две причины. Первая: у службы один набор шаблонов на всех, выбрать язык
 * нельзя — а нам нужен русский для русскоязычных. Вторая: она отправляет по
 * почтовому протоколу, а его порты закрыты провайдером; мы же обращаемся к
 * почтовой службе по обычному веб-адресу.
 */
@Controller('auth-hooks')
export class AuthHooksController {
  private readonly log = new Logger(AuthHooksController.name);

  constructor(
    private config: ConfigService,
    private mail: UnisenderService,
  ) {}

  @Public()
  @Post('send-email')
  @HttpCode(200)
  async sendEmail(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: HookPayload,
    @Headers('webhook-id') id: string,
    @Headers('webhook-timestamp') timestamp: string,
    @Headers('webhook-signature') signature: string,
  ) {
    this.verify(req.rawBody, id, timestamp, signature);

    const to = body?.user?.email;
    const data = body?.email_data;
    if (!to || !data?.token_hash) {
      throw new BadRequestException('Missing user email or token');
    }

    const rawAction = data.email_action_type ?? 'magiclink';
    const action = (KNOWN_ACTIONS as string[]).includes(rawAction)
      ? (rawAction as EmailAction)
      : 'magiclink';

    // Язык берём из данных, которые сайт кладёт при регистрации и входе.
    const lang = pickLang(body.user?.user_metadata?.locale as string | undefined);

    const link = this.buildLink(data, action);
    const { subject, html, text } = renderEmail(action, lang, link);

    const result = await this.mail.send({ to, subject, html, text });
    if (!result.sent) {
      // Отвечаем ошибкой, чтобы служба входа показала человеку, что письмо не
      // ушло, а не делала вид, что всё хорошо.
      this.log.error(`письмо не отправлено: ${result.error}`);
      throw new BadRequestException('Email delivery failed');
    }

    this.log.log(`письмо «${action}» отправлено на ${to}, язык ${lang}`);
    return {};
  }

  /** Ссылка подтверждения ведёт на службу входа, а та уже вернёт человека на сайт. */
  private buildLink(
    data: NonNullable<HookPayload['email_data']>,
    action: EmailAction,
  ): string {
    const authUrl =
      this.config.get<string>('AUTH_EXTERNAL_URL') ??
      this.config.get<string>('SUPABASE_URL') ??
      '';
    const siteUrl =
      data.redirect_to ||
      this.config.get<string>('CLIENT_URL') ||
      data.site_url ||
      '';

    const params = new URLSearchParams({
      token: data.token_hash ?? '',
      type: action,
      redirect_to: siteUrl,
    });
    return `${authUrl.replace(/\/$/, '')}/auth/v1/verify?${params.toString()}`;
  }

  /**
   * Подпись обязательна: без неё любой желающий мог бы заставить нас разослать
   * письма с рабочими ссылками входа на чужие адреса.
   */
  private verify(
    rawBody: Buffer | undefined,
    id: string,
    timestamp: string,
    signature: string,
  ): void {
    const raw = this.config.get<string>('AUTH_HOOK_SECRET');
    if (!raw) throw new UnauthorizedException('Hook secret not configured');
    if (!id || !timestamp || !signature) throw new UnauthorizedException('Missing signature');
    if (!rawBody) throw new UnauthorizedException('Missing raw body');

    // Отсекаем повторную отправку старого перехваченного запроса.
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) {
      throw new UnauthorizedException('Signature expired');
    }

    const secret = Buffer.from(raw.replace(/^v1,whsec_/, '').replace(/^whsec_/, ''), 'base64');
    const expected = createHmac('sha256', secret)
      .update(`${id}.${timestamp}.${rawBody.toString('utf8')}`)
      .digest('base64');

    // Заголовок может содержать несколько подписей через пробел.
    const ok = signature.split(' ').some((part) => {
      const value = part.includes(',') ? part.split(',')[1] : part;
      const a = Buffer.from(value);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    });

    if (!ok) {
      this.log.warn(`подпись не сошлась: id=${id}`);
      throw new UnauthorizedException('Bad signature');
    }
  }
}
