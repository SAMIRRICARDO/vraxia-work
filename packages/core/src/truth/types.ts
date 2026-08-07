export type EvidenceMethod = 'url_change' | 'dom_element' | 'screenshot' | 'network_response';

export interface TruthEvidence {
  method: EvidenceMethod;
  found: boolean;
  detail?: string;
  confidence: number;
}

export interface EvidenceResult {
  confirmed: boolean;
  confidence: number;
  evidence: TruthEvidence[];
  reviewRequired: boolean;
}
