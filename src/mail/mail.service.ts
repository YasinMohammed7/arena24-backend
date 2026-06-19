import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get("SMTP_HOST"),
      port: config.get<number>("SMTP_PORT"),
      secure: true,
      auth: {
        user: config.get("SMTP_USER"),
        pass: config.get("SMTP_PASS"),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${this.config.get("APP_URL")}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.config.get("FROM_EMAIL"),
      to,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, ignore this email.</p>
      `,
    });
  }

  async sendVerificationCode(contact: string, code: string): Promise<void> {
    // Implementation depends on your mail service setup
    // This is a basic example - adapt to your existing mail service
    console.log(`Sending verification code ${code} to email: ${contact}`);

    // Example implementation (adapt to your existing mail service):
    await this.transporter.sendMail({
      from: this.config.get("FROM_EMAIL"),
      to: contact,
      subject: "Verification Code",
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    });
  }
}
