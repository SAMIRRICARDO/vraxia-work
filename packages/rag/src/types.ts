export type ResolverLayer = 'cache' | 'tfidf' | 'haiku' | 'kb' | 'fallback';

export interface ResolverResult {
  answer: string;
  layer: ResolverLayer;
  confidence: number;
  cached: boolean;
  costUsd: number;
}

export interface QACacheEntry {
  question: string;
  answer: string;
  hits: number;
  lastUsed: string;
}
