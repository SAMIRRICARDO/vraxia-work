# ADR-002: Evidence-Based Application Verification (TruthEngine)

**Status:** Accepted  
**Date:** 2026-08-06

## Context

Job application automation fails silently. Clicking "Apply" doesn't guarantee the application was received — the form may have errored, the session may have expired, or the platform may have shown a false success screen. Without verification, the system marks jobs as "applied" when they weren't, creating a false sense of progress.

## Decision

Implement `ApplicationTruthEngine` — a multi-signal evidence collector that must reach a confidence threshold before marking an application `confirmed`.

Evidence sources (in order of reliability):
1. URL change after submission (40% weight)
2. DOM confirmation text detection (40% weight)
3. Network response interception (20% weight)

Threshold: 70% confidence → `confirmed`; 40-70% → `review_stuck` (human review); <40% → `failed`.

## Rationale

- Multiple independent signals reduce false positives
- `review_stuck` state prevents silent failures from being treated as successes
- Confidence scoring is transparent — can be inspected in logs

## Consequences

- Adds latency per application (DOM inspection + URL check)
- Requires Playwright access (can't be mocked in unit tests without a real browser)
- Platform-specific DOM patterns must be maintained per ATS
