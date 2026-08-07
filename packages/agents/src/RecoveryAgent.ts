import { BaseAgent } from './base/BaseAgent.js';
import type { AgentConfig, AgentResult } from './base/types.js';
import type { Job } from '@vraxia/core';
import { ErrorClassifier } from '@vraxia/core';

export interface RecoveryCandidate extends Job {
  applicationState: string;
  retryCount: number;
  lastError?: string;
  interviewProbability: number;
}

export interface RecoverySummary {
  scanned: number;
  external: number;
  retriable: number;
  succeeded: number;
  failed: number;
}

export type RecoveryRunOptions = {
  dryRun?: boolean;
  maxJobs?: number;
  ipThreshold?: number;
};

export class RecoveryAgent extends BaseAgent {
  private readonly classifier = new ErrorClassifier();

  constructor(config: AgentConfig) {
    super({
      ...config,
      maxTokens: 512,
      systemPrompt: `You are a recovery analyst for failed job applications.
Given a failed application record, determine if it is recoverable and suggest the best retry strategy.
Output JSON: { "recoverable": boolean, "strategy": "retry|manual|skip", "reason": "..." }`,
    });
  }

  async analyzeFailure(candidate: RecoveryCandidate): Promise<AgentResult<{ recoverable: boolean; strategy: string }>> {
    const start = Date.now();
    const classified = this.classifier.classify(candidate.lastError ?? 'unknown error');

    if (!classified.retryable) {
      return {
        success: true,
        data: { recoverable: false, strategy: classified.recoveryAction },
        durationMs: Date.now() - start,
      };
    }

    const prompt = `Failed job: ${candidate.title} at ${candidate.company} (${candidate.platform})
State: ${candidate.applicationState}
Error: ${candidate.lastError ?? 'unknown'}
Retry count: ${candidate.retryCount}
Error category: ${classified.category}`;

    const result = await this.complete(prompt);

    if (!result.success || !result.data) {
      return { success: false, error: result.error, durationMs: Date.now() - start };
    }

    try {
      const raw = JSON.parse(result.data) as { recoverable: boolean; strategy: string };
      return { success: true, data: raw, tokenUsage: result.tokenUsage, durationMs: Date.now() - start };
    } catch {
      return { success: true, data: { recoverable: true, strategy: 'retry' }, durationMs: Date.now() - start };
    }
  }
}
