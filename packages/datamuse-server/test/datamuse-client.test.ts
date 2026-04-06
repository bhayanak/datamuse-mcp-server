import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatamuseClient } from '../src/client/datamuse-client.js';

describe('DatamuseClient', () => {
  const config = {
    baseUrl: 'https://api.datamuse.com',
    maxResults: 50,
    timeoutMs: 10000,
  };

  let client: DatamuseClient;

  beforeEach(() => {
    client = new DatamuseClient(config);
    vi.restoreAllMocks();
  });

  describe('words()', () => {
    it('should call the correct URL with params', async () => {
      const mockResponse = [{ word: 'dime', score: 100, numSyllables: 1 }];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const result = await client.words({ rel_rhy: 'time', max: '5' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(1);

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('api.datamuse.com/words');
      expect(calledUrl).toContain('rel_rhy=time');
      expect(calledUrl).toContain('max=5');
    });

    it('should skip empty values in params', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await client.words({ rel_rhy: 'test', ml: '', max: '10' });

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('ml=');
      expect(calledUrl).toContain('rel_rhy=test');
    });

    it('should throw on non-200 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
      );

      await expect(client.words({ rel_rhy: 'time' })).rejects.toThrow(
        'Datamuse API error: 500 Internal Server Error',
      );
    });

    it('should throw on abort (timeout)', async () => {
      const shortTimeoutClient = new DatamuseClient({
        ...config,
        timeoutMs: 1,
      });

      vi.spyOn(globalThis, 'fetch').mockImplementation(
        (_url: string | URL | Request, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            const signal = init?.signal;
            if (signal) {
              signal.addEventListener('abort', () => reject(signal.reason));
            }
          }),
      );

      await expect(shortTimeoutClient.words({ rel_rhy: 'time' })).rejects.toThrow();
    });

    it('should handle trailing slashes in base URL', async () => {
      const trailingSlashClient = new DatamuseClient({
        ...config,
        baseUrl: 'https://api.datamuse.com///',
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await trailingSlashClient.words({ rel_rhy: 'test' });
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toMatch(/^https:\/\/api\.datamuse\.com\/words/);
    });
  });

  describe('suggest()', () => {
    it('should call the /sug endpoint', async () => {
      const mockResponse = [{ word: 'hello', score: 1000 }];
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

      const result = await client.suggest('hel', 5);

      expect(result).toEqual(mockResponse);
      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/sug');
      expect(calledUrl).toContain('s=hel');
      expect(calledUrl).toContain('max=5');
    });

    it('should throw on non-200 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Not Found', { status: 404, statusText: 'Not Found' }),
      );

      await expect(client.suggest('xyz', 5)).rejects.toThrow('Datamuse API error: 404 Not Found');
    });

    it('should throw on abort (timeout)', async () => {
      const shortTimeoutClient = new DatamuseClient({
        ...config,
        timeoutMs: 1,
      });

      vi.spyOn(globalThis, 'fetch').mockImplementation(
        (_url: string | URL | Request, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            const signal = init?.signal;
            if (signal) {
              signal.addEventListener('abort', () => reject(signal.reason));
            }
          }),
      );

      await expect(shortTimeoutClient.suggest('hel', 5)).rejects.toThrow();
    });
  });
});
