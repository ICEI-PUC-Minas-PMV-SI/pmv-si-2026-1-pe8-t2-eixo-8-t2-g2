import crypto from 'crypto';
import { TOTP } from 'otpauth';
import base32Encode from 'base32-encode';
import ms from 'ms';
import { Prisma } from '../db/Prisma';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

class OTPUtil {
  generateSecret(input?: string, length: number = 32): string {
    let buffer: Buffer;

    if (input) {
      const hash = crypto.createHash('sha256').update(input).digest();
      buffer = Buffer.alloc(length);
      for (let i = 0; i < length; i++) {
        const hashValue = hash[i % hash.length];
        if (hashValue) buffer[i] = hashValue;
      }
    } else {
      buffer = crypto.randomBytes(length);
    }

    return base32Encode(buffer, 'RFC4648').replace(/=/g, '');
  }

  generate(secret: string, period: number = 30): string {
    const totp = new TOTP({
      secret,
      algorithm: 'SHA1',
      digits: 6,
      period,
    });
    return totp.generate();
  }

  verify(
    token: string,
    secret: string,
    period: number = 30,
    window: number = 1,
  ): boolean {
    const totp = new TOTP({
      secret,
      algorithm: 'SHA1',
      digits: 6,
      period,
    });
    const delta = totp.validate({ token, window });
    return delta !== null;
  }

  generateAuthURL(account: string = 'Isabella Cáster', period: ms.StringValue = '30s') {
    const { TOTP_ISSUER: issuer = '' } = process.env;
    const secret = this.generateSecret();
    const totp = new TOTP({
      issuer,
      label: account,
      secret,
      algorithm: 'SHA1',
      digits: 6,
      period: ms(period) / 1000,
    });
    return { url: totp.toString(), secret };
  }

  hashRecoveryCode(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  generateRecoveryCode(length = 8) {
    const bytes = crypto.randomBytes(length);

    let result = '';

    for (let i = 0; i < length; i++) {
      result += CHARS[bytes[i]! % CHARS.length];
    }

    return result;
  }

  async generateRecoveryCodes(amount = 8) {
    const prisma = await Prisma.getClient();
    const maxAttempt = 10;
    const codeList = [] as { code: string; hash: string }[];
    for (let i = 0; i < amount; i++) {
      for (let j = 0; j < maxAttempt; j++) {
        const code = this.generateRecoveryCode();
        const hash = this.hashRecoveryCode(code);
        const exists = await prisma.recoveryCode.findUnique({
          where: {
            codeHash: hash,
          },
        });
        if (exists && j === maxAttempt - 1) {
          throw new Error('Failed to generate unique codes');
        }
        if (!exists) {
          codeList.push({
            code,
            hash,
          });
          break;
        }
      }
    }
    return codeList;
  }
}

const instance = new OTPUtil();

export { instance as OTPUtil };
