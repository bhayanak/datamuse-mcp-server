import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';
import { handleSpelledLike, handleAutocomplete } from '../src/tools/spelling.js';

describe('spelling tools', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('handleSpelledLike', () => {
    it('should return words matching pattern', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'cat', score: 100, numSyllables: 1 },
            { word: 'car', score: 95, numSyllables: 1 },
            { word: 'cap', score: 90, numSyllables: 1 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleSpelledLike(client, { pattern: 'ca?', limit: 20 });
      expect(result).toContain('🔤 Words spelled like "ca?"');
      expect(result).toContain('cat');
      expect(result).toContain('car');
    });

    it('should pass sp parameter', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleSpelledLike(client, { pattern: 't*tion', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('sp=t*tion');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleSpelledLike(client, { pattern: 'zzzzzz?', limit: 10 });
      expect(result).toContain('No results found');
    });
  });

  describe('handleAutocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'hello', score: 1000 },
            { word: 'help', score: 900 },
            { word: 'helicopter', score: 500 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleAutocomplete(client, { prefix: 'hel', limit: 10 });
      expect(result).toContain('✍️ Autocomplete for "hel"');
      expect(result).toContain('hello');
      expect(result).toContain('help');
      expect(result).toContain('helicopter');
      expect(result).toContain('Found: 3 results');
    });

    it('should call /sug endpoint', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleAutocomplete(client, { prefix: 'pro', limit: 5 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/sug');
      expect(calledUrl).toContain('s=pro');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleAutocomplete(client, { prefix: 'zzzzzz', limit: 5 });
      expect(result).toContain('No results found');
    });
  });
});
