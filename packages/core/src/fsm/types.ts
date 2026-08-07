export type ApplicationState =
  | 'pending'
  | 'queued'
  | 'applying'
  | 'submitted'
  | 'confirmed'
  | 'failed'
  | 'blocked'
  | 'cancelled'
  | 'timeout'
  | 'review_stuck'
  | 'external_apply'
  | 'already_applied';

export interface StateTransition {
  from: ApplicationState;
  to: ApplicationState;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface FSMContext {
  jobId: string;
  currentState: ApplicationState;
  history: StateTransition[];
  retryCount: number;
  lastError?: string;
}
