export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const FROM = process.env.EMAIL_FROM || "Pariksha Saathi <no-reply@surajpur.nic.in>";

function wrapHtml(bodyHtml: string): string {
  return `<!doctype html>
<html lang="hi">
  <body style="font-family: 'Noto Sans Devanagari', Arial, sans-serif; background:#f4f5fb; margin:0; padding:24px;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:#4338ca;color:#ffffff;padding:16px 24px;font-weight:700;font-size:18px;">
          परीक्षा साथी · जिला शिक्षा विभाग, सूरजपुर
        </td>
      </tr>
      <tr>
        <td style="padding:24px;color:#14162b;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #e6e7f2;color:#6b6f95;font-size:12px;">
          यह एक स्वचालित सूचना है। जिला शिक्षा कार्यालय, सूरजपुर, छत्तीसगढ़।
          <br />इस ईमेल को अनदेखा करें यदि यह आप पर लागू नहीं होता।
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Renders a standard notification template — Hindi-first with an HTML shell and a plain-text fallback. */
export function renderNotification(bodyHtml: string, text: string): { html: string; text: string } {
  return { html: wrapHtml(bodyHtml), text };
}

async function sendViaResend(msg: EmailMessage) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
  }
}

async function sendViaSmtp(msg: EmailMessage) {
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await transport.sendMail({
    from: FROM,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  });
}

function logToConsole(msg: EmailMessage, reason: string) {
  console.log(
    `\n[EMAIL:console] (${reason}) →  ${msg.to}\nSubject: ${msg.subject}\n${msg.text}\n`
  );
}

/**
 * Sends an email through EMAIL_DRIVER ("smtp" | "resend"). Falls back to
 * logging the message to the console when the driver's required
 * credentials aren't configured, so the app runs end-to-end locally
 * without real SMTP/API credentials.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const driver = process.env.EMAIL_DRIVER;

  if (driver === "resend" && process.env.RESEND_API_KEY) {
    return sendViaResend(msg);
  }
  if (driver === "smtp" && process.env.SMTP_HOST) {
    return sendViaSmtp(msg);
  }
  logToConsole(msg, driver ? `${driver} not configured` : "no EMAIL_DRIVER set");
}
