# ADR-003: Finite State Machine for Application Lifecycle

**Status:** Accepted  
**Date:** 2026-08-06

## Context

Job applications go through many states: discovered, queued, in-progress, submitted, confirmed, failed, blocked, retried. Without explicit state management, code accumulates ad-hoc flags (`isApplied`, `hasFailed`, `isRetrying`) that create invalid combinations and impossible-to-debug states.

## Decision

Model every job application as a Finite State Machine (FSM) with 12 states and explicitly enumerated valid transitions. The `ApplicationStateMachine` class enforces transitions — invalid transitions throw immediately rather than silently corrupting state.

## States

`pending → queued → applying → submitted → confirmed`  
With failure branches: `failed`, `blocked`, `cancelled`, `timeout`, `review_stuck`, `external_apply`, `already_applied`

## Rationale

- Invalid states are impossible by construction (not just by convention)
- Transition history is preserved for debugging
- Retry logic uses `retryCount` from FSM rather than scattered flags
- Easy to extend: adding a new state requires a single change in the transition table

## Consequences

- Slightly more verbose than ad-hoc flags
- All state changes must go through `fsm.transition()` — no direct property writes
- Serialization/deserialization required for persistence (`toJSON()`/`fromJSON()`)
