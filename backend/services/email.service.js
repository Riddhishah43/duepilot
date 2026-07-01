const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = {
      sendMail: async (opts) => {
        console.log("[DEV EMAIL]", opts.to, opts.subject);
        console.log(opts.text || opts.html);
        return { messageId: "dev-" + Date.now() };
      },
    };
  }
  return transporter;
}

async function sendPasswordResetEmail(to, resetToken) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/auth?tab=login&resetToken=${resetToken}`;

  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@duepilot.com",
    to,
    subject: "DuePilot - Password Reset Request",
    text: `You requested a password reset.\n\nClick this link to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #355872;">DuePilot Password Reset</h2>
      <p>You requested a password reset.</p>
      <p><a href="${resetLink}" style="display: inline-block; background: #355872; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Reset Password</a></p>
      <p style="color: #666; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>`,
  });
}

module.exports = { sendPasswordResetEmail };
