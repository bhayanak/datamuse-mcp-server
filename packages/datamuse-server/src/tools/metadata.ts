import { z } from 'zod';
import type { DatamuseClient } from '../client/datamuse-client.js';
import { formatWordInfo } from '../utils/formatter.js';

export const wordInfoSchema = z.object({
  word: z.string().min(1).describe('Word to look up'),
});

export async function handleWordInfo(
  client: DatamuseClient,
  args: z.infer<typeof wordInfoSchema>,
): Promise<string> {
  const results = await client.words({
    sp: args.word,
    max: '1',
    md: 'dpsrf',
    ipa: '1',
  });

  if (results.length === 0) {
    return `📖 Word Info: "${args.word}"\n\nNo information found for this word.`;
  }

  return formatWordInfo(results[0]);
}

export const creativeFindSchema = z.object({
  meaningLike: z.string().optional().describe('Means like this word'),
  soundsLike: z.string().optional().describe('Sounds like this word'),
  spelledLike: z.string().optional().describe('Spelled like this pattern'),
  topic: z.string().optional().describe("Topic hint (e.g., 'ocean', 'music')"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleCreativeFind(
  client: DatamuseClient,
  args: z.infer<typeof creativeFindSchema>,
): Promise<string> {
  const params: Record<string, string> = {
    max: String(args.limit),
    md: 'dps',
  };

  if (args.meaningLike) params.ml = args.meaningLike;
  if (args.soundsLike) params.sl = args.soundsLike;
  if (args.spelledLike) params.sp = args.spelledLike;
  if (args.topic) params.topics = args.topic;

  const hasConstraints = args.meaningLike || args.soundsLike || args.spelledLike;
  if (!hasConstraints) {
    return '🎨 Creative Find\n\nPlease provide at least one constraint: meaningLike, soundsLike, or spelledLike.';
  }

  const results = await client.words(params);

  const constraints: string[] = [];
  if (args.meaningLike) constraints.push(`means like "${args.meaningLike}"`);
  if (args.soundsLike) constraints.push(`sounds like "${args.soundsLike}"`);
  if (args.spelledLike) constraints.push(`spelled like "${args.spelledLike}"`);
  if (args.topic) constraints.push(`topic: ${args.topic}`);

  const title = `🎨 Creative Find (${constraints.join(', ')})`;

  if (results.length === 0) {
    return `${title}\n\nNo results found matching those constraints.`;
  }

  const lines = results.map((w) => {
    const parts = [`  • ${w.word}`];
    if (w.score) parts.push(`(score: ${w.score})`);
    if (w.defs && w.defs.length > 0) {
      const [pos, meaning] = w.defs[0].split('\t');
      parts.push(`— ${pos}: ${meaning}`);
    }
    return parts.join(' ');
  });

  return [title, '', ...lines, '', `Found: ${results.length} results`].join('\n');
}
