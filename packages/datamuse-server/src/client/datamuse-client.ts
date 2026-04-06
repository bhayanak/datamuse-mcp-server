import type { DatamuseConfig } from '../config.js';

export interface DatamuseWord {
  word: string;
  score?: number;
  numSyllables?: number;
  tags?: string[];
  defs?: string[];
}

export class DatamuseClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config: DatamuseConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs;
  }

  async words(params: Record<string, string>): Promise<DatamuseWord[]> {
    const url = new URL('/words', this.baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as DatamuseWord[];
    } finally {
      clearTimeout(timer);
    }
  }

  async suggest(prefix: string, max: number): Promise<DatamuseWord[]> {
    const url = new URL('/sug', this.baseUrl);
    url.searchParams.set('s', prefix);
    url.searchParams.set('max', String(max));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as DatamuseWord[];
    } finally {
      clearTimeout(timer);
    }
  }
}
