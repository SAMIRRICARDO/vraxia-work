export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export class TelegramNotifier {
  private readonly config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
  }

  static fromEnv(): TelegramNotifier | null {
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    const chatId = process.env['TELEGRAM_CHAT_ID'];
    if (!botToken || !chatId) return null;
    return new TelegramNotifier({ botToken, chatId });
  }

  async send(message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
    const body = JSON.stringify({
      chat_id: this.config.chatId,
      text: message,
      parse_mode: 'Markdown',
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Telegram API error ${response.status}: ${text}`);
    }
  }

  async sendSummary(title: string, lines: string[]): Promise<void> {
    const message = `*${title}*\n\n${lines.map(l => `• ${l}`).join('\n')}`;
    await this.send(message);
  }
}
