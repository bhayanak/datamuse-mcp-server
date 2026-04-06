import { z } from 'zod';
import type { DatamuseClient } from '../client/datamuse-client.js';
import { formatWordTable } from '../utils/formatter.js';

export const soundsLikeSchema = z.object({
  word: z.string().min(1).describe('Word or phonetic pattern'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleSoundsLike(
  client: DatamuseClient,
  args: z.infer<typeof soundsLikeSchema>,
): Promise<string> {
  const results = await client.words({
    sl: args.word,
    max: String(args.limit),
    md: 's',
  });
  return formatWordTable(results, `🔊 Words that sound like "${args.word}"`);
}
