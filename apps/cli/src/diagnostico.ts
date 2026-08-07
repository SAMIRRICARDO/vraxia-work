#!/usr/bin/env tsx
import 'dotenv/config';
import { Logger } from '@vraxia/notifications';

const logger = new Logger('diagnostico');

async function main(): Promise<void> {
  logger.info('Running VRAXIA Work diagnostics...');

  const checks = [
    { name: 'ANTHROPIC_API_KEY', value: process.env['ANTHROPIC_API_KEY'], required: true },
    { name: 'LINKEDIN_EMAIL', value: process.env['LINKEDIN_EMAIL'], required: false },
    { name: 'TELEGRAM_BOT_TOKEN', value: process.env['TELEGRAM_BOT_TOKEN'], required: false },
    { name: 'HIRE_THRESHOLD', value: process.env['HIRE_THRESHOLD'] ?? '50 (default)', required: false },
    { name: 'RESUME_PATH', value: process.env['RESUME_PATH'], required: false },
  ];

  let allRequired = true;
  for (const check of checks) {
    const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
    const val = check.value ? '[SET]' : '[NOT SET]';
    process.stdout.write(`  ${status} ${check.name}: ${val}\n`);
    if (check.required && !check.value) allRequired = false;
  }

  if (!allRequired) {
    logger.error('Required environment variables are missing. Copy .env.example to .env and fill in values.');
    process.exit(1);
  }

  logger.success('All required environment variables are set');
  logger.info('Node.js version: ' + process.version);
}

main().catch(err => {
  logger.error('Diagnostics failed', err);
  process.exit(1);
});
