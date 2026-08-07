# Example: Basic Hunt

This example shows how to wire up a platform engine (your Playwright scraper) to the VRAXIA Work pipeline.

## Files

- `scan.ts` — fetches job listings from a mock source and runs them through `JobFilterAgent`
- `recover-example.ts` — shows how to load failed jobs from a DB and run `RecoveryAgent`

## Run

```bash
cd examples/basic-hunt
cp ../../.env.example .env
# fill in ANTHROPIC_API_KEY
npm install
npx tsx scan.ts
```
