import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatamuseClient } from './client/datamuse-client.js';
import type { DatamuseConfig } from './config.js';
import { rhymesSchema, handleRhymes, nearRhymesSchema, handleNearRhymes } from './tools/rhymes.js';
import {
  synonymsSchema,
  handleSynonyms,
  antonymsSchema,
  handleAntonyms,
} from './tools/synonyms.js';
import { relatedSchema, handleRelated } from './tools/related.js';
import { soundsLikeSchema, handleSoundsLike } from './tools/sounds.js';
import {
  spelledLikeSchema,
  handleSpelledLike,
  autocompleteSchema,
  handleAutocomplete,
} from './tools/spelling.js';
import {
  wordInfoSchema,
  handleWordInfo,
  creativeFindSchema,
  handleCreativeFind,
} from './tools/metadata.js';

export function createServer(config: DatamuseConfig): McpServer {
  const client = new DatamuseClient(config);

  const server = new McpServer({
    name: 'datamuse-mcp-server',
    version: '0.1.0',
  });

  server.tool(
    'datamuse_rhymes',
    'Find perfect rhyming words for a given word',
    rhymesSchema.shape,
    async (args) => ({
      content: [
        { type: 'text' as const, text: await handleRhymes(client, rhymesSchema.parse(args)) },
      ],
    }),
  );

  server.tool(
    'datamuse_near_rhymes',
    'Find approximate/near rhymes for a given word',
    nearRhymesSchema.shape,
    async (args) => ({
      content: [
        {
          type: 'text' as const,
          text: await handleNearRhymes(client, nearRhymesSchema.parse(args)),
        },
      ],
    }),
  );

  server.tool(
    'datamuse_synonyms',
    'Find synonyms for a given word',
    synonymsSchema.shape,
    async (args) => ({
      content: [
        { type: 'text' as const, text: await handleSynonyms(client, synonymsSchema.parse(args)) },
      ],
    }),
  );

  server.tool(
    'datamuse_antonyms',
    'Find antonyms (words with opposite meaning) for a given word',
    antonymsSchema.shape,
    async (args) => ({
      content: [
        { type: 'text' as const, text: await handleAntonyms(client, antonymsSchema.parse(args)) },
      ],
    }),
  );

  server.tool(
    'datamuse_related',
    'Find related/associated words (triggers, followers, predecessors, kind_of, part_of, comprises)',
    relatedSchema.shape,
    async (args) => ({
      content: [
        { type: 'text' as const, text: await handleRelated(client, relatedSchema.parse(args)) },
      ],
    }),
  );

  server.tool(
    'datamuse_sounds_like',
    'Find words that sound similar to a given word (homophones, near-homophones)',
    soundsLikeSchema.shape,
    async (args) => ({
      content: [
        {
          type: 'text' as const,
          text: await handleSoundsLike(client, soundsLikeSchema.parse(args)),
        },
      ],
    }),
  );

  server.tool(
    'datamuse_spelled_like',
    'Find words matching a spelling pattern (? = single wildcard, * = multi)',
    spelledLikeSchema.shape,
    async (args) => ({
      content: [
        {
          type: 'text' as const,
          text: await handleSpelledLike(client, spelledLikeSchema.parse(args)),
        },
      ],
    }),
  );

  server.tool(
    'datamuse_autocomplete',
    'Get autocomplete suggestions for a word prefix',
    autocompleteSchema.shape,
    async (args) => ({
      content: [
        {
          type: 'text' as const,
          text: await handleAutocomplete(client, autocompleteSchema.parse(args)),
        },
      ],
    }),
  );

  server.tool(
    'datamuse_word_info',
    'Get detailed word information: definitions, syllables, frequency, tags, pronunciation',
    wordInfoSchema.shape,
    async (args) => ({
      content: [
        { type: 'text' as const, text: await handleWordInfo(client, wordInfoSchema.parse(args)) },
      ],
    }),
  );

  server.tool(
    'datamuse_creative_find',
    'Complex multi-constraint word finding: combine meaning, sound, spelling, and topic filters',
    creativeFindSchema.shape,
    async (args) => ({
      content: [
        {
          type: 'text' as const,
          text: await handleCreativeFind(client, creativeFindSchema.parse(args)),
        },
      ],
    }),
  );

  return server;
}
