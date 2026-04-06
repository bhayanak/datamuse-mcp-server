import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';
import { handleWordInfo, handleCreativeFind } from '../src/tools/metadata.js';

describe('metadata tools', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('handleWordInfo', () => {
    it('should return formatted word info', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              word: 'serendipity',
              score: 100,
              numSyllables: 5,
              defs: ['n\tgood luck in making unexpected discoveries'],
              tags: ['n', 'f:4.2'],
            },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleWordInfo(client, { word: 'serendipity' });
      expect(result).toContain('📖 Word Info: "serendipity"');
      expect(result).toContain('Definitions:');
      expect(result).toContain('(n) good luck in making unexpected discoveries');
      expect(result).toContain('Syllables: 5');
      expect(result).toContain('Frequency: 4.2 per million words');
      expect(result).toContain('Tags: n');
    });

    it('should handle word not found', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleWordInfo(client, { word: 'xyzzy' });
      expect(result).toContain('No information found for this word');
    });

    it('should request correct metadata flags', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'test', score: 1 }]), { status: 200 }),
      );

      await handleWordInfo(client, { word: 'test' });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('md=dpsrf');
      expect(calledUrl).toContain('ipa=1');
      expect(calledUrl).toContain('max=1');
    });

    it('should handle word with no defs or tags', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'test', score: 50, numSyllables: 1 }]), {
          status: 200,
        }),
      );

      const result = await handleWordInfo(client, { word: 'test' });
      expect(result).toContain('Syllables: 1');
      expect(result).toContain('Score: 50');
    });

    it('should handle word with tags but no frequency', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'run', score: 80, tags: ['v', 'n'] }]), {
          status: 200,
        }),
      );

      const result = await handleWordInfo(client, { word: 'run' });
      expect(result).toContain('Tags: v, n');
      expect(result).not.toContain('Frequency');
    });
  });

  describe('handleCreativeFind', () => {
    it('should find words matching meaning constraint', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              word: 'ocean',
              score: 95,
              defs: ['n\ta large body of salt water'],
            },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleCreativeFind(client, {
        meaningLike: 'sea',
        limit: 20,
      });
      expect(result).toContain('🎨 Creative Find');
      expect(result).toContain('means like "sea"');
      expect(result).toContain('ocean');
    });

    it('should combine multiple constraints', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'flower', score: 80 }]), { status: 200 }),
      );

      const result = await handleCreativeFind(client, {
        meaningLike: 'plant',
        soundsLike: 'flour',
        topic: 'garden',
        limit: 10,
      });

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('ml=plant');
      expect(calledUrl).toContain('sl=flour');
      expect(calledUrl).toContain('topics=garden');
      expect(result).toContain('means like "plant"');
      expect(result).toContain('sounds like "flour"');
      expect(result).toContain('topic: garden');
    });

    it('should return error when no constraints provided', async () => {
      const result = await handleCreativeFind(client, { limit: 20 });
      expect(result).toContain('Please provide at least one constraint');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleCreativeFind(client, {
        meaningLike: 'xyzzy',
        limit: 10,
      });
      expect(result).toContain('No results found matching those constraints');
    });

    it('should handle spelledLike constraint', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'test', score: 50 }]), { status: 200 }),
      );

      const result = await handleCreativeFind(client, {
        spelledLike: 't*st',
        limit: 10,
      });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('sp=t*st');
      expect(result).toContain('spelled like "t*st"');
    });

    it('should format results with definitions', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'ocean', score: 95, defs: ['n\ta large body of salt water'] },
            { word: 'sea', score: 90 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleCreativeFind(client, { meaningLike: 'water', limit: 10 });
      expect(result).toContain('n: a large body of salt water');
      expect(result).toContain('Found: 2 results');
    });
  });
});
