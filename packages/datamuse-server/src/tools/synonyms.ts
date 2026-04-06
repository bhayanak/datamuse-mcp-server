import { z } from 'zod';
import type { DatamuseClient } from '../client/datamuse-client.js';
import { formatWordTable } from '../utils/formatter.js';

export const synonymsSchema = z.object({
  word: z.string().min(1).describe('Word to find synonyms for'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleSynonyms(
  client: DatamuseClient,
  args: z.infer<typeof synonymsSchema>,
): Promise<string> {
  const results = await client.words({
    rel_syn: args.word,
    max: String(args.limit),
    md: 's',
  });
  return formatWordTable(results, `📝 Synonyms for "${args.word}"`);
}

export const antonymsSchema = z.object({
  word: z.string().min(1).describe('Word to find antonyms for'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleAntonyms(
  client: DatamuseClient,
  args: z.infer<typeof antonymsSchema>,
): Promise<string> {
  const results = await client.words({
    rel_ant: args.word,
    max: String(args.limit),
    md: 's',
  });
  return formatWordTable(results, `🔄 Antonyms for "${args.word}"`);
}
