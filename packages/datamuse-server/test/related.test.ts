import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';
import { handleRelated } from '../src/tools/related.js';

describe('related tools', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('handleRelated', () => {
    it('should return trigger words by default', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            { word: 'beach', score: 90, numSyllables: 1 },
            { word: 'waves', score: 85, numSyllables: 1 },
          ]),
          { status: 200 },
        ),
      );

      const result = await handleRelated(client, {
        word: 'ocean',
        relation: 'triggers',
        limit: 20,
      });
      expect(result).toContain('🔗 Trigger words for "ocean"');
      expect(result).toContain('beach');
      expect(result).toContain('waves');
    });

    it('should use rel_trg for triggers', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleRelated(client, { word: 'dog', relation: 'triggers', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_trg=dog');
    });

    it('should use lc for followers', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'cream', score: 80 }]), { status: 200 }),
      );

      const result = await handleRelated(client, { word: 'ice', relation: 'followers', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('lc=ice');
      expect(result).toContain('➡️ Frequent followers');
    });

    it('should use rc for predecessors', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([{ word: 'ice', score: 80 }]), { status: 200 }),
      );

      const result = await handleRelated(client, {
        word: 'cream',
        relation: 'predecessors',
        limit: 10,
      });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rc=cream');
      expect(result).toContain('⬅️ Frequent predecessors');
    });

    it('should use rel_spc for kind_of', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleRelated(client, { word: 'dog', relation: 'kind_of', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_spc=dog');
    });

    it('should use rel_com for part_of', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleRelated(client, { word: 'car', relation: 'part_of', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_com=car');
    });

    it('should use rel_par for comprises', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await handleRelated(client, { word: 'forest', relation: 'comprises', limit: 10 });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_par=forest');
    });

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await handleRelated(client, {
        word: 'xyzzy',
        relation: 'triggers',
        limit: 10,
      });
      expect(result).toContain('No results found');
    });
  });
});
