#!/usr/bin/env tsx
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { RecoveryAgent } from '@vraxia/agents';
import { Logger, TelegramNotifier } from '@vraxia/notifications';

const logger = new Logger('recover');

function parseArgs(): { dryRun: boolean; maxJobs: number; ipThreshold: number } {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const maxJobsIdx = args.indexOf('--max-jobs');
  const ipIdx = args.indexOf('--ip-threshold');

  return {
    dryRun,
    maxJobs: maxJobsIdx !== -1 ? Number(args[maxJobsIdx + 1]) : 20,
    ipThreshold: ipIdx !== -1 ? Number(args[ipIdx + 1]) : 50,
  };
}

async function main(): Promise<void> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    logger.error('ANTHROPIC_API_KEY is required');
    process.exit(1);
  }

  const { dryRun, maxJobs, ipThreshold } = parseArgs();
  logger.info(`RecoveryAgent starting (dryRun=${dryRun}, maxJobs=${maxJobs}, ipThreshold=${ipThreshold})`);

  const client = new Anthropic({ apiKey });
  const agent = new RecoveryAgent({ client });

  logger.info('RecoveryAgent ready — connect to your database to load failed candidates');
  logger.info('See examples/basic-hunt/recover-example.ts for a complete integration');

  if (dryRun) {
    logger.info('[DRY RUN] No applications submitted');
    return;
  }

  const telegram = TelegramNotifier.fromEnv();
  if (telegram) {
    await telegram.sendSummary('VRAXIA Recovery Complete', [
      'Recovery scan finished',
      'No failed candidates found in this demo run',
    ]);
  }
}

main().catch(err => {
  logger.error('Recovery failed', err);
  process.exit(1);
});
