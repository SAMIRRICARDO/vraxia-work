# Changelog

All notable changes to VRAXIA Work are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Open source monorepo structure (npm workspaces)
- `packages/core` — FSM, TruthEngine, ErrorClassifier (zero external deps)
- `packages/agents` — AI agents built on `@anthropic-ai/sdk`
- `packages/rag` — 5-layer questionnaire resolver with TF-IDF
- `packages/plugins` — plugin interface + registry + 6 built-in plugins
- `packages/notifications` — Telegram adapter
- `apps/cli` — `hunt`, `recover`, `diagnostico` commands
- `examples/` — basic-hunt, custom-agent, plugin-tutorial

---

## [0.1.0] — 2026-08-06

### Added
- `ApplicationStateMachine` — 12-state FSM with strict transition enforcement
- `ApplicationTruthEngine` — evidence-based confirmation (URL, DOM, screenshot, network)
- `ErrorClassifier` — maps raw errors to taxonomy with recovery hints
- 5-layer questionnaire resolver — QA cache → TF-IDF → Haiku → KB → fallback
- `JobFilterAgent` — scans job listings and filters by interview probability threshold
- `MatchAgent` — scores IP (interview probability) per job
- `LearningAgent` — caches new QA pairs to improve future hit rate
- `RecoveryAgent` — retries high-IP failed/blocked jobs automatically
- Plugin interface (`PluginInterface`) + `PluginRegistry`
- 6 built-in plugins: cover-letter, salary-advisor, culture-fit, skills-gap, email-followup, interview-prep
- Anti-detection scheduler: jitter, fingerprint rotation, session management
- Telegram notification adapter
- CLI: `npm run hunt`, `npm run recover`, `npm run recover:dry`, `npm run diagnostico`
- Vitest test suite: FSM transitions, TruthEngine, ErrorClassifier

### Architecture
- Haiku-first cost model (~$0.001/application average)
- SQLite storage (zero infra requirement)
- TF-IDF RAG (no vector DB required)
- ESM-only TypeScript with `tsx` (no build step in dev)

---

[Unreleased]: https://github.com/SAMIRRICARDO/vraxia-work/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/SAMIRRICARDO/vraxia-work/releases/tag/v0.1.0
