import type { NotificationLevel } from './types.js';

const COLORS: Record<NotificationLevel, string> = {
  info: '\x1b[36m',
  success: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

export class Logger {
  private readonly prefix: string;

  constructor(prefix = 'vraxia') {
    this.prefix = prefix;
  }

  log(level: NotificationLevel, message: string, data?: unknown): void {
    const color = COLORS[level];
    const ts = new Date().toISOString();
    const tag = `[${this.prefix}:${level}]`;
    const line = data
      ? `${color}${ts} ${tag}${RESET} ${message} ${JSON.stringify(data)}`
      : `${color}${ts} ${tag}${RESET} ${message}`;
    process.stderr.write(line + '\n');
  }

  info(msg: string, data?: unknown): void { this.log('info', msg, data); }
  success(msg: string, data?: unknown): void { this.log('success', msg, data); }
  warn(msg: string, data?: unknown): void { this.log('warn', msg, data); }
  error(msg: string, data?: unknown): void { this.log('error', msg, data); }
}
