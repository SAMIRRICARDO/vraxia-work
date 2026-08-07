import Anthropic from '@anthropic-ai/sdk';
import type { PluginInterface, PluginContext, PluginResult } from '../PluginInterface.js';

export class SalaryAdvisorPlugin implements PluginInterface {
  readonly name = 'salary-advisor';
  readonly description = 'Suggests salary range and negotiation strategy based on job and market data';

  async execute(ctx: PluginContext): Promise<PluginResult> {
    const prompt = `Given this job and candidate, suggest a salary negotiation strategy.

Job: ${ctx.job.title} at ${ctx.job.company}
${ctx.job.location ? `Location: ${ctx.job.location}` : ''}
${ctx.job.salary ? `Listed salary: ${ctx.job.salary}` : ''}

Candidate: ${ctx.candidateProfile}

Output JSON: { "minAsk": number, "targetAsk": number, "maxAsk": number, "currency": "BRL|USD", "strategy": "one sentence", "rationale": "two sentences" }`;

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
