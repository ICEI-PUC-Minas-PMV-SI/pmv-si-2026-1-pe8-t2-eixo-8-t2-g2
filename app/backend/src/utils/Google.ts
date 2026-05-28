// import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { OAuth2Client } from 'google-auth-library';
import { Env } from './Env.js';

class Google {
  async verifyToken(token: string) {
    const clientId = Env.get('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    return payload;
  }
}

const instance = new Google();
export { instance as Google };
export default instance;
