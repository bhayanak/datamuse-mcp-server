import { z } from 'zod';
import type { DatamuseClient } from '../client/datamuse-client.js';
import { formatWordTable, formatSimpleList } from '../utils/formatter.js';

export const spelledLikeSchema = z.object({
  pattern: z.string().min(1).describe('Spelling pattern (use ? for single wildcard, * for multi)'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleSpelledLike(
  client: DatamuseClient,
  args: z.infer<typeof spelledLikeSchema>,
): Promise<string> {
  const results = await client.words({
    sp: args.pattern,
    max: String(args.limit),
    md: 's',
  });
  return formatWordTable(results, `🔤 Words spelled like "${args.pattern}"`);
}

export const autocompleteSchema = z.object({
  prefix: z.string().min(1).describe('Word prefix to autocomplete'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(10)
    .describe('Maximum number of suggestions'),
});

export async function handleAutocomplete(
  client: DatamuseClient,
  args: z.infer<typeof autocompleteSchema>,
): Promise<string> {
  const results = await client.suggest(args.prefix, args.limit);
  return formatSimpleList(results, `✍️ Autocomplete for "${args.prefix}"`);
}
