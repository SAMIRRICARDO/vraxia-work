# Custom Agent Example

This example shows how to create a custom agent that extends `BaseAgent` from `@vraxia/agents`.

## What this builds

A `ResumeScoreAgent` that reads a job description and a candidate resume, then returns a structured score with strengths, gaps, and a hiring recommendation.

## Prerequisites

```bash
cp ../../.env.example .env
# Fill in ANTHROPIC_API_KEY
npm install
```

## Run

```bash
npx tsx my-agent.ts
```

## Cost

~$0.0003 per call (Haiku, ~300 input tokens + 100 output tokens)
