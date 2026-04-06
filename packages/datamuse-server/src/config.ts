export interface DatamuseConfig {
  baseUrl: string;
  maxResults: number;
  timeoutMs: number;
}

export function loadConfig(): DatamuseConfig {
  return {
    baseUrl: process.env.DATAMUSE_BASE_URL ?? 'https://api.datamuse.com',
    maxResults: parseInt(process.env.DATAMUSE_MAX_RESULTS ?? '50', 10),
    timeoutMs: parseInt(process.env.DATAMUSE_TIMEOUT_MS ?? '10000', 10),
  };
}
