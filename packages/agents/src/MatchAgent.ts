import { BaseAgent } from './base/BaseAgent.js';
import type { AgentConfig, AgentResult } from './base/types.js';
import type { Job } from '@vraxia/core';

export interface MatchScore {
  jobId: string;
  interviewProbability: number;
  strengths: string[];
  gaps: string[];
  recommendation: 'apply' | 'skip' | 'review';
}

export class MatchAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      maxTokens: 512,
      systemPrompt: `You are a career advisor. Given a job and candidate profile, output JSON:
{ "ip": 0-100, "strengths": [...], "gaps": [...], "rec": "apply|skip|review" }
ip = interview probability (how likely this candidate gets an interview for this role).`,
    });
  }

  async score(job: Job, candidateProfile: string): Promise<AgentResult<MatchScore>> {
    const start = Date.now();
    const prompt = `Job: ${job.title} at ${job.company}\nDescription: ${job.description ?? 'N/A'}\n\nCandidate:\n${candidateProfile}`;
    const result = await this.complete(prompt);

    if (!result.success || !result.data) {
      return { success: false, ...(result.error !== undefined && { error: result.error }), durationMs: Date.now() - start };
    }

    try {
      const raw = JSON.parse(result.data) as { ip: number; strengths: string[]; gaps: string[]; rec: string };
      return {
        success: true,
        data: {
          jobId: job.id,
          interviewProbability: raw.ip,
          strengths: raw.strengths,
          gaps: raw.gaps,
          recommendation: raw.rec as MatchScore['recommendation'],
        },
        ...(result.tokenUsage !== undefined && { tokenUsage: result.tokenUsage }),
        durationMs: Date.now() - start,
      };
    } catch {
      return { success: false, error: 'Failed to parse match score', durationMs: Date.now() - start };
    }
  }
}
