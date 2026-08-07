import type { EvidenceResult, TruthEvidence } from './types.js';

const CONFIRMATION_THRESHOLD = 0.7;
const REVIEW_THRESHOLD = 0.4;

export interface TruthEngineConfig {
  successUrlPatterns?: RegExp[];
  successDomSelectors?: string[];
  successTextPatterns?: RegExp[];
}

export class ApplicationTruthEngine {
  constructor(private readonly config: TruthEngineConfig = {}) {}

  async evaluate(
    beforeUrl: string,
    afterUrl: string,
    domContent: string,
    _screenshotHash?: string
  ): Promise<EvidenceResult> {
    const evidence: TruthEvidence[] = [];

    evidence.push(this.checkUrlChange(beforeUrl, afterUrl));
    evidence.push(this.checkDomContent(domContent));
    evidence.push(this.checkNetworkResponse(domContent));

    const totalConfidence = evidence.reduce((sum, e) => sum + (e.found ? e.confidence : 0), 0);
    const maxConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0);
    const score = maxConfidence > 0 ? totalConfidence / maxConfidence : 0;

    return {
      confirmed: score >= CONFIRMATION_THRESHOLD,
      confidence: score,
      evidence,
      reviewRequired: score >= REVIEW_THRESHOLD && score < CONFIRMATION_THRESHOLD,
    };
  }

  private checkUrlChange(before: string, after: string): TruthEvidence {
    const defaultPatterns = [
      /confirm/i,
      /success/i,
      /applied/i,
      /thank/i,
      /submitted/i,
    ];
    const patterns = this.config.successUrlPatterns ?? defaultPatterns;
    const changed = before !== after;
    const matchesPattern = changed && patterns.some(p => p.test(after));

    return {
      method: 'url_change',
      found: matchesPattern,
      detail: changed ? `${before} → ${after}` : 'URL unchanged',
      confidence: 0.4,
    };
  }

  private checkDomContent(content: string): TruthEvidence {
    const defaultPatterns = [
      /sua candidatura foi enviada/i,
      /application submitted/i,
      /candidatura enviada/i,
      /applied successfully/i,
      /obrigado/i,
      /thank you for applying/i,
    ];
    const patterns = this.config.successTextPatterns ?? defaultPatterns;
    const found = patterns.some(p => p.test(content));

    return {
      method: 'dom_element',
      found,
      detail: found ? 'Confirmation text detected in DOM' : 'No confirmation text found',
      confidence: 0.4,
    };
  }

  private checkNetworkResponse(content: string): TruthEvidence {
    const apiSuccessPatterns = [
      /"status"\s*:\s*"success"/i,
      /"applied"\s*:\s*true/i,
      /"submitted"\s*:\s*true/i,
    ];
    const found = apiSuccessPatterns.some(p => p.test(content));

    return {
      method: 'network_response',
      found,
      detail: found ? 'API success response intercepted' : 'No API confirmation',
      confidence: 0.2,
    };
  }
}
