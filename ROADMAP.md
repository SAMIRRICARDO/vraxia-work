# Roadmap

This document tracks planned features and community priorities. Items marked ✅ are shipped; 🚧 are in progress; 📋 are planned.

---

## v0.1 — Foundation (current)

- ✅ ApplicationStateMachine (12-state FSM)
- ✅ ApplicationTruthEngine (evidence-based verification)
- ✅ ErrorClassifier (error taxonomy + recovery hints)
- ✅ 5-layer questionnaire resolver (cache → TF-IDF → Haiku → KB → fallback)
- ✅ JobFilterAgent, MatchAgent, LearningAgent
- ✅ RecoveryAgent (retries high-IP failed jobs)
- ✅ Plugin interface + registry + 6 built-in plugins
- ✅ CLI: `hunt`, `recover`, `diagnostico`
- ✅ Telegram notifications
- ✅ Anti-detection scheduler (jitter, fingerprint rotation)
- ✅ Vitest test suite (FSM, TruthEngine, ErrorClassifier)

---

## v0.2 — Platform Engines (community priority)

- 📋 LinkedIn Easy Apply engine (Playwright)
- 📋 Gupy engine
- 📋 Greenhouse engine
- 📋 Catho engine
- 📋 Indeed engine
- 📋 Glassdoor engine

> **Note:** Platform engines require users to comply with each platform's Terms of Service. VRAXIA Work provides the framework; users bring their own credentials and accept responsibility for usage.

---

## v0.3 — Observability & Dashboard

- 📋 OpenTelemetry integration (traces, metrics, spans)
- 📋 Cost tracking per application (token usage → USD)
- 📋 Retrieval quality metrics (RAG hit rate, layer distribution)
- 📋 Local dashboard (Express + SQLite — no cloud required)
- 📋 Webhook support for external monitoring

---

## v0.4 — MCP Server

- 📋 Model Context Protocol server (`@vraxia/mcp`)
- 📋 Expose job search tools to any MCP-compatible AI client
- 📋 Claude Desktop integration example
- 📋 Tool: `search_jobs`, `apply_job`, `get_application_status`

---

## v0.5 — SDK & Extensibility

- 📋 `@vraxia/sdk` — high-level API for building custom job search agents
- 📋 Plugin marketplace registry (community-submitted plugins)
- 📋 Agent composition API (DAG-based orchestration)
- 📋 Resume parsing utilities (`@vraxia/resume`)

---

## v1.0 — Production Ready

- 📋 Stable API contract across all packages
- 📋 Full documentation site
- 📋 Docker Compose for easy local setup
- 📋 GitHub Actions CI with matrix tests (Node 20, 22)
- 📋 npm package publishing (`@vraxia/*`)
- 📋 Semantic versioning + automated CHANGELOG

---

## Community Ideas

Have a feature idea? Open a [Discussion](https://github.com/SAMIRRICARDO/vraxia-work/discussions) or a [Feature Request issue](.github/ISSUE_TEMPLATE/feature_request.md).

Current community requests being evaluated:
- [ ] Support for international job boards (LinkedIn Global, WorkableHR, Lever)
- [ ] Multi-candidate mode (agencies, bootcamp cohorts)
- [ ] CV tailoring agent (auto-adapt resume per job)
- [ ] Interview scheduling integration (Calendly, Google Calendar)
