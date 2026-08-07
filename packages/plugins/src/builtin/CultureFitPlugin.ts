import Anthropic from '@anthropic-ai/sdk';
import type { PluginInterface, PluginContext, PluginResult } from '../PluginInterface.js';

export class CultureFitPlugin implements PluginInterface {
  readonly name = 'culture-fit';
  readonly description = 'Analyzes cultural alignment between candidate and company based on job description signals';

  async execute(ctx: PluginContext): Promise<PluginResult> {
    const prompt = `Analyze cultural fit between this candidate and company.

Job: ${ctx.job.title} at ${ctx.job.company}
Description: ${ctx.job.description ?? 'No description provided'}

Candidate: ${ctx.candidateProfile}

Output JSON: { "score": 0-100, "signals": ["positive signal 1", ...], "risks": ["risk 1", ...], "recommendation": "apply|caution|skip" }`;

    try {
      const response = await ctx.ai.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('');

      const costUsd =
        response.usage.input_tokens * (0.80 / 1_000_000) +
        response.usage.output_tokens * (4.00 / 1_000_000);

      const data = JSON.parse(text) as Record<string, unknown>;
      return { success: true, data, costUsd };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
