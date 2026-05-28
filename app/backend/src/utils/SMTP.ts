import nodemailer from 'nodemailer';
import type { TransportOptions, SendMailOptions } from 'nodemailer';
// import { google } from 'googleapis';
import type { Attachment } from 'nodemailer/lib/mailer/index';

export type SMTPOpts = {
  subject: string;
  body: string;
  attachments: Attachment[];
  to: string;
};

class SMTP {
  async createGenericTransporter() {
    const {
      SMTP_HOST: host,
      SMTP_PORT: port,
      SMTP_USER: user,
      SMTP_PASS: pass,
      SMTP_SECURE: secure,
    } = process.env;

    const auth = user && pass ? { user, pass } : undefined;

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: secure === 'true',
      auth,
    });
    return transporter;
  }
  async createGmailTransporter() {
    const {
      MAIL_ID: clientId,
      MAIL_SECRET: clientSecret,
      MAIL_REFRESH_TOKEN: refreshToken,
      MAIL_FROM: user,
    } = process.env;

    try {
      const { google } = await import('googleapis');
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

      oauth2Client.setCredentials({
        refresh_token: refreshToken || null,
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(token);
        });
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user,
          accessToken,
          clientId,
          clientSecret,
          refreshToken,
        },
      } as TransportOptions);
      return transporter;
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async createTransporter() {
    switch (process.env.MAIL_PROVIDER) {
      case 'GMAIL':
        return this.createGmailTransporter();
      default:
        return this.createGenericTransporter();
    }
  }

  async sendMail({ body, subject, to, attachments = [] }: SMTPOpts) {
    const { MAIL_FROM } = process.env;

    try {
      const mailOptions: SendMailOptions = {
        from: MAIL_FROM,
        to,
        subject: subject,
        html: body,
        attachments,
      };

      const emailTransporter = await this.createTransporter();
      await emailTransporter.sendMail(mailOptions);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
      console.log(err);
      return Promise.reject(err);
    }
  }
}

const instance = new SMTP();
export { instance as SMTP };
