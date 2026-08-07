# ADR-001: Monorepo with npm Workspaces

**Status:** Accepted  
**Date:** 2026-08-06

## Context

VRAXIA Work has several distinct concerns: core state machine logic (zero deps), AI agents (Anthropic SDK), RAG (TF-IDF), plugins (extensible), notifications, and CLI. These could be a single package or split into separate packages.

## Decision

Use npm workspaces monorepo with one package per concern (`@vraxia/core`, `@vraxia/agents`, `@vraxia/rag`, `@vraxia/plugins`, `@vraxia/notifications`, `apps/cli`).

## Rationale

- **Isolation**: `@vraxia/core` has zero external dependencies — users can import just the FSM/ErrorClassifier without pulling in Anthropic SDK
- **Extensibility**: community plugins import from `@vraxia/plugins` without needing the full CLI
- **Testability**: each package can be tested in isolation
- **Future**: individual packages can be published to npm independently

## Consequences

- Slightly more `package.json` files to maintain
- TypeScript project references required for cross-package imports
- All packages must use ESM (`"type": "module"`)
