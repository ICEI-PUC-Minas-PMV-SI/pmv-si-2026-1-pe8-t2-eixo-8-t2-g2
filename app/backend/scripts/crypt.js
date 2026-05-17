import crypto from 'node:crypto';
import dotenv from 'dotenv';
dotenv.config({
  path: '../.env'
});

const deriveKey = (salt) => {
  return crypto.scryptSync(process.env.ENCRYPTION_KEY, salt, 32);
}
const encrypt = (text, opts = { algorithm: 'aes-256-gcm' }) => {
  const iv = crypto.randomBytes(12);
  const { algorithm } = opts;
  const salt = crypto.randomBytes(16);
  const key = deriveKey(salt);
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
const decrypt = (text, opts = { algorithm: 'aes-256-gcm' }) => {
  const { algorithm } = opts;
  const [saltHex, ivHex, encryptedHex, authTagHex] = text.split(':');

  if (!saltHex || !ivHex || !encryptedHex || !authTagHex) {
    throw new AppError('Invalid encrypted payload', HttpCode.INTERNAL_SERVER_ERROR);
  }
  const salt = Buffer.from(saltHex, 'hex');
  const key = deriveKey(salt);
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString();
}

const [_, __, arg1, arg2] = process.argv;
if (arg1 && ['-d', '--decrypt'].includes(arg1)) {
  console.log(decrypt(arg2));
}
if (arg2 && ['-d', '--decrypt'].includes(arg2)) {
  console.log(decrypt(arg1));
}

if (arg1 && ['-e', '--encrypt'].includes(arg1)) {
  console.log(encrypt(arg2));
}
if (arg2 && ['-e', '--encrypt'].includes(arg2)) {
  console.log(encrypt(arg1));
}
