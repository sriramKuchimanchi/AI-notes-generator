import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"AI Notes" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your AI Notes password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 16px; margin-bottom: 12px;">
            <span style="font-size: 24px;">📓</span>
          </div>
          <h1 style="color: #1f2937; font-size: 22px; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin-top: 0;">You requested a password reset for your AI Notes account. Click the button below to set a new password.</p>
          <a href="${resetUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">Reset Password</a>
          <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
}