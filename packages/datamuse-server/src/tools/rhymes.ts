import { z } from 'zod';
import type { DatamuseClient } from '../client/datamuse-client.js';
import { formatWordTable } from '../utils/formatter.js';

export const rhymesSchema = z.object({
  word: z.string().min(1).describe('Word to find rhymes for'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleRhymes(
  client: DatamuseClient,
  args: z.infer<typeof rhymesSchema>,
): Promise<string> {
  const results = await client.words({
    rel_rhy: args.word,
    max: String(args.limit),
    md: 's',
  });
  return formatWordTable(results, `🎵 Rhymes for "${args.word}"`);
}

export const nearRhymesSchema = z.object({
  word: z.string().min(1).describe('Word to find near-rhymes for'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleNearRhymes(
  client: DatamuseClient,
  args: z.infer<typeof nearRhymesSchema>,
): Promise<string> {
  const results = await client.words({
    rel_nry: args.word,
    max: String(args.limit),
    md: 's',
  });
  return formatWordTable(results, `🎶 Near rhymes for "${args.word}"`);
}
