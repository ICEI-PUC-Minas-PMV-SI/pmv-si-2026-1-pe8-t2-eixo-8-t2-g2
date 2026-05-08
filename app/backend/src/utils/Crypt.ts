import { AppError } from '../error/AppError';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { HttpCode } from './HttpCode';

export type EncryptOptions = {
  algorithm: crypto.CipherGCMTypes;
};

const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

class Crypt {
  async hash(text: string): Promise<string> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(text, saltRounds);
    return hash;
  }
  async isValidHash(plainText: string, encryptedText: string): Promise<boolean> {
    const isValid = await bcrypt.compare(plainText, encryptedText);
    return isValid;
  }
  encrypt(text: string, opts: EncryptOptions = { algorithm: 'aes-256-gcm' }) {
    const iv = crypto.randomBytes(16);
    const { algorithm } = opts;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
  decrypt(text: string, opts: EncryptOptions = { algorithm: 'aes-256-gcm' }) {
    const { algorithm } = opts;
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) {
      throw new AppError('Invalid ivHex or encryptedHex', HttpCode.INTERNAL_SERVER_ERROR);
    }
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString();
  }
  generateHashCode(bytesLength = 4) {
    return crypto.randomBytes(bytesLength).toString('hex');
  }
}

const instance = new Crypt();
export { instance as Crypt };
