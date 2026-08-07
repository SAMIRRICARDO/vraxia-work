# Architecture

VRAXIA Work is designed around three principles: **state correctness**, **cost minimization**, and **extensibility**. This document explains the key architectural decisions. For detailed ADRs, see [docs/architecture/](docs/architecture/).

---

## Core Concepts

### 1. Application State Machine (FSM)

Every job application is a finite state machine with 12 states:

```
pending → queued → applying → submitted → confirmed
                ↓           ↓
             failed      blocked
                ↓
           cancelled
             timeout
         review_stuck
```

State transitions are enforced at the `ApplicationStateMachine` level — no component can write an invalid state transition. This prevents the most common bug in automation: jobs stuck in inconsistent states.

**Why FSM?** See [ADR-003](docs/architecture/ADR-003-state-machine.md).

---

### 2. TruthEngine (Evidence-Based Verification)

Submitting a job application doesn't mean it was received. The `ApplicationTruthEngine` collects evidence:

- URL change detection (redirect to confirmation page)
- DOM element presence (success banners, confirmation text)
- Screenshot comparison (before/after apply button)
- Network response interception (API calls to the ATS)

A job is only marked `confirmed` when evidence meets a confidence threshold. False positives are classified as `review_stuck` for human review.

**Why evidence-based?** See [ADR-002](docs/architecture/ADR-002-truth-engine.md).

---

### 3. 5-Layer Questionnaire Resolver

Job applications often include screening questions. Each question goes through five layers in order, stopping at the first hit:

```
Layer 1: QA Cache          (exact match, zero cost)
Layer 2: TF-IDF RAG        (semantic match from candidate KB, zero cost)
Layer 3: Claude Haiku      (~$0.0001, fast inference)
Layer 4: Candidate Profile (structured lookup from twin data)
Layer 5: Empty string      (safe no-op fallback)
```

This design means 80%+ of questions are answered at cost $0.00. Only novel, context-dependent questions reach Haiku.

---

### 4. ErrorClassifier

Failures are not all equal. The `ErrorClassifier` maps raw errors to a taxonomy:

| Category | Examples | Recovery action |
|---|---|---|
| `anti_bot` | CAPTCHA, rate limit | Exponential backoff + jitter |
| `session_expired` | Cookie invalidated | Re-login flow |
| `form_changed` | New required field | Flag for human review |
| `network` | Timeout, 503 | Retry with delay |
| `external_apply` | Redirects off-platform | Mark blocked, manual apply |
| `already_applied` | Duplicate detected | Mark submitted |

Each category has a recommended recovery strategy. `RecoveryAgent` uses this taxonomy to decide which failed jobs are retriable vs. permanently blocked.

---

### 5. Plugin Architecture

Plugins extend agent behavior without modifying core code:

```typescript
interface PluginInterface {
  name: string;
  description: string;
  execute(ctx: PluginContext): Promise<PluginResult>;
}
```

The `PluginRegistry` loads plugins by name, resolves dependencies, and injects context (job data, candidate profile, AI client). Built-in plugins ship with the framework; community plugins can be registered externally.

---

### 6. Cost Architecture

VRAXIA Work is designed to run at near-zero cost:

| Operation | Model | Avg cost |
|---|---|---|
| Job filtering (batch) | Claude Haiku | $0.0001/job |
| Questionnaire answer | Haiku (Layer 3 only) | $0.00005/question |
| Interview probability score | Haiku | $0.0002/job |
| Cover letter generation | Sonnet (plugin, optional) | $0.003/letter |
| Recovery analysis | Haiku | $0.0001/job |

**Total per application: ~$0.001**

The `LearningAgent` improves QA cache hit rate over time, reducing Haiku calls as the system learns from past questions.

---

## Package Dependency Graph

```
@vraxia/core          ← no internal deps
@vraxia/rag           ← @vraxia/core
@vraxia/agents        ← @vraxia/core, @vraxia/rag
@vraxia/plugins       ← @vraxia/agents
@vraxia/notifications ← no internal deps
apps/cli              ← all packages
```

---

## Data Flow

```
1. CLI hunt command
2. JobFilterAgent scans platform → FSM: pending → queued
3. MatchAgent scores IP (interview probability)
4. ApplicationService applies → 5-layer QA resolver handles questions
5. TruthEngine verifies submission → FSM: queued → submitted/failed
6. ErrorClassifier categorizes failures
7. LearningAgent caches new QA pairs
8. RecoveryAgent periodically retries high-IP failures
9. Telegram notification sent
```

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Database | SQLite (sql.js) | Zero infra, portable, sufficient for single-user |
| AI provider | Anthropic Claude | Best instruction-following for form automation |
| Model selection | Haiku-first, Sonnet for complex | Cost: Haiku is 25x cheaper than Sonnet |
| Browser automation | Playwright | Best anti-detection, cross-platform |
| RAG embedding | TF-IDF (no vector DB) | Zero cost, sufficient recall for QA pairs |
| Monorepo tool | npm workspaces | Simple, no extra toolchain |
| Runtime | tsx (no build) | Faster dev loop |

Full rationale in [ADR-001](docs/architecture/ADR-001-architecture.md).
