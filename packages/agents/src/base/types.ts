import type Anthropic from '@anthropic-ai/sdk';

export interface AgentConfig {
  client: Anthropic;
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
  durationMs: number;
}
