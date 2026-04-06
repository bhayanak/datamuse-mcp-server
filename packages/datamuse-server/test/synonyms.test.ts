import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';
import { handleSynonyms, handleAntonyms } from '../src/tools/synonyms.js';

describe('synonyms tools', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('handleSynonyms', () => {
    it('should return formatted synonyms', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'joyful', score: 100, numSyllables: 2 },
            { word: 'glad', score: 95, numSyllables: 1 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleSynonyms(client, { word: 'happy', limit: 20 });

      expect(result).toContain('📝 Synonyms for "happy"');
      expect(result).toContain('joyful');
      expect(result).toContain('glad');
      expect(result).toContain('Found: 2 results');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleSynonyms(client, { word: 'xyzzy', limit: 20 });
      expect(result).toContain('No results found');
    });

    it('should pass rel_syn to API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleSynonyms(client, { word: 'fast', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_syn=fast');
    });
  });

  describe('handleAntonyms', () => {
    it('should return formatted antonyms', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'sad', score: 100, numSyllables: 1 }]), {
          status: 200,
        }),
      );

      const result = await handleAntonyms(client, { word: 'happy', limit: 20 });
      expect(result).toContain('🔄 Antonyms for "happy"');
      expect(result).toContain('sad');
    });

    it('should pass rel_ant to API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleAntonyms(client, { word: 'hot', limit: 5 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_ant=hot');
      expect(calledUrl).toContain('max=5');
    });
  });
});
