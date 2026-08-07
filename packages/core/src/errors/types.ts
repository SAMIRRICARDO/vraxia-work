export type ErrorCategory =
  | 'anti_bot'
  | 'session_expired'
  | 'form_changed'
  | 'network'
  | 'external_apply'
  | 'already_applied'
  | 'unknown';

export type RecoveryAction =
  | 'backoff_retry'
  | 'relogin'
  | 'human_review'
  | 'retry'
  | 'mark_blocked'
  | 'mark_submitted'
  | 'skip';

export interface ClassifiedError {
  category: ErrorCategory;
  recoveryAction: RecoveryAction;
  retryable: boolean;
  detail: string;
  originalError: string;
}
