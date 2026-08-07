import type Anthropic from '@anthropic-ai/sdk';
import type { Job } from '@vraxia/core';

export interface PluginContext {
  job: Job;
  candidateProfile: string;
  ai: Anthropic;
  model?: string;
}

export interface PluginResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  costUsd?: number;
}

export interface PluginInterface {
  readonly name: string;
  readonly description: string;
  execute(ctx: PluginContext): Promise<PluginResult>;
}
