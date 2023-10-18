import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/User.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendForgotPasswordEmail(email: string, emailContent: string) {
    const subject = 'Reset Password';
    // const resetLink = `http://192.168.1.4:3000/authentication/repassword?token=${resetToken}`;

    // const html = `
    //   <p>Hello!</p>
    //   <p>You have requested to reset your password. Please click the link below to reset it:</p>
    //   <p><a href='${resetLink}'>Reset Password</a></p>
    //   <p>If you did not request this, please ignore this email.</p>
    // `;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html: emailContent, // Menggunakan emailContent yang telah diberikan
    });
  }

  async sendRandomPasswordEmail(email: string, randomPassword: string) {
    const subject = 'Your Password';

    const html = `
      <p>Dear user,</p>
      <p>Your random password is: </p>
      <h2>${randomPassword}</h2>
      <p>Please use this password to log in and consider changing it in your profile settings.</p>
      <p>If you did not request a random password, please contact our support team.</p>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
