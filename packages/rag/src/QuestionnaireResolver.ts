import Anthropic from '@anthropic-ai/sdk';
import type { QuestionnaireQuestion } from '@vraxia/core';
import { TFIDFIndex } from './TFIDFIndex.js';
import type { ResolverResult, QACacheEntry } from './types.js';

const HAIKU = 'claude-haiku-4-5-20251001';
const HAIKU_INPUT_PRICE = 0.80 / 1_000_000;
const HAIKU_OUTPUT_PRICE = 4.00 / 1_000_000;
const TFIDF_THRESHOLD = 0.65;

export interface ResolverConfig {
  client: Anthropic;
  qaCache?: Map<string, QACacheEntry>;
  candidateKB?: string;
  tfidfIndex?: TFIDFIndex;
}

export class QuestionnaireResolver {
  private readonly client: Anthropic;
  private readonly qaCache: Map<string, QACacheEntry>;
  private readonly tfidf: TFIDFIndex;
  private readonly candidateKB: string;

  constructor(config: ResolverConfig) {
    this.client = config.client;
    this.qaCache = config.qaCache ?? new Map();
    this.tfidf = config.tfidfIndex ?? new TFIDFIndex();
    this.candidateKB = config.candidateKB ?? '';
  }

  async resolve(question: QuestionnaireQuestion): Promise<ResolverResult> {
    // Layer 1: Exact cache match
    const cacheKey = question.text.toLowerCase().trim();
    const cached = this.qaCache.get(cacheKey);
    if (cached) {
      cached.hits++;
      cached.lastUsed = new Date().toISOString();
      return { answer: cached.answer, layer: 'cache', confidence: 1.0, cached: true, costUsd: 0 };
    }

    // Layer 2: TF-IDF semantic match
    const tfidfResults = this.tfidf.query(question.text);
    if (tfidfResults.length > 0 && (tfidfResults[0]?.score ?? 0) >= TFIDF_THRESHOLD) {
      const top = tfidfResults[0]!;
      return { answer: top.doc.answer, layer: 'tfidf', confidence: top.score, cached: false, costUsd: 0 };
    }

    // Layer 3: Claude Haiku
    try {
      const haikuResult = await this.callHaiku(question);
      if (haikuResult.answer) {
        this.learnFromHaiku(question.text, haikuResult.answer);
        return { ...haikuResult, layer: 'haiku', cached: false };
      }
    } catch {
      // fall through to Layer 4
    }

    // Layer 4: Candidate KB keyword match
    if (this.candidateKB) {
      const kbAnswer = this.searchKB(question.text);
      if (kbAnswer) {
        return { answer: kbAnswer, layer: 'kb', confidence: 0.5, cached: false, costUsd: 0 };
      }
    }

    // Layer 5: Safe fallback
    return { answer: '', layer: 'fallback', confidence: 0, cached: false, costUsd: 0 };
  }

  private async callHaiku(question: QuestionnaireQuestion): Promise<{ answer: string; confidence: number; costUsd: number }> {
    const prompt = question.options?.length
      ? `Question: ${question.text}\nOptions: ${question.options.join(', ')}\nAnswer with one of the options or a short phrase.`
      : `Question: ${question.text}\nAnswer concisely in one sentence.`;

    const response = await this.client.messages.create({
      model: HAIKU,
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as Anthropic.TextBlock).text)
      .join('').trim();

    const costUsd =
      response.usage.input_tokens * HAIKU_INPUT_PRICE +
      response.usage.output_tokens * HAIKU_OUTPUT_PRICE;

    return { answer: text, confidence: 0.8, costUsd };
  }

  private learnFromHaiku(question: string, answer: string): void {
    const key = question.toLowerCase().trim();
    this.qaCache.set(key, { question, answer, hits: 0, lastUsed: new Date().toISOString() });
    this.tfidf.add({ id: key, text: question, answer });
  }

  private searchKB(question: string): string | null {
    const lower = question.toLowerCase();
    const lines = this.candidateKB.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(lower.substring(0, 30))) {
        const parts = line.split(':');
        if (parts.length > 1) return parts.slice(1).join(':').trim();
      }
    }
    return null;
  }
}
