import Anthropic from '@anthropic-ai/sdk';
import type { AgentConfig, AgentResult } from './types.js';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';

// Haiku pricing (per 1M tokens, USD)
const HAIKU_INPUT_PRICE = 0.80;
const HAIKU_OUTPUT_PRICE = 4.00;

export abstract class BaseAgent {
  protected readonly client: Anthropic;
  protected readonly model: string;
  protected readonly maxTokens: number;
  protected readonly systemPrompt: string;

  constructor(config: AgentConfig) {
    this.client = config.client;
    this.model = config.model ?? HAIKU_MODEL;
    this.maxTokens = config.maxTokens ?? 1024;
    this.systemPrompt = config.systemPrompt ?? '';
  }

  protected async complete(userMessage: string): Promise<AgentResult<string>> {
    const start = Date.now();
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: [
          {
            type: 'text',
            text: this.systemPrompt,
            // @ts-expect-error — cache_control is valid but not yet in SDK types
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('');

      const usage = response.usage;
      const inputTokens = usage.input_tokens;
      const outputTokens = usage.output_tokens;
      const estimatedCostUsd =
        (inputTokens / 1_000_000) * HAIKU_INPUT_PRICE +
        (outputTokens / 1_000_000) * HAIKU_OUTPUT_PRICE;

      return {
        success: true,
        data: text,
        tokenUsage: { inputTokens, outputTokens, estimatedCostUsd },
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      };
    }
  }
}
