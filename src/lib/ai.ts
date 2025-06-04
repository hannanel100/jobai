import { openai } from '@ai-sdk/openai';

export const ai = openai('gpt-4o-mini');

export const AI_CONFIG = {
  model: 'gpt-4o-mini',
  maxTokens: 1000,
  temperature: 0.3, // Lower temperature for more consistent results
} as const;
