const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log(`[EmailService] Configured with SMTP server: ${host}:${port}`);
    } catch (err) {
      console.warn('[EmailService] Failed to initialize SMTP transporter:', err.message);
      transporter = null;
    }
  } else {
    console.log('[EmailService] No SMTP credentials provided. Emails will be logged to console in dev mode.');
  }
};

initTransporter();

/**
 * Send an invitation email to a user
 */
const sendInviteEmail = async ({ toEmail, inviterName, spaceName, inviteUrl, role }) => {
  const from = process.env.SMTP_FROM || 'SprintFlow Team <no-reply@sprintflow.io>';
  const subject = `${inviterName || 'A teammate'} invited you to join "${spaceName}" on SprintFlow`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #0052cc; letter-spacing: -0.5px; margin-bottom: 24px; }
          h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
          .btn { display: inline-block; background-color: #0052cc; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; }
          .link-box { word-break: break-all; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ SprintFlow</div>
          <h1>You've been invited to join ${spaceName}</h1>
          <p><strong>${inviterName || 'A team administrator'}</strong> has invited you to collaborate on the <strong>${spaceName}</strong> space as a <strong>${role || 'member'}</strong>.</p>
          <p>SprintFlow provides real-time sprint tracking, high-performance architecture whiteboards, and developer tooling to help your team ship faster.</p>
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="btn" target="_blank" rel="noopener noreferrer">Accept Invitation & Join Space</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <div class="link-box">${inviteUrl}</div>
          <div class="footer">
            This invitation link is valid for 7 days. If you were not expecting this invitation, you can safely ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `You've been invited to join "${spaceName}" on SprintFlow by ${inviterName || 'a team admin'}.\n\nAccept your invitation by clicking the link below:\n${inviteUrl}\n\nThis link is valid for 7 days.`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Invitation email delivered to ${toEmail} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] Error sending email via SMTP to ${toEmail}:`, err.message);
      // Fallback
    }
  }

  // Fallback logging for environments without configured SMTP
  console.log(`\n================== [TRANSACTIONAL EMAIL DISPATCH] ==================`);
  console.log(`To: ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Invite URL: ${inviteUrl}`);
  console.log(`===================================================================\n`);
  return { success: true, loggedToConsole: true };
};

module.exports = {
  sendInviteEmail,
};
