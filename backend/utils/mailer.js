import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { logger } from "../config/logger.js";

const realTransport = Boolean(config.SMTP_HOST);

const transport = realTransport
  ? nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const sendMail = async ({ to, subject, text, html }) => {
  const info = await transport.sendMail({ from: config.MAIL_FROM, to, subject, text, html });
  logger.info({ to, subject, delivered: realTransport, messageId: info.messageId }, realTransport ? "email sent" : "email logged (no SMTP configured)");
  return info;
};

// Registration must never fail or slow down because the mail server is down:
// fire the email in the background and just log if it fails.
export const sendInBackground = (promise) =>
  promise.catch((err) => logger.error({ err: err.message }, "email failed"));