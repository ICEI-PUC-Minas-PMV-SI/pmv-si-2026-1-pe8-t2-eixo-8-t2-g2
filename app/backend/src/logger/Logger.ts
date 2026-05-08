import winston from 'winston';
import path from 'node:path';
import fs from 'node:fs';
import type { LogEntry } from '@types';
import { Env } from '../utils/Env';

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

  private createLogger(): winston.Logger {
    const logsDir = path.join(process.cwd(), 'logs');

    // Cria diretório de logs se não existir
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

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

    return winston.createLogger({
      level: Env.get('LOG_LEVEL', 'debug'),
      format: logFormat,
      defaultMeta: { source: this.source },
      transports: [
        // Console transport - sempre ativo em desenvolvimento
        new winston.transports.Console({
          format: consoleFormat,
          level: Env.get('LOG_LEVEL', 'debug'),
          handleExceptions: false, // Será tratado pelo EventManager
          handleRejections: false, // Será tratado pelo EventManager
        }),

        // File transport para todos os logs
        new winston.transports.File({
          filename: path.join(logsDir, 'sync-client.log'),
          maxsize: this.parseSize(Env.get('LOG_MAX_SIZE', '10MB')),
          maxFiles: Number(Env.get('LOG_MAX_FILES', '5')),
          tailable: true,
        }),

        // File transport para erros
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: this.parseSize(Env.get('LOG_MAX_SIZE', '10MB')),
          maxFiles: Number(Env.get('LOG_MAX_FILES', '5')),
          tailable: true,
        }),
      ],
    });
  }

  private parseSize(sizeStr: string): number {
    const units: { [key: string]: number } = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([A-Z]+)$/i);
    if (!match || !match[1] || !match[2]) return 10 * 1024 * 1024; // 10MB default

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    return value * (units[unit] || 1024 * 1024);
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

  async getRecentLogs(count: number = 100): Promise<LogEntry[]> {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logsDir, 'sync-client.log');

      if (!fs.existsSync(logFile)) {
        return [];
      }

      const data = await fs.promises.readFile(logFile, 'utf8');
      const lines = data.split('\n').filter((line: string) => line.trim());

      // Pega as últimas N linhas
      const recentLines = lines.slice(-count);

      return recentLines.map((line: string) => {
        try {
          const logEntry = JSON.parse(line);
          return {
            timestamp: new Date(logEntry.timestamp),
            level: logEntry.level,
            message: logEntry.message,
            data: logEntry,
            source: logEntry.source || this.source,
          };
        } catch {
          return {
            timestamp: new Date(),
            level: 'info',
            message: line,
            source: this.source,
          };
        }
      });
    } catch (error) {
      this.error('Erro ao obter logs recentes:', error);
      return [];
    }
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
