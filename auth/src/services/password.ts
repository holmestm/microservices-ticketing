import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [storedHash, storedSalt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, storedSalt, 64)) as Buffer;

    const suppliedHash = buf.toString('hex');
    return suppliedHash === storedHash;
  }
}
