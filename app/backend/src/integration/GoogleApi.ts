import type { GoogleCredentials } from '@types';
import { Crypt } from '../utils/Crypt';
import { Env } from '../utils/Env';
import type { IntegrationType } from '../generated/prisma/enums';
import { IntegrationsService } from 'services/IntegrationsService';
import { Logger } from '../logger/Logger';
import type { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';

export const INTEGRATION = {
  CALENDAR: 'calendar',
  GMAIL: 'gmail',
} as const;

class GoogleApi {
  config = {
    calendar: {
      redirectUri: '/google-calendar/webhook',
      options: {
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events.owned'],
      },
    },
    gmail: {
      redirectUri: '/gmail/webhook',
      options: {
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
      },
    },
    all: {
      redirectUri: '/google/webhook',
      options: {
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar.events.owned',
          'https://www.googleapis.com/auth/gmail.send',
        ],
      },
    },
  };

  async getClient(integration: IntegrationType) {
    const redirectUri = `${Env.getServerUrl()}${this.config[integration].redirectUri}`;
    const result = await IntegrationsService.find(integration);
    if (result) {
      const clientSecret = Crypt.decrypt(result.encryptedClientSecret);
      const refreshToken = result.encryptedRefreshToken
        ? Crypt.decrypt(result.encryptedRefreshToken)
        : '';

      const client = new OAuth2Client(result.clientId, clientSecret, redirectUri);
      let accessToken = '';
      if (refreshToken) {
        client.setCredentials({
          refresh_token: refreshToken,
        });
        const { token } = await client.getAccessToken().catch((err) => {
          Logger.error(`Failed to get access token: ${err.message}`);
          return { token: null };
        });
        accessToken = token || '';
      }
      return { client, accessToken };
    }
    throw new Error('Integração com google não configurada');
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
