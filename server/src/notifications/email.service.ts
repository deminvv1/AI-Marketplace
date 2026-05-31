import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Email для Project alerts и др.
 * Если задан RESEND_API_KEY — отправка через Resend API, иначе только лог (dev).
 */
@Injectable()
export class EmailService {
  private readonly log = new Logger(EmailService.name);

  constructor(private config: ConfigService) {}

  async sendProjectAlert(
    to: string,
    payload: { title: string; body: string; link: string },
  ): Promise<{ sent: boolean }> {
    return this.send(to, payload.title, payload.body, payload.link, 'View project');
  }

  /** Proposal accepted / rejected — тот же Resend, что project alerts */
  async sendProposalUpdate(
    to: string,
    payload: { title: string; body: string; link: string },
  ): Promise<{ sent: boolean }> {
    return this.send(to, payload.title, payload.body, payload.link, 'Open marketplace');
  }

  private async send(
    to: string,
    subject: string,
    body: string,
    link: string,
    linkLabel: string,
  ): Promise<{ sent: boolean }> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from =
      this.config.get<string>('EMAIL_FROM') ?? 'AI Marketplace <onboarding@resend.dev>';

    if (!apiKey) {
      this.log.log(`[email skipped] to=${to} subject=${subject}`);
      return { sent: false };
    }

    const appUrl =
      this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    const href = link.startsWith('http') ? link : `${appUrl}${link}`;

    const html = `
      <p>${body ?? ''}</p>
      <p><a href="${href}">${linkLabel}</a></p>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.log.warn(`Resend failed: ${err}`);
      return { sent: false };
    }

    return { sent: true };
  }
}
