import Anthropic from '@anthropic-ai/sdk';
import type { PluginInterface, PluginContext, PluginResult } from '../PluginInterface.js';

const SONNET = 'claude-sonnet-4-6';

export class CoverLetterPlugin implements PluginInterface {
  readonly name = 'cover-letter';
  readonly description = 'Generates a tailored cover letter for a job application using Claude Sonnet';

  async execute(ctx: PluginContext): Promise<PluginResult> {
    const model = ctx.model ?? SONNET;
    const prompt = `Write a concise, compelling cover letter (3 paragraphs) for this role:

Job: ${ctx.job.title} at ${ctx.job.company}
${ctx.job.description ? `Description: ${ctx.job.description}` : ''}

Candidate profile:
${ctx.candidateProfile}

Rules: No generic filler. Specific achievements. Professional but human tone. Max 250 words.`;

    try {
      const response = await ctx.ai.messages.create({
        model,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('');

      const costUsd =
        response.usage.input_tokens * (3.0 / 1_000_000) +
        response.usage.output_tokens * (15.0 / 1_000_000);

      return { success: true, data: { coverLetter: text }, costUsd };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
