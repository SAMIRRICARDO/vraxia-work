import { BaseAgent } from './base/BaseAgent.js';
import type { AgentConfig, AgentResult } from './base/types.js';
import type { QuestionnaireQuestion } from '@vraxia/core';

export interface QAPair {
  question: string;
  answer: string;
  platform?: string;
  company?: string;
  learnedAt: string;
}

export class LearningAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      maxTokens: 256,
      systemPrompt: `You are a QA pair extractor for job applications. Given a question and the answer
that was successfully submitted, extract a normalized version for caching. Output JSON:
{ "normalizedQuestion": "...", "answer": "..." }`,
    });
  }

  async extractQAPair(
    question: QuestionnaireQuestion,
    answer: string,
    context?: { platform?: string; company?: string }
  ): Promise<AgentResult<QAPair>> {
    const start = Date.now();

    if (!answer.trim()) {
      return { success: false, error: 'Empty answer — skipping learning', durationMs: Date.now() - start };
    }

    const prompt = `Question: ${question.text}\nAnswer used: ${answer}\nQuestion type: ${question.type}`;
    const result = await this.complete(prompt);

    if (!result.success || !result.data) {
      return { success: false, ...(result.error !== undefined && { error: result.error }), durationMs: Date.now() - start };
    }

    try {
      const raw = JSON.parse(result.data) as { normalizedQuestion: string; answer: string };
      const pair: QAPair = {
        question: raw.normalizedQuestion,
        answer: raw.answer,
        learnedAt: new Date().toISOString(),
        ...(context?.platform !== undefined && { platform: context.platform }),
        ...(context?.company !== undefined && { company: context.company }),
      };
      return {
        success: true,
        data: pair,
        ...(result.tokenUsage !== undefined && { tokenUsage: result.tokenUsage }),
        durationMs: Date.now() - start,
      };
    } catch {
      return { success: false, error: 'Failed to parse QA pair', durationMs: Date.now() - start };
    }
  }
}
