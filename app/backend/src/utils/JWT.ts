import type { TokenData } from '@types';
import jwt, { type JwtPayload } from 'jsonwebtoken';

class JWT {
  generate(tokenData: JwtPayload = {}, options: jwt.SignOptions = {}) {
    const { SECRET_KEY = '' } = process.env;
    return jwt.sign(tokenData, SECRET_KEY, { expiresIn: '1d', ...options });
  }

  isValidTokenPayload(token: JwtPayload | string | null | any): token is TokenData {
    return typeof token === 'object' && token !== null && token.user;
  }

  validate(token: string): TokenData | null {
    const { SECRET_KEY = '' } = process.env;
    try {
      const payload = jwt.verify(token, SECRET_KEY, (err, data) => {
        if (err?.message.includes('jwt expired')) {
          return null;
        }
        if (err) {
          throw err;
        }
        return data;
      });
      if (!this.isValidTokenPayload(payload)) {
        return null;
      }
      return payload;
    } catch (error) {
      // console.error(error);
      return null;
    }
  }
}

const instance = new JWT();
export { instance as JWT };
