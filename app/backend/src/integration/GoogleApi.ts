import { GoogleService } from '../services/GoogleService';
import type { GoogleCredentials } from '@types';
import { Crypt } from '../utils/Crypt';
import { Env } from '../utils/Env';
import type { IntegrationType } from '../generated/prisma/enums';
import type { Credentials } from 'google-auth-library';
// import { google } from 'googleapis';

export const INTEGRATION = {
  CALENDAR: 'calendar',
  GMAIL: 'gmail',
} as const;

class GoogleApi {
  config = {
    calendar: {
      redirectUri: '/google-calendar/oauth2callback',
      clientId: Env.get('GOOGLE_CALENDAR_ID') || '',
      clientSecret: Env.get('GOOGLE_CALENDAR_SECRET') || '',
      options: {
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
      },
    },
    gmail: {
      redirectUri: '/gmail/oauth2callback',
      clientId: Env.get('MAIL_ID') || '',
      clientSecret: Env.get('MAIL_SECRET') || '',
      options: {
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://mail.google.com/'],
      },
    },
    // all: {
    //   redirectUri: '/google/oauth2callback',
    //   clientId: Env.get('GOOGLE_ALL_ID') || '',
    //   clientSecret: Env.get('GOOGLE_ALL_SECRET') || '',
    //   options: {
    //     access_type: 'offline',
    //     prompt: 'consent',
    //     scope: ['https://www.googleapis.com/auth/calendar', 'https://mail.google.com/'],
    //   },
    // },
  };

  getCredentials(integrationType: IntegrationType) {
    const { redirectUri, clientId, clientSecret } = this.config[integrationType];
    return {
      clientId,
      clientSecret,
      redirectUri: `${Env.getServerUrl()}${redirectUri}`,
    };
  }

  async getClient(integration: IntegrationType) {
    const { clientId, clientSecret, redirectUri } = this.getCredentials(integration);
    const { google } = await import('googleapis');
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const result = await GoogleService.getCredentials(integration);
    let oldAccessToken = null;
    let credentialId = null;
    if (result) {
      const { id, encryptedAccessToken, encryptedRefreshToken } = result;
      const accessToken = Crypt.decrypt(encryptedAccessToken);
      const refreshToken = Crypt.decrypt(encryptedRefreshToken);
      oldAccessToken = accessToken;
      credentialId = id;
      client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
    const { token: accessToken } = await client.getAccessToken().catch((err) => {
      console.error(err);
      return { token: null };
    });
    if (credentialId && accessToken && accessToken !== oldAccessToken) {
      await GoogleService.updateCredential(credentialId, {
        encryptedAccessToken: Crypt.encrypt(accessToken),
      });
    }
    return { client, accessToken: accessToken || '' };
  }

  async getAuthUrl(integrationType: IntegrationType) {
    const { options } = this.config[integrationType];
    const { client } = await this.getClient(integrationType);
    return client.generateAuthUrl(options);
  }

  async getTokens(code: string, integrationType: IntegrationType) {
    const { client } = await this.getClient(integrationType);
    const result = await client.getToken(code);
    client.setCredentials(result.tokens);
    return result.tokens;
  }

  validateTokens(tokens: Credentials): GoogleCredentials | null {
    const {
      access_token: accessToken,
      id_token,
      token_type: tokenType,
      refresh_token: refreshToken,
    } = tokens;
    if (accessToken && tokenType && refreshToken) {
      return {
        accessToken,
        refreshToken,
        tokenId: id_token || 'empty_id',
        tokenType,
      };
    }
    return null;
  }
}

const instance = new GoogleApi();
export { instance as GoogleApi };
