# Example: Plugin Tutorial

This example shows how to create a custom plugin for VRAXIA Work.

## What is a plugin?

A plugin is a TypeScript class that implements `PluginInterface`. It receives a `PluginContext` (job, candidate profile, Anthropic client) and returns a `PluginResult`.

Plugins let you extend agent behavior — add cover letters, notify Slack, score culture fit — without modifying core code.

## Files

- `MyPlugin.ts` — a complete working plugin example

## Run

```bash
cd examples/plugin-tutorial
npx tsx demo.ts
```
