import { GoogleApi } from '../integration/GoogleApi';
import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer/index';
import { Crypt } from './Crypt';
import { IntegrationsService } from '../services/IntegrationsService';
import MailComposer from 'nodemailer/lib/mail-composer';
import { RequestUtil } from './RequestUtil';

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
    return { transporter, sender: null, user };
  }
  async getGmailCredentials() {
    const { client } = await GoogleApi.getClient('gmail');
    const credentials = await IntegrationsService.find('gmail');
    if (!credentials || !credentials.encryptedRefreshToken) {
      throw new Error('Credenciais não encontradas para integração com Gmail');
    }
    const {
      clientId,
      encryptedClientSecret,
      encryptedRefreshToken,
      mailFrom: user,
      mailSenderName,
    } = credentials;
    const clientSecret = Crypt.decrypt(encryptedClientSecret);
    const refreshToken = Crypt.decrypt(encryptedRefreshToken);
    client.setCredentials({
      refresh_token: refreshToken || null,
    });

    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse.token;
    if (!accessToken) {
      throw new Error('Failed to obtain access token for Gmail integration');
    }

    return { clientId, clientSecret, refreshToken, user, mailSenderName, accessToken };
  }
  async customGmailTransporter() {
    const { accessToken, mailSenderName, user } = await this.getGmailCredentials();
    const transporter = {
      sendMail: async (mailOptions: SendMailOptions) => {
        const mail = new MailComposer(mailOptions);
        const raw = await mail.compile().build();

        const encoded = raw
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        await RequestUtil.send(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            data: {
              raw: encoded,
            },
          },
        );
      },
    };
    return {
      transporter,
      sender: mailSenderName,
      user,
    };
  }

  async createTransporter() {
    switch (process.env.MAIL_PROVIDER) {
      case 'GMAIL':
        return this.customGmailTransporter();
      default:
        return this.createGenericTransporter();
    }
  }

  async sendMail({ body, subject, to, attachments = [] }: SMTPOpts) {
    try {
      const {
        transporter: emailTransporter,
        sender,
        user,
      } = await this.createTransporter();
      if (!user) {
        throw new Error('Falha ao buscar e-mail de usuário');
      }
      const mailOptions: SendMailOptions = {
        from: user,
        to: to || user,
        subject: subject,
        html: body,
        attachments,
      };
      if (sender) {
        mailOptions.sender = sender;
      }

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
