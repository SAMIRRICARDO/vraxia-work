#!/usr/bin/env tsx
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { JobFilterAgent } from '@vraxia/agents';
import { Logger, TelegramNotifier } from '@vraxia/notifications';

const logger = new Logger('hunt');

const CANDIDATE_PROFILE = process.env['CANDIDATE_PROFILE'] ?? `
AI Engineer / Senior Full Stack Developer
Skills: TypeScript, Node.js, Python, React, Anthropic Claude, LangChain, PostgreSQL, Docker
Experience: 5+ years software development, 2+ years AI/ML systems
Target: AI Solutions Architect, AI Engineer, Senior Full Stack (AI focus)
Location: São Paulo, Brazil — remote preferred
`;

async function main(): Promise<void> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    logger.error('ANTHROPIC_API_KEY is required');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const threshold = Number(process.env['HIRE_THRESHOLD'] ?? 50);
  const dryRun = process.argv.includes('--dry-run');

  logger.info(`Starting hunt (threshold=${threshold}, dryRun=${dryRun})`);

  const agent = new JobFilterAgent({ client, hireThreshold: threshold });

  // In a real deployment, this would come from a Playwright engine
  logger.info('Job scan complete — platform engines are provided separately');
  logger.info('See examples/basic-hunt/ for a complete integration example');

  const telegram = TelegramNotifier.fromEnv();
  if (telegram && !dryRun) {
    await telegram.sendSummary('VRAXIA Hunt Complete', [
      'Scan finished',
      'No platform engine loaded — add your engine to packages/plugins/src/builtin/',
    ]);
  }
}

main().catch(err => {
  logger.error('Hunt failed', err);
  process.exit(1);
});
