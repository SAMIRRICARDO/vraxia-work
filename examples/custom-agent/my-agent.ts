import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { BaseAgent } from '@vraxia/agents';

interface ResumeScore {
  score: number;        // 0-100
  strengths: string[];
  gaps: string[];
  recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
}

class ResumeScoreAgent extends BaseAgent {
  constructor(client: Anthropic) {
    super(
      client,
      'claude-haiku-4-5-20251001',
      `You are a technical recruiter. Given a job description and a candidate resume,
output a JSON object with keys: score (0-100), strengths (string[]), gaps (string[]),
recommendation ("strong_yes" | "yes" | "no" | "strong_no").
Output only the JSON — no explanation, no markdown fences.`,
    );
  }

  async score(jobDescription: string, resume: string): Promise<ResumeScore> {
    const raw = await this.complete([
      {
        role: 'user',
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resume}`,
      },
    ]);
    return JSON.parse(raw) as ResumeScore;
  }
}

// Demo
const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY']! });
const agent = new ResumeScoreAgent(client);

const result = await agent.score(
  'AI Engineer with 3+ years TypeScript, experience with LLMs and prompt engineering, TypeScript, Node.js',
  'Senior developer. 5 years TypeScript/Node.js. Built LLM pipelines with Anthropic SDK. Led AI product at startup.',
);

console.log('Resume score:', JSON.stringify(result, null, 2));
console.log('Total cost so far: $' + agent.getTotalCost().toFixed(6));
