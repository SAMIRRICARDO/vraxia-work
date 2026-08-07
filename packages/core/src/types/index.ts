export interface Job {
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  applyUrl?: string;
  isEasyApply: boolean;
  applyType?: 'easy_apply' | 'external' | 'email';
  externalApplyUrl?: string;
  interviewProbability?: number;
  hireScore?: number;
  postedAt?: string;
  location?: string;
  salary?: string;
  description?: string;
}

export interface ApplicationOptions {
  dryRun?: boolean;
  resumePath: string;
  onQuestion: (question: QuestionnaireQuestion) => Promise<string>;
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox' | 'select' | 'textarea';
  options?: string[];
  required: boolean;
  context?: string;
}

export interface ApplicationResult {
  success: boolean;
  state: string;
  evidence?: string[];
  error?: string;
  errorCategory?: string;
  duration: number;
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  estimatedCostUsd: number;
}
