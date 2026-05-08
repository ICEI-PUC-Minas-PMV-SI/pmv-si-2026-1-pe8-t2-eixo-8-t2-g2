import dotenv from 'dotenv';
import path from 'node:path';
import os from 'node:os';

const backendPath = path.dirname(path.join(process.argv[1] || '', '..'));

class Env {
  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config({ path: path.join(backendPath, '.env'), quiet: true });
    }
  }

  get(key: string, defaultValue: string | null = null): string {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue || '';
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  getServerUrl(): string {
    return `http://localhost:${this.get('SRV_PORT') || 3000}`;
  }

  getTempDir(): string {
    if (this.isDevelopment()) return path.join(backendPath, 'temp');
    return os.tmpdir();
  }

  getBackendPath() {
    return backendPath;
  }
}

const instance = new Env();
export { instance as Env };
