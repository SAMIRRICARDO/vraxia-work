# VRAXIA Work

> An open AI platform that helps software developers return to the job market faster using AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-orange.svg)](https://anthropic.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

VRAXIA Work is an open-source AI agent framework for job search automation. It provides a production-grade architecture for building autonomous job application pipelines — with FSM lifecycle enforcement, multi-layer RAG questionnaire resolution, evidence-based verification, and an extensible plugin system.

**Built on real usage:** 529+ job listings processed, 82 applications submitted across LinkedIn, Gupy, and Catho.

---

## Why VRAXIA Work?

Most job search automation tools are brittle scripts. VRAXIA Work is a framework:

| Feature | Scripts/Bots | VRAXIA Work |
|---|---|---|
| Application lifecycle | None | FSM with 12 states |
| Answer resolution | Hardcoded | 5-layer RAG (cache → TF-IDF → AI → fallback) |
| Verification | None | TruthEngine (evidence-based) |
| Error handling | Crash | ErrorClassifier with recovery |
| Extensibility | Fork & edit | Plugin marketplace |
| Observability | `console.log` | Structured logs + Telegram |
| Cost | High (GPT-4 for everything) | $0.001/application (Haiku-first) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      apps/cli                           │
│              hunt · recover · diagnostico               │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   @vraxia/agents                        │
│   JobFilterAgent · MatchAgent · RecoveryAgent · ...     │
└──────┬──────────────┬──────────────────┬────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼───────┐
│ @vraxia/core│ │ @vraxia/rag│ │@vraxia/plugins │
│ FSM         │ │ 5-layer    │ │ Marketplace    │
│ TruthEngine │ │ Resolver   │ │ Interface      │
│ ErrorClass. │ └────────────┘ └────────────────┘
└─────────────┘
```

**5-Layer Questionnaire Resolver** (zero wasted tokens):
```
Layer 1: QA Cache       → instant, $0.00
Layer 2: TF-IDF RAG     → semantic match, $0.00
Layer 3: Claude Haiku   → AI reasoning, ~$0.0001
Layer 4: Candidate KB   → profile lookup, $0.00
Layer 5: Empty string   → safe fallback, $0.00
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for full design rationale.

---

## What Makes VRAXIA Work Different

Most agent frameworks focus on chat or tool-calling. VRAXIA Work solves a harder problem: **reliable, cost-efficient, multi-step automation in a hostile, unpredictable environment** (dynamic web UIs, session timeouts, CAPTCHA, ambiguous form questions). The innovations that emerged from production use:

### 1. FSM-Enforced Application Lifecycle

Every job application is modeled as a 12-state finite state machine (`pending → queued → applying → submitted → confirmed`), not a boolean flag. This makes **invalid states impossible by construction**: you can't submit without applying, can't retry without going through `queued`, can't silently swallow a timeout. The transition history is the audit log.

```
pending → queued → applying → submitted → confirmed
                       ↓              ↓
                   blocked       review_stuck
                   timeout         failed → queued (retry)
                 external_apply
                 already_applied
```

Unlike workflow tools (n8n, Zapier) that model state as data, this FSM is enforced at the type level — invalid transitions throw at runtime, not at post-mortem.

### 2. 5-Layer Zero-Waste Questionnaire Resolver

Job application forms ask hundreds of variations of the same questions. The `QuestionnaireResolver` answers them using a cost-ranked cascade:

| Layer | Mechanism | Cost |
|---|---|---|
| 1 | Exact QA cache match | $0.00 |
| 2 | TF-IDF semantic similarity (threshold 0.65) | $0.00 |
| 3 | Claude Haiku (AI reasoning) | ~$0.0001 |
| 4 | Candidate knowledge-base keyword scan | $0.00 |
| 5 | Safe empty-string fallback | $0.00 |

95%+ of repeated questions are answered at Layer 1–2. **Claude is called only when no prior knowledge covers the question.** This is fundamentally different from naive "pass everything to GPT-4" approaches.

### 3. Evidence-Based TruthEngine

Before submitting an application, the `ApplicationTruthEngine` verifies that the form was actually filled correctly — not by trusting the automation script, but by reading the DOM and cross-checking field values against expected answers. This catches silent failures (pre-filled incorrect values, hidden required fields, dynamic form rewrites).

### 4. Structured Error Classification

The `ErrorClassifier` categorizes failures into semantically meaningful types (`auth_error`, `form_blocked`, `rate_limited`, `infra_crash`, `timeout`, etc.) with an explicit `retryable: boolean` and `recoveryAction` per category. The `RecoveryAgent` uses this classification to decide intelligently whether to re-queue, escalate to manual review, or skip — not just retry blindly.

### 5. Haiku-First Cost Architecture

The model selection strategy is a first-class architectural decision, not an afterthought:

- `claude-haiku-4-5-20251001` — all agents by default (filter, match, learn, recover)
- `claude-sonnet-4-6` — only for cover letter generation (quality-sensitive)
- Prompt caching (`cache_control: ephemeral`) on all system prompts

Result: **$0.001/application** at production volume, vs. $0.05–$0.20 with naive GPT-4 usage.

### 6. Plugin Marketplace Architecture

Plugins extend the pipeline via a typed interface without touching core code. A plugin receives the job, the candidate profile, and the application context — and can enrich, filter, or generate artifacts. The registry loads plugins at runtime; contributors don't need to understand the automation internals.

---

## Quickstart

```bash
git clone https://github.com/SAMIRRICARDO/vraxia-work
cd vraxia-work
npm install

cp .env.example .env
# Fill in: ANTHROPIC_API_KEY, LINKEDIN_EMAIL, LINKEDIN_PASSWORD

# Dry run — no browser, no DB writes
npm run recover:dry

# Full recovery scan (IP >= 50 jobs)
npm run recover

# Job hunt pipeline
npm run hunt
```

### Requirements

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/)
- LinkedIn account credentials (for apply automation)

---

## Packages

| Package | Description |
|---|---|
| [`@vraxia/core`](packages/core) | FSM, TruthEngine, ErrorClassifier, types |
| [`@vraxia/agents`](packages/agents) | AI agents: Filter, Match, Recovery, Learning |
| [`@vraxia/rag`](packages/rag) | 5-layer questionnaire resolver |
| [`@vraxia/plugins`](packages/plugins) | Plugin interface, registry, built-in plugins |
| [`@vraxia/notifications`](packages/notifications) | Telegram and notification adapters |
| [`apps/cli`](apps/cli) | Command-line interface: hunt, recover, diagnostico |

---

## Built-in Plugins

| Plugin | Description |
|---|---|
| `cover-letter` | AI-generated cover letters per job |
| `linkedin-optimizer` | Profile keyword suggestions |
| `startup-radar` | Filters early-stage companies |
| `visa-filter` | Removes jobs requiring sponsorship |
| `equity-calculator` | Estimates equity value |
| `headhunter-script` | Generates recruiter outreach messages |

---

## Real-World Results

```
Applications submitted:   82
Job listings processed:   529+
Platforms supported:      LinkedIn · Gupy · Catho · Greenhouse
Avg cost per application: $0.001
Interview probability:    tracked per job (ML scoring)
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions are welcome — new platform engines, plugins, agent improvements, and documentation.

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and community priorities.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgements

Built with [Claude](https://anthropic.com) (Haiku + Sonnet) by [Samir Ricardo](https://github.com/SAMIRRICARDO).
