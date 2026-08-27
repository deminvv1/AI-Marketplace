import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Отправка писем через веб-интерфейс Unisender Go.
 *
 * Именно через веб-интерфейс, а не по почтовому протоколу: провайдер закрыл
 * исходящие почтовые порты по IPv4 (обычная мера против спама), а обращение
 * по 443 порту проходит свободно.
 */
@Injectable()
export class UnisenderService {
  private readonly log = new Logger(UnisenderService.name);

  constructor(private config: ConfigService) {}

  private get endpoint(): string {
    // Площадок у Unisender две, адреса разные; наш аккаунт на go2.
    const cluster = this.config.get<string>('UNISENDER_CLUSTER') ?? 'go2';
    return `https://${cluster}.unisender.ru/ru/transactional/api/v1/email/send.json`;
  }

  async send(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ sent: boolean; error?: string }> {
    const apiKey = this.config.get<string>('UNISENDER_API_KEY');
    if (!apiKey) {
      // В разработке ключа нет — пишем в журнал вместо отправки, чтобы
      // рабочий процесс не падал.
      this.log.warn(`[письмо не отправлено: нет ключа] кому=${params.to} тема=${params.subject}`);
      return { sent: false, error: 'UNISENDER_API_KEY not set' };
    }

    const fromEmail =
      this.config.get<string>('MAIL_FROM_EMAIL') ?? 'noreply@aiservicemarket.com';
    const fromName = this.config.get<string>('MAIL_FROM_NAME') ?? 'AI Marketplace';

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          message: {
            recipients: [{ email: params.to }],
            body: { html: params.html, plaintext: params.text },
            subject: params.subject,
            from_email: fromEmail,
            from_name: fromName,
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      const data = (await res.json().catch(() => null)) as
        | { status?: string; failures?: unknown[]; message?: string }
        | null;

      if (!res.ok || data?.status === 'error') {
        const reason = data?.message ?? `HTTP ${res.status}`;
        this.log.error(`письмо не ушло: кому=${params.to} причина=${reason}`);
        return { sent: false, error: String(reason) };
      }

      this.log.log(`письмо отправлено: кому=${params.to} тема=${params.subject}`);
      return { sent: true };
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      this.log.error(`письмо не ушло: кому=${params.to} причина=${reason}`);
      return { sent: false, error: reason };
    }
  }
}
