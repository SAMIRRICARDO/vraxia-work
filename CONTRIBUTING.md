# Contributing to VRAXIA Work

Thank you for your interest in contributing! This document explains how to get started, what kinds of contributions we value, and how the review process works.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Plugin Contributions](#plugin-contributions)
- [Style Guide](#style-guide)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to uphold it.

---

## How to Contribute

### Reporting Bugs

Open an issue using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Node.js version (`node --version`)
- OS and shell
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (redact any credentials)

### Suggesting Features

Open an issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md). Describe:
- The problem you're solving
- Your proposed solution
- Any alternatives considered

### Contributing Code

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature` or `fix/your-bug`
3. Make your changes
4. Run checks: `npm run typecheck && npm test`
5. Submit a pull request

---

## Development Setup

```bash
git clone https://github.com/SAMIRRICARDO/vraxia-work
cd vraxia-work
npm install

cp .env.example .env
# Add your ANTHROPIC_API_KEY for tests that call the API
```

### Running tests

```bash
npm test              # run all tests
npm run typecheck     # TypeScript type check (no build required)
```

### Running the CLI locally

```bash
npm run recover:dry   # test RecoveryAgent without browser or DB writes
npm run hunt          # full hunt pipeline (requires LinkedIn credentials)
```

---

## Project Structure

```
packages/core/        FSM, TruthEngine, ErrorClassifier — zero external deps
packages/agents/      AI agents built on @anthropic-ai/sdk
packages/rag/         5-layer questionnaire resolver
packages/plugins/     Plugin interface and built-in plugins
packages/notifications/ Notification adapters (Telegram, etc.)
apps/cli/             Command-line entry points
examples/             Minimal runnable examples
docs/                 Architecture docs and ADRs
```

Each package has its own `package.json` and `tsconfig.json`. The root workspace coordinates them via npm workspaces.

---

## Submitting Changes

### Pull Request checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm test` passes
- [ ] New behavior has a test (or explain why it's not testable)
- [ ] No credentials, tokens, or PII in the diff
- [ ] PR description explains the motivation

### Commit message format

```
type(scope): short description

feat(agents): add SalaryAdvisor agent
fix(rag): handle empty TF-IDF result gracefully
docs(readme): add quickstart section
test(core): add FSM transition coverage for blocked state
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

---

## Plugin Contributions

Plugins are the easiest way to contribute. A plugin is a TypeScript class that implements `PluginInterface`:

```typescript
import type { PluginInterface, PluginContext, PluginResult } from '@vraxia/plugins';

export class MyPlugin implements PluginInterface {
  name = 'my-plugin';
  description = 'Does something useful';

  async execute(ctx: PluginContext): Promise<PluginResult> {
    // ctx.job — the job listing
    // ctx.candidate — candidate profile
    // ctx.ai — Anthropic client (Haiku by default)
    return { success: true, data: { /* ... */ } };
  }
}
```

Place it in `packages/plugins/src/builtin/` and register it in `registry.ts`. See [examples/plugin-tutorial](examples/plugin-tutorial) for a complete walkthrough.

---

## Style Guide

- **TypeScript strict mode** — no `any` unless unavoidable and commented
- **ESM only** — `import/export`, no `require()`
- **No `console.log` in library code** — use the logger from `@vraxia/notifications`
- **Stateless tools** — agent state must not leak into plugin or tool functions
- **Comments only for non-obvious WHY** — not for what the code does
- **No build step in dev** — use `tsx` directly

---

## Questions?

Open a [Discussion](https://github.com/SAMIRRICARDO/vraxia-work/discussions) or reach out via the issue tracker.
