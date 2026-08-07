import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { JobFilterAgent } from '@vraxia/agents';
import type { Job } from '@vraxia/core';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY']! });
const agent = new JobFilterAgent({ client, hireThreshold: 50 });

// Replace this with your Playwright engine output
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'AI Engineer',
    company: 'Acme Corp',
    platform: 'linkedin',
    url: 'https://linkedin.com/jobs/view/123',
    isEasyApply: true,
    description: 'Build LLM-powered features using Claude. TypeScript, Node.js, RAG required.',
  },
  {
    id: '2',
    title: 'Receptionist',
    company: 'Office Inc',
    platform: 'linkedin',
    url: 'https://linkedin.com/jobs/view/456',
    isEasyApply: true,
    description: 'Answer phones, manage schedules, greet visitors.',
  },
];

const candidateProfile = `
Senior Full Stack Developer with 5 years experience.
Strong in TypeScript, Node.js, React, AI/LLM integration, Claude API.
Looking for AI Engineer or Senior Full Stack roles in Brazil.
`;

const result = await agent.filterBatch(mockJobs, candidateProfile);

console.log(`Scanned: ${result.data?.totalScanned}`);
console.log(`Relevant: ${result.data?.relevant.length}`);
console.log(`Rejected: ${result.data?.rejected.length}`);
console.log(`Cost: $${result.tokenUsage?.estimatedCostUsd.toFixed(6)}`);

for (const job of result.data?.relevant ?? []) {
  console.log(`  → ${job.title} at ${job.company} (IP: ${job.interviewProbability})`);
}
