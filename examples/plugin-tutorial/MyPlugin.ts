import Anthropic from '@anthropic-ai/sdk';
import type { PluginInterface, PluginContext, PluginResult } from '@vraxia/plugins';

/**
 * Example plugin: generates a one-sentence "pitch" for why the candidate
 * should apply to this specific job. Costs ~$0.0001 per call (Haiku).
 */
export class PitchPlugin implements PluginInterface {
  readonly name = 'pitch';
  readonly description = 'Generates a one-sentence pitch for why this candidate fits this job';

  async execute(ctx: PluginContext): Promise<PluginResult> {
    const prompt = `In one sentence, explain why this candidate is a strong fit for this role.
Job: ${ctx.job.title} at ${ctx.job.company}
Candidate: ${ctx.candidateProfile}
Output just the sentence, no preamble.`;

    const response = await ctx.ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    });

    const pitch = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as Anthropic.TextBlock).text)
      .join('').trim();

    const costUsd =
      response.usage.input_tokens * (0.80 / 1_000_000) +
      response.usage.output_tokens * (4.00 / 1_000_000);

    return { success: true, data: { pitch }, costUsd };
  }
}
