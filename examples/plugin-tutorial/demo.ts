import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { PluginRegistry } from '@vraxia/plugins';
import { PitchPlugin } from './MyPlugin.js';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY']! });
const registry = new PluginRegistry();
registry.register(new PitchPlugin());

const result = await registry.run('pitch', {
  job: {
    id: '1',
    title: 'AI Engineer',
    company: 'Acme Corp',
    platform: 'linkedin',
    url: 'https://example.com',
    isEasyApply: true,
  },
  candidateProfile: 'Senior TypeScript developer with 3 years of LLM/Claude integration experience',
  ai: client,
});

console.log('Plugin result:', result);
