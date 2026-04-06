import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

function mockFetch(data: unknown) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(data), { status: 200 }));
}

describe('server', () => {
  const config = { baseUrl: 'https://api.datamuse.com', maxResults: 50, timeoutMs: 10000 };
  let client: Client;

  beforeEach(async () => {
    vi.restoreAllMocks();
    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
  });

  it('should list all 10 tools', async () => {
    const result = await client.listTools();
    expect(result.tools).toHaveLength(10);
    const names = result.tools.map((t) => t.name);
    expect(names).toContain('datamuse_rhymes');
    expect(names).toContain('datamuse_near_rhymes');
    expect(names).toContain('datamuse_synonyms');
    expect(names).toContain('datamuse_antonyms');
    expect(names).toContain('datamuse_related');
    expect(names).toContain('datamuse_sounds_like');
    expect(names).toContain('datamuse_spelled_like');
    expect(names).toContain('datamuse_autocomplete');
    expect(names).toContain('datamuse_word_info');
    expect(names).toContain('datamuse_creative_find');
  });

  it('datamuse_rhymes returns formatted results', async () => {
    mockFetch([{ word: 'dime', score: 100, numSyllables: 1 }]);
    const result = await client.callTool({ name: 'datamuse_rhymes', arguments: { word: 'time' } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Rhymes for "time"');
    expect(text).toContain('dime');
  });

  it('datamuse_near_rhymes returns formatted results', async () => {
    mockFetch([{ word: 'find', score: 85, numSyllables: 1 }]);
    const result = await client.callTool({
      name: 'datamuse_near_rhymes',
      arguments: { word: 'time' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Near rhymes for "time"');
    expect(text).toContain('find');
  });

  it('datamuse_synonyms returns formatted results', async () => {
    mockFetch([{ word: 'joyful', score: 100, numSyllables: 2 }]);
    const result = await client.callTool({
      name: 'datamuse_synonyms',
      arguments: { word: 'happy' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Synonyms for "happy"');
    expect(text).toContain('joyful');
  });

  it('datamuse_antonyms returns formatted results', async () => {
    mockFetch([{ word: 'sad', score: 100, numSyllables: 1 }]);
    const result = await client.callTool({
      name: 'datamuse_antonyms',
      arguments: { word: 'happy' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Antonyms for "happy"');
    expect(text).toContain('sad');
  });

  it('datamuse_related returns formatted results', async () => {
    mockFetch([{ word: 'beach', score: 90, numSyllables: 1 }]);
    const result = await client.callTool({
      name: 'datamuse_related',
      arguments: { word: 'ocean' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Trigger words for "ocean"');
    expect(text).toContain('beach');
  });

  it('datamuse_sounds_like returns formatted results', async () => {
    mockFetch([{ word: 'there', score: 100, numSyllables: 1 }]);
    const result = await client.callTool({
      name: 'datamuse_sounds_like',
      arguments: { word: 'their' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('sound like "their"');
    expect(text).toContain('there');
  });

  it('datamuse_spelled_like returns formatted results', async () => {
    mockFetch([{ word: 'cat', score: 100, numSyllables: 1 }]);
    const result = await client.callTool({
      name: 'datamuse_spelled_like',
      arguments: { pattern: 'ca?' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('spelled like "ca?"');
    expect(text).toContain('cat');
  });

  it('datamuse_autocomplete returns formatted results', async () => {
    mockFetch([{ word: 'hello', score: 1000 }]);
    const result = await client.callTool({
      name: 'datamuse_autocomplete',
      arguments: { prefix: 'hel' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Autocomplete for "hel"');
    expect(text).toContain('hello');
  });

  it('datamuse_word_info returns formatted results', async () => {
    mockFetch([{ word: 'test', score: 50, numSyllables: 1, tags: ['n'] }]);
    const result = await client.callTool({
      name: 'datamuse_word_info',
      arguments: { word: 'test' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Word Info: "test"');
  });

  it('datamuse_creative_find returns formatted results', async () => {
    mockFetch([{ word: 'ocean', score: 95 }]);
    const result = await client.callTool({
      name: 'datamuse_creative_find',
      arguments: { meaningLike: 'sea' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Creative Find');
    expect(text).toContain('ocean');
  });

  it('datamuse_creative_find returns error without constraints', async () => {
    const result = await client.callTool({ name: 'datamuse_creative_find', arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Please provide at least one constraint');
  });
});
