import type { ApplicationState, StateTransition, FSMContext } from './types.js';

const VALID_TRANSITIONS: Readonly<Record<ApplicationState, readonly ApplicationState[]>> = {
  pending: ['queued', 'cancelled'],
  queued: ['applying', 'cancelled'],
  applying: ['submitted', 'failed', 'blocked', 'timeout', 'external_apply', 'already_applied'],
  submitted: ['confirmed', 'review_stuck', 'failed'],
  confirmed: [],
  failed: ['queued'],
  blocked: [],
  cancelled: [],
  timeout: ['queued'],
  review_stuck: ['confirmed', 'failed'],
  external_apply: ['blocked'],
  already_applied: ['submitted'],
};

export class ApplicationStateMachine {
  private ctx: FSMContext;

  constructor(jobId: string, initialState: ApplicationState = 'pending') {
    this.ctx = {
      jobId,
      currentState: initialState,
      history: [],
      retryCount: 0,
    };
  }

  get state(): ApplicationState {
    return this.ctx.currentState;
  }

  get retryCount(): number {
    return this.ctx.retryCount;
  }

  get history(): StateTransition[] {
    return [...this.ctx.history];
  }

  canTransition(to: ApplicationState): boolean {
    return (VALID_TRANSITIONS[this.ctx.currentState] as readonly ApplicationState[]).includes(to);
  }

  transition(to: ApplicationState, reason?: string, metadata?: Record<string, unknown>): void {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid transition: ${this.ctx.currentState} → ${to} for job ${this.ctx.jobId}`
      );
    }

    const transition: StateTransition = {
      from: this.ctx.currentState,
      to,
      reason,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.ctx.history.push(transition);
    this.ctx.currentState = to;

    if (to === 'queued' && this.ctx.history.some(t => t.to === 'queued')) {
      this.ctx.retryCount++;
    }
  }

  toJSON(): FSMContext {
    return { ...this.ctx, history: [...this.ctx.history] };
  }

  static fromJSON(ctx: FSMContext): ApplicationStateMachine {
    const fsm = new ApplicationStateMachine(ctx.jobId, ctx.currentState);
    fsm.ctx = { ...ctx };
    return fsm;
  }
}
