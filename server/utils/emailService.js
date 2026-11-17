import nodemailer from 'nodemailer';
import { logger } from './logger.js';

let customTransporter = null;

/**
 * Configure or override the nodemailer transporter (used in testing).
 * Pass null to restore default SMTP transporter creation.
 */
export function setEmailTransporter(transporter) {
  customTransporter = transporter;
}

/**
 * Check if outbound email delivery is configured.
 */
export function isEmailConfigured() {
  if (customTransporter) return true;
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Get active nodemailer transporter.
 */
function getTransporter() {
  if (customTransporter) {
    return customTransporter;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Send an email through the configured SMTP transport.
 * 
 * Returns an object with:
 * - success: boolean
 * - status: 'ACCEPTED' | 'NOT_CONFIGURED' | 'SEND_FAILED'
 * - messageId: string (if accepted by transport)
 * - error: string (if failed)
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      error: 'Outbound email delivery is not configured on this server.',
    };
  }

  const from = process.env.EMAIL_FROM || '"Soch College IT Grievance Portal" <noreply@sochcollege.edu.np>';

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    // Note: Logging only recipient email and messageId. Never log tokens or secrets.
    logger.info(`[Email Service] Message accepted by SMTP relay for recipient: ${to} (MessageId: ${info.messageId})`);

    return {
      success: true,
      status: 'ACCEPTED',
      messageId: info.messageId,
      response: info.response,
    };
  } catch (err) {
    logger.error(`[Email Service] SMTP transport failed for recipient ${to}: ${err.message}`);
    return {
      success: false,
      status: 'SEND_FAILED',
      error: err.message,
    };
  }
}

/**
 * Send 6-digit student verification code email.
 */
export async function sendVerificationEmail({ to, studentName, token }) {
  const subject = 'Verify your email — Soch College of IT Complaint Portal';
  const text = `Hello ${studentName || 'Student'},

Your email verification code for the Soch College of IT IT Complaint Portal is:

${token}

This code will expire in 24 hours.

If you did not request this account, please ignore this email.

— Central Grievance Redressal Cell
Soch College of IT, Pokhara`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B;">
  <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);">
    <div style="border-bottom: 2px solid #15365B; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="color: #15365B; margin: 0; font-size: 20px; font-weight: 700;">Soch College of IT</h2>
      <p style="color: #64748B; margin: 4px 0 0 0; font-size: 13px;">Student IT Grievance Redressal Portal</p>
    </div>
    <p style="font-size: 15px; line-height: 1.5; color: #334155;">Hello <strong>${studentName || 'Student'}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">Please use the following 6-digit verification code to activate your student account:</p>
    <div style="text-align: center; margin: 28px 0;">
      <span style="display: inline-block; background-color: #EEF4F9; color: #15365B; border: 1px solid #C8D7E6; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; border-radius: 6px;">
        ${token}
      </span>
    </div>
    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">This code will expire in <strong>24 hours</strong>. If you did not create an account on this portal, please disregard this email.</p>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
      <p style="margin: 0;">Central Grievance Redressal Cell &bull; Soch College of IT, Pokhara, Nepal</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, text, html });
}

/**
 * Send password reset code email.
 */
export async function sendPasswordResetEmail({ to, studentName, token }) {
  const subject = 'Password Reset Code — Soch College of IT Complaint Portal';
  const text = `Hello ${studentName || 'Student'},

A request was received to reset your password for the Soch College of IT Complaint Portal.

Your password reset code is:

${token}

This code will expire in 1 hour.

If you did not request a password reset, please contact the campus IT desk immediately.

— Central Grievance Redressal Cell
Soch College of IT, Pokhara`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B;">
  <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);">
    <div style="border-bottom: 2px solid #15365B; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="color: #15365B; margin: 0; font-size: 20px; font-weight: 700;">Soch College of IT</h2>
      <p style="color: #64748B; margin: 4px 0 0 0; font-size: 13px;">Student IT Grievance Redressal Portal</p>
    </div>
    <p style="font-size: 15px; line-height: 1.5; color: #334155;">Hello <strong>${studentName || 'Student'}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">A request was received to reset your password. Use the code below to proceed:</p>
    <div style="text-align: center; margin: 28px 0;">
      <span style="display: inline-block; background-color: #FEF3C7; color: #854D0E; border: 1px solid #FDE68A; font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; border-radius: 6px;">
        ${token}
      </span>
    </div>
    <p style="font-size: 13px; color: #64748B; line-height: 1.5;">This code is valid for <strong>1 hour</strong>. If you did not request this change, your account may be compromised; please notify the IT desk.</p>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
      <p style="margin: 0;">Central Grievance Redressal Cell &bull; Soch College of IT, Pokhara, Nepal</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, text, html });
}
