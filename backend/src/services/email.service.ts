import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendOTP(contact: string, otp: string, purpose = 'login'): Promise<boolean> {
    // Validate email address
    if (!contact || contact.trim() === '') {
      console.error('❌ No email address provided');
      return false;
    }

    const subject = this.getSubject(purpose);
    const html = this.getOTPTemplate(otp, purpose);

    try {
      await this.transporter.sendMail({
        from: `"KMPDU E-Voting" <${process.env.EMAIL_USER}>`,
        to: contact,
        subject,
        html
      });
      console.log(`✅ OTP sent to ${contact}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      return false;
    }
  }

  private getSubject(purpose: string): string {
    switch (purpose) {
      case 'login': return 'KMPDU E-Voting - Login OTP';
      case 'vote': return 'KMPDU E-Voting - Vote Verification OTP';
      case 'password_reset': return 'KMPDU E-Voting - Password Reset OTP';
      default: return 'KMPDU E-Voting - Verification Code';
    }
  }

  private getOTPTemplate(otp: string, purpose: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">KMPDU E-Voting System</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1f2937; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `;
  }
}

export default new EmailService();