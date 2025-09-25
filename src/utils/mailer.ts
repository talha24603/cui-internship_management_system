import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(port) === "465",
    auth: { user, pass },
  } as SMTPTransport.Options);
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.APP_URL || 'https://ef3198d5ea9b416c9765f57ee606d2ab.serveo.net'}/api/auth/verify-email?token=${token}`;

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP env vars missing; skipping email send.");
    return;
  }

  await transporter.sendMail({
    from: `"CUI Bio-internship" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your email - CUI Bio-internship",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to CUI Bio-internship!</h2>
        <p>Thank you for registering. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
