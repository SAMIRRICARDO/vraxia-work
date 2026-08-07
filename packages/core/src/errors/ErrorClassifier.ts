import type { ErrorCategory, ClassifiedError, RecoveryAction } from './types.js';

interface ClassificationRule {
  patterns: RegExp[];
  category: ErrorCategory;
  recoveryAction: RecoveryAction;
  retryable: boolean;
}

const RULES: ClassificationRule[] = [
  {
    patterns: [/captcha/i, /rate.?limit/i, /too many requests/i, /429/i, /blocked/i, /suspicious/i],
    category: 'anti_bot',
    recoveryAction: 'backoff_retry',
    retryable: true,
  },
  {
    patterns: [/session/i, /login/i, /unauthorized/i, /401/i, /cookie/i, /expired/i],
    category: 'session_expired',
    recoveryAction: 'relogin',
    retryable: true,
  },
  {
    patterns: [/required field/i, /form.?changed/i, /new field/i, /missing required/i],
    category: 'form_changed',
    recoveryAction: 'human_review',
    retryable: false,
  },
  {
    patterns: [/timeout/i, /ETIMEDOUT/i, /ECONNREFUSED/i, /network/i, /503/i, /502/i],
    category: 'network',
    recoveryAction: 'retry',
    retryable: true,
  },
  {
    patterns: [/external/i, /redirected/i, /company site/i, /apply on/i, /apply via/i],
    category: 'external_apply',
    recoveryAction: 'mark_blocked',
    retryable: false,
  },
  {
    patterns: [/already applied/i, /ja se candidatou/i, /duplicate/i, /applied before/i],
    category: 'already_applied',
    recoveryAction: 'mark_submitted',
    retryable: false,
  },
];

export class ErrorClassifier {
  classify(error: Error | string): ClassifiedError {
    const msg = typeof error === 'string' ? error : error.message;
    const lowerMsg = msg.toLowerCase();

    for (const rule of RULES) {
      if (rule.patterns.some(p => p.test(lowerMsg))) {
        return {
          category: rule.category,
          recoveryAction: rule.recoveryAction,
          retryable: rule.retryable,
          detail: `Matched ${rule.category} pattern`,
          originalError: msg,
        };
      }
    }

    return {
      category: 'unknown',
      recoveryAction: 'human_review',
      retryable: false,
      detail: 'No pattern matched',
      originalError: msg,
    };
  }
}
