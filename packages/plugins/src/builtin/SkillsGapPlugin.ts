import Anthropic from '@anthropic-ai/sdk';
import type { PluginInterface, PluginContext, PluginResult } from '../PluginInterface.js';

export class SkillsGapPlugin implements PluginInterface {
  readonly name = 'skills-gap';
  readonly description = 'Identifies missing skills and suggests how to address gaps before the interview';

  async execute(ctx: PluginContext): Promise<PluginResult> {
    const prompt = `Identify skill gaps between this candidate and job requirements.

Job: ${ctx.job.title} at ${ctx.job.company}
Description: ${ctx.job.description ?? 'No description provided'}

Candidate skills: ${ctx.candidateProfile}

Output JSON: {
  "matched": ["skill1", ...],
  "missing": ["skill1", ...],
  "critical": ["must-have missing skill", ...],
  "prepTips": ["tip to address gap", ...]
}`;

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
