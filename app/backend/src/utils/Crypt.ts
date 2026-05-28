import { AppError } from '../error/AppError.js';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { HttpCode } from './HttpCode.js';

export type EncryptOptions = {
  algorithm: crypto.CipherGCMTypes;
};

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
  deriveKey(salt: Buffer) {
    return crypto.scryptSync(process.env.ENCRYPTION_KEY!, salt, 32);
  }
  encrypt(text: string, opts: EncryptOptions = { algorithm: 'aes-256-gcm' }) {
    const iv = crypto.randomBytes(12);
    const { algorithm } = opts;
    const salt = crypto.randomBytes(16);
    const key = this.deriveKey(salt);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [
      salt.toString('hex'),
      iv.toString('hex'),
      encrypted.toString('hex'),
      authTag.toString('hex'),
    ].join(':');
  }
  decrypt(text: string, opts: EncryptOptions = { algorithm: 'aes-256-gcm' }) {
    const { algorithm } = opts;
    const [saltHex, ivHex, encryptedHex, authTagHex] = text.split(':');

    if (!saltHex || !ivHex || !encryptedHex || !authTagHex) {
      throw new AppError('Invalid encrypted payload', HttpCode.INTERNAL_SERVER_ERROR);
    }
    const salt = Buffer.from(saltHex, 'hex');
    const key = this.deriveKey(salt);
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString();
  }
  generateHashCode(bytesLength = 4) {
    return crypto.randomBytes(bytesLength).toString('hex');
  }
}

const instance = new Crypt();
export { instance as Crypt };
