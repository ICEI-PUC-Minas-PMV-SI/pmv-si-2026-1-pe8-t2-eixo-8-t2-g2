import winston from 'winston';
import path from 'node:path';
import fs from 'node:fs';
import { Env } from '../utils/Env.js';

export class Logger {
  // Cache de instâncias por contexto - evita criar múltiplas instâncias
  private static instances = new Map<string, Logger>();
  private logger: winston.Logger;
  private source: string;

  constructor(source: string = 'SyncClient') {
    this.source = source;
    this.logger = this.createLogger();
  }

  /**
   * Factory method otimizado - retorna instância cached
   * Usado pelo decorator para obter logger com contexto específico
   */
  static getContextLogger(context: string): Logger {
    if (!this.instances.has(context)) {
      this.instances.set(context, new Logger(context));
    }
    return this.instances.get(context)!;
  }

  /**
   * Métodos estáticos para uso direto (sem decorator)
   */
  static info(message: string, context: string = 'App', meta?: any): void {
    this.getContextLogger(context).info(message, meta);
  }

  static error(message: string, context: string = 'App', meta?: any): void {
    this.getContextLogger(context).error(message, meta);
  }

  static warn(message: string, context: string = 'App', meta?: any): void {
    this.getContextLogger(context).warn(message, meta);
  }

  static debug(message: string, context: string = 'App', meta?: any): void {
    this.getContextLogger(context).debug(message, meta);
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss',
      }),
      winston.format.printf(({ timestamp, level, message, source, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${source || this.source}] ${level}: ${message} ${metaStr}`;
      }),
    );

    // Console sempre ativo
    transports.push(
      new winston.transports.Console({
        format:
          process.env.NODE_ENV === 'production' ? winston.format.json() : consoleFormat,
      }),
    );

    // Arquivos apenas fora da Vercel
    const isVercel = process.env.VERCEL === '1';

    if (!isVercel) {
      const logsDir = path.join(process.cwd(), 'logs');

      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'sync-client.log'),
        }),
      );

      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
        }),
      );
    }

    return transports;
  }

  private createLogger(): winston.Logger {
    return winston.createLogger({
      level: Env.get('LOG_LEVEL', 'debug'),
      defaultMeta: { source: this.source },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: this.createTransports(),
    });
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  async clearLogs(): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      const files = ['sync-client.log', 'error.log'];

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        if (fs.existsSync(filePath)) {
          await fs.promises.writeFile(filePath, '');
        }
      }

      this.info('Logs limpos com sucesso');
    } catch (error) {
      this.error('Erro ao limpar logs:', error);
    }
  }
}
