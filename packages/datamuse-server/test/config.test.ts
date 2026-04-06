import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('config', () => {
  it('should return default config when no env vars set', () => {
    const original = { ...process.env };
    delete process.env.DATAMUSE_BASE_URL;
    delete process.env.DATAMUSE_MAX_RESULTS;
    delete process.env.DATAMUSE_TIMEOUT_MS;

    const config = loadConfig();

    expect(config.baseUrl).toBe('https://api.datamuse.com');
    expect(config.maxResults).toBe(50);
    expect(config.timeoutMs).toBe(10000);

    process.env = original;
  });

  it('should use env vars when set', () => {
    const original = { ...process.env };
    process.env.DATAMUSE_BASE_URL = 'https://custom.api.com';
    process.env.DATAMUSE_MAX_RESULTS = '100';
    process.env.DATAMUSE_TIMEOUT_MS = '5000';

    const config = loadConfig();

    expect(config.baseUrl).toBe('https://custom.api.com');
    expect(config.maxResults).toBe(100);
    expect(config.timeoutMs).toBe(5000);

    process.env = original;
  });
});
