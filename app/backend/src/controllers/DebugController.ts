import { AppError } from '../error/AppError.js';
import type { DebugMailData } from '../@types/index.js';
import { OTPTemplate } from '../templates/email/OTPTemplate.js';
import type { Attachment } from 'nodemailer/lib/mailer/index';
import { HttpCode } from '../utils/HttpCode.js';
import { SMTP } from '../utils/SMTP.js';
class DebugController {
  async sendMail(data: DebugMailData) {
    const email = {
      template: '',
      attachemnts: [] as Attachment[],
    };
    let subject = 'Debug Test';
    switch (data.template) {
      case 'otp':
        const otpValue = data.value?.otp || '123456';
        const { template, attachments } = OTPTemplate.buildOTP(otpValue);
        email.template = template;
        email.attachemnts = attachments;
        subject = `${otpValue} - Código de recuperação de senha`;
        break;
      default:
        throw new AppError(
          `Invalid email template: ${data.template}`,
          HttpCode.BAD_REQUEST,
        );
    }
    await SMTP.sendMail({
      body: email.template,
      subject,
      to: data.email,
      attachments: email.attachemnts,
    });
  }
}

const instance = new DebugController();
export { instance as DebugController };
