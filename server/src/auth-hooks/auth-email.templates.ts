/**
 * Тексты писем для входа и регистрации.
 *
 * Два языка: русский тем, у кого интерфейс на русском, английский всем
 * остальным. Своих шаблонов у системы входа хватает только на один язык
 * сразу — поэтому письма формируем здесь.
 */

export type EmailAction =
  | 'signup'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'invite';

export type Lang = 'ru' | 'en';

type Template = { subject: string; heading: string; body: string; button: string; footer: string };

const RU: Record<EmailAction, Template> = {
  signup: {
    subject: 'Подтвердите адрес почты — AI Marketplace',
    heading: 'Подтвердите почту',
    body: 'Вы создали аккаунт на AI Marketplace. Нажмите кнопку, чтобы подтвердить адрес и завершить регистрацию.',
    button: 'Подтвердить почту',
    footer: 'Если вы не регистрировались, просто не открывайте ссылку — ничего не произойдёт.',
  },
  magiclink: {
    subject: 'Ссылка для входа — AI Marketplace',
    heading: 'Вход без пароля',
    body: 'Нажмите кнопку, чтобы войти в AI Marketplace. Ссылка одноразовая и действует один час.',
    button: 'Войти',
    footer: 'Если вход запрашивали не вы, просто не открывайте ссылку — в аккаунт никто не попадёт.',
  },
  recovery: {
    subject: 'Восстановление пароля — AI Marketplace',
    heading: 'Новый пароль',
    body: 'Вы запросили смену пароля. Нажмите кнопку, чтобы задать новый. Ссылка действует один час.',
    button: 'Задать пароль',
    footer: 'Если вы не запрашивали смену, ничего делать не нужно — пароль останется прежним.',
  },
  email_change: {
    subject: 'Подтвердите новый адрес почты — AI Marketplace',
    heading: 'Смена адреса',
    body: 'Вы меняете адрес почты в AI Marketplace. Нажмите кнопку, чтобы подтвердить новый адрес.',
    button: 'Подтвердить адрес',
    footer: 'Если вы не меняли адрес, обратитесь к нам — возможно, кто-то получил доступ к аккаунту.',
  },
  invite: {
    subject: 'Приглашение в AI Marketplace',
    heading: 'Вас пригласили',
    body: 'Вас пригласили на AI Marketplace. Нажмите кнопку, чтобы принять приглашение и создать аккаунт.',
    button: 'Принять приглашение',
    footer: 'Если приглашение пришло по ошибке, просто не открывайте ссылку.',
  },
};

const EN: Record<EmailAction, Template> = {
  signup: {
    subject: 'Confirm your email — AI Marketplace',
    heading: 'Confirm your email',
    body: 'You created an account on AI Marketplace. Press the button to confirm your address and finish signing up.',
    button: 'Confirm email',
    footer: 'If you did not sign up, simply ignore this link — nothing will happen.',
  },
  magiclink: {
    subject: 'Your sign-in link — AI Marketplace',
    heading: 'Sign in without a password',
    body: 'Press the button to sign in to AI Marketplace. The link works once and expires in an hour.',
    button: 'Sign in',
    footer: 'If you did not ask to sign in, ignore this link — nobody gets into your account.',
  },
  recovery: {
    subject: 'Reset your password — AI Marketplace',
    heading: 'Set a new password',
    body: 'You asked to change your password. Press the button to set a new one. The link expires in an hour.',
    button: 'Set password',
    footer: 'If you did not ask for this, do nothing — your password stays as it is.',
  },
  email_change: {
    subject: 'Confirm your new email — AI Marketplace',
    heading: 'Changing your email',
    body: 'You are changing the email address on your AI Marketplace account. Press the button to confirm the new one.',
    button: 'Confirm address',
    footer: 'If you did not request this, contact us — someone may have access to your account.',
  },
  invite: {
    subject: 'You are invited to AI Marketplace',
    heading: 'You have been invited',
    body: 'You have been invited to AI Marketplace. Press the button to accept and create your account.',
    button: 'Accept invitation',
    footer: 'If this invitation reached you by mistake, simply ignore the link.',
  },
};

export function pickLang(locale: string | undefined | null): Lang {
  // Русский — тем, у кого интерфейс русский. Всем остальным английский:
  // на международной площадке он понятен, а держать двенадцать переводов
  // юридически значимых писем дорого и незачем.
  return typeof locale === 'string' && locale.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function renderEmail(
  action: EmailAction,
  lang: Lang,
  link: string,
): { subject: string; html: string; text: string } {
  const t = (lang === 'ru' ? RU : EN)[action];

  const html = `<!doctype html>
<html lang="${lang}">
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;padding:36px 32px;">
        <tr><td style="font-size:20px;font-weight:700;color:#111827;padding-bottom:14px;">${t.heading}</td></tr>
        <tr><td style="font-size:15px;line-height:1.65;color:#4b5563;padding-bottom:26px;">${t.body}</td></tr>
        <tr><td style="padding-bottom:26px;">
          <a href="${link}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 30px;border-radius:10px;">${t.button}</a>
        </td></tr>
        <tr><td style="font-size:13px;line-height:1.6;color:#9ca3af;border-top:1px solid #eceef2;padding-top:18px;">${t.footer}</td></tr>
      </table>
      <div style="font-size:12px;color:#9ca3af;padding-top:16px;">AI Marketplace · aiservicemarket.com</div>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${t.heading}\n\n${t.body}\n\n${link}\n\n${t.footer}\n\nAI Marketplace · aiservicemarket.com`;

  return { subject: t.subject, html, text };
}
