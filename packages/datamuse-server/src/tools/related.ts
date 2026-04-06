import { z } from 'zod';
import type { DatamuseClient } from '../client/datamuse-client.js';
import { formatWordTable } from '../utils/formatter.js';

const RELATION_MAP: Record<string, string> = {
  triggers: 'rel_trg',
  followers: 'lc',
  predecessors: 'rc',
  kind_of: 'rel_spc',
  part_of: 'rel_com',
  comprises: 'rel_par',
};

const RELATION_LABELS: Record<string, string> = {
  triggers: '🔗 Trigger words',
  followers: '➡️ Frequent followers',
  predecessors: '⬅️ Frequent predecessors',
  kind_of: '🌳 Kind of (hypernyms)',
  part_of: '🧩 Part of (holonyms)',
  comprises: '📦 Comprises (meronyms)',
};

export const relatedSchema = z.object({
  word: z.string().min(1).describe('Trigger word'),
  relation: z
    .enum(['triggers', 'followers', 'predecessors', 'kind_of', 'part_of', 'comprises'])
    .optional()
    .default('triggers')
    .describe('Type of word relation'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(20)
    .describe('Maximum number of results'),
});

export async function handleRelated(
  client: DatamuseClient,
  args: z.infer<typeof relatedSchema>,
): Promise<string> {
  const apiParam = RELATION_MAP[args.relation];
  const label = RELATION_LABELS[args.relation];

  const params: Record<string, string> = {
    max: String(args.limit),
    md: 's',
  };

  if (args.relation === 'followers') {
    params.lc = args.word;
  } else if (args.relation === 'predecessors') {
    params.rc = args.word;
  } else {
    params[apiParam] = args.word;
  }

  const results = await client.words(params);
  return formatWordTable(results, `${label} for "${args.word}"`);
}
