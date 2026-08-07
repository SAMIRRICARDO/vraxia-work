import { BaseAgent } from './base/BaseAgent.js';
import type { AgentConfig, AgentResult } from './base/types.js';
import type { Job } from '@vraxia/core';

export interface FilterResult {
  relevant: Job[];
  rejected: Job[];
  totalScanned: number;
}

export class JobFilterAgent extends BaseAgent {
  private readonly hireThreshold: number;

  constructor(config: AgentConfig & { hireThreshold?: number }) {
    super({
      ...config,
      systemPrompt: `You are a job relevance classifier. Given a job listing and a candidate profile,
output a JSON object with: { "relevant": boolean, "score": 0-100, "reason": "one sentence" }.
Be strict: only mark relevant if the job genuinely matches the candidate's target role and skills.`,
    });
    this.hireThreshold = config.hireThreshold ?? 50;
  }

  async filterBatch(jobs: Job[], candidateProfile: string): Promise<AgentResult<FilterResult>> {
    const start = Date.now();
    const relevant: Job[] = [];
    const rejected: Job[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    for (const job of jobs) {
      const prompt = `Candidate profile: ${candidateProfile}\n\nJob: ${job.title} at ${job.company}\n${job.description ?? ''}`;
      const result = await this.complete(prompt);

      if (result.tokenUsage) {
        totalInputTokens += result.tokenUsage.inputTokens;
        totalOutputTokens += result.tokenUsage.outputTokens;
        totalCost += result.tokenUsage.estimatedCostUsd;
      }

      if (!result.success || !result.data) {
        rejected.push(job);
        continue;
      }

      try {
        const parsed = JSON.parse(result.data) as { relevant: boolean; score: number };
        if (parsed.relevant && parsed.score >= this.hireThreshold) {
          relevant.push({ ...job, interviewProbability: parsed.score });
        } else {
          rejected.push(job);
        }
      } catch {
        rejected.push(job);
      }
    }

    return {
      success: true,
      data: { relevant, rejected, totalScanned: jobs.length },
      tokenUsage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, estimatedCostUsd: totalCost },
      durationMs: Date.now() - start,
    };
  }
}
