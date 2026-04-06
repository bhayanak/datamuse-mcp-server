import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';
import { handleSoundsLike } from '../src/tools/sounds.js';

describe('sounds tools', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('handleSoundsLike', () => {
    it('should return words that sound alike', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'there', score: 100, numSyllables: 1 },
            { word: "they're", score: 98, numSyllables: 1 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleSoundsLike(client, { word: 'their', limit: 20 });
      expect(result).toContain('🔊 Words that sound like "their"');
      expect(result).toContain('there');
    });

    it('should pass sl parameter', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleSoundsLike(client, { word: 'flower', limit: 5 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('sl=flower');
      expect(calledUrl).toContain('max=5');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleSoundsLike(client, { word: 'xyzzy', limit: 10 });
      expect(result).toContain('No results found');
    });
  });
});
