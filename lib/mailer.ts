import nodemailer from 'nodemailer';

export async function sendAdminAlert(subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.ADMIN_ALERT_EMAILS || process.env.ADMIN_EMAIL || '';

  if (!host || !user || !pass || !to) {
    console.log('[MAILER] Missing SMTP config or recipients. Subject:', subject, 'Text:', text);
    return { ok: false, reason: 'missing-config' };
  }

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({ from: user, to, subject, text });
  return { ok: true };
}
