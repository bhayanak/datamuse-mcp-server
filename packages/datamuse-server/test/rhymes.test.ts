import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';
import { handleRhymes, handleNearRhymes } from '../src/tools/rhymes.js';

describe('rhymes tools', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('handleRhymes', () => {
    it('should return formatted rhymes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'dime', score: 100, numSyllables: 1 },
            { word: 'lime', score: 98, numSyllables: 1 },
            { word: 'sublime', score: 78, numSyllables: 2 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleRhymes(client, { word: 'time', limit: 20 });

      expect(result).toContain('🎵 Rhymes for "time"');
      expect(result).toContain('dime');
      expect(result).toContain('lime');
      expect(result).toContain('sublime');
      expect(result).toContain('Found: 3 results');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleRhymes(client, { word: 'xyzzy', limit: 20 });
      expect(result).toContain('No results found');
    });

    it('should pass limit to API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleRhymes(client, { word: 'cat', limit: 5 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('max=5');
      expect(calledUrl).toContain('rel_rhy=cat');
    });
  });

  describe('handleNearRhymes', () => {
    it('should return formatted near rhymes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'find', score: 85, numSyllables: 1 }]), {
          status: 200,
        }),
      );

      const result = await handleNearRhymes(client, { word: 'time', limit: 20 });
      expect(result).toContain('🎶 Near rhymes for "time"');
      expect(result).toContain('find');
    });

    it('should pass correct relation parameter', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleNearRhymes(client, { word: 'orange', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_nry=orange');
    });
  });
});
