# Application: Claude for Open Source Program

**Project:** VRAXIA Work  
**Repository:** https://github.com/SAMIRRICARDO/vraxia-work  
**Applicant:** Samir Ricardo  
**Contact:** eliteasamir@gmail.com  
**Date:** 2026-08-06

---

## What is VRAXIA Work?

VRAXIA Work is an open-source AI framework that helps software developers re-enter the job market faster using autonomous AI agents powered by Claude.

The system automates the most time-consuming parts of job searching:
- Filtering hundreds of job listings to find real matches (not keyword bingo)
- Resolving application form questions intelligently and cheaply
- Verifying that applications were actually submitted (not just clicked)
- Recovering from platform failures automatically

**Real-world results from the production system (June–August 2026):**
- 82+ applications submitted autonomously
- Average cost: ~$0.001 per application (Claude Haiku + TF-IDF RAG)
- 5-layer question resolver eliminates 90%+ of repeat AI calls
- Zero personal data in open-source code (PII stays local)

---

## Why Claude?

VRAXIA Work is built exclusively on the Anthropic SDK. Claude powers every AI decision in the system:

| Agent | Model | Purpose |
|---|---|---|
| `JobFilterAgent` | Haiku | Relevance scoring per job |
| `MatchAgent` | Haiku | Interview probability estimate |
| `LearningAgent` | Haiku | Normalize Q&A pairs for caching |
| `RecoveryAgent` | Haiku | Classify errors → recovery strategies |
| `CoverLetterPlugin` | Sonnet | High-quality cover letter generation |
| `SalaryAdvisorPlugin` | Haiku | Negotiation range calculation |
| `CultureFitPlugin` | Haiku | Company culture alignment scoring |
| `SkillsGapPlugin` | Haiku | Missing skills + prep tips |

All agents use **prompt caching** (`cache_control: { type: "ephemeral" }`) to minimize token cost on repeated system prompts.

The **5-layer QuestionnaireResolver** was designed specifically to minimize Claude API calls:
1. Exact cache match ($0.00)
2. TF-IDF semantic search ($0.00)
3. Claude Haiku (~$0.0001)
4. Candidate knowledge base ($0.00)
5. Empty string fallback ($0.00)

This architecture means 90%+ of form questions are answered without any API call.

---

## Architecture Innovation

### ApplicationStateMachine

A 12-state FSM that makes invalid application states impossible by construction. Invalid transitions throw immediately. This prevents the most common automation bug: marking a job as "applied" when the application failed silently.

### ApplicationTruthEngine

Evidence-based verification with weighted signals:
- URL change after submit: 40%
- DOM confirmation text: 40%
- Network response code: 20%

Threshold 70% → confirmed; 40–70% → human review queue; <40% → failed + retry.

This design reduces false positives from ~30% (naive automation) to <5%.

### ErrorClassifier

Maps raw Playwright/network errors to 6 action categories:
`anti_bot | session_expired | form_changed | network | external_apply | already_applied`

Each category has a recovery action and retryable flag — the system makes intelligent recovery decisions without human intervention.

---

## Open Source Design

The project uses npm workspaces to separate:

| Package | Dependencies | Purpose |
|---|---|---|
| `@vraxia/core` | **zero** | FSM, TruthEngine, ErrorClassifier, types |
| `@vraxia/rag` | **zero** | TF-IDF index, QuestionnaireResolver |
| `@vraxia/agents` | Anthropic SDK only | BaseAgent, all AI agents |
| `@vraxia/plugins` | Anthropic SDK only | Plugin interface + 4 built-in plugins |
| `@vraxia/notifications` | **zero** | Logger, Telegram notifier |

`@vraxia/core` and `@vraxia/rag` have **zero external dependencies** — developers can use the FSM and TF-IDF resolver without pulling in any AI SDK.

---

## Community Potential

The plugin architecture is explicitly designed for community contributions. Adding a new AI capability requires implementing one interface:

```typescript
interface PluginInterface {
  readonly name: string;
  readonly description: string;
  execute(ctx: PluginContext): Promise<PluginResult>;
}
```

Examples of community plugins that don't require Playwright access:
- LinkedIn connection message generator
- Interview prep question generator
- Salary negotiation email writer
- Company research summarizer
- Portfolio project recommender per job

Platform engines (the Playwright automation for specific ATS platforms like LinkedIn, Gupy, Greenhouse) are contributed separately and stay in the user's private environment to respect platform ToS.

---

## Developer Story

This project was built by Samir Ricardo, a Brazilian AI Engineer actively searching for a position in the R$15,000–R$20,000 range. The framework emerged from a real problem: applying to 20+ positions per week manually is unsustainable, but most automation tools are either too generic or too expensive.

The constraint of running on near-zero budget drove every architectural decision:
- Haiku by default (not GPT-4 or Opus)
- TF-IDF instead of vector databases
- QA cache to eliminate repeated calls
- FSM to avoid expensive re-processing of already-handled states

The result is a framework that costs less than a cup of coffee to run for a full month of aggressive job searching.

---

## Grant Request

We are applying for access to the **Claude for Open Source** program to:

1. Sustain the cost of running CI evaluations (each eval run = ~$0.05 with Haiku)
2. Enable `claude-sonnet-4-6` for cover letter generation in the free tier (currently gated behind user's own key)
3. Build a hosted demo at vraxia.com where developers can try the job filter agent against a mock dataset
4. Fund development of a web dashboard (Phase 2 roadmap) so non-technical users can benefit from the framework

The framework is MIT licensed. All development is public. The Anthropic API is the only AI dependency.

---

## Links

- Repository: https://github.com/SAMIRRICARDO/vraxia-work
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Plugin tutorial: [examples/plugin-tutorial/](./examples/plugin-tutorial/)
- Custom agent example: [examples/custom-agent/](./examples/custom-agent/)
