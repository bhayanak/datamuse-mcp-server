import { describe, it, expect } from 'vitest';
import { formatWordTable, formatWordInfo, formatSimpleList } from '../src/utils/formatter.js';
import type { DatamuseWord } from '../src/client/datamuse-client.js';

describe('formatter', () => {
  describe('formatWordTable', () => {
    it('should format a table with words', () => {
      const words: DatamuseWord[] = [
        { word: 'dime', score: 100, numSyllables: 1 },
        { word: 'lime', score: 98, numSyllables: 1 },
        { word: 'sublime', score: 78, numSyllables: 2 },
      ];

      const result = formatWordTable(words, '🎵 Test');
      expect(result).toContain('🎵 Test');
      expect(result).toContain('Word');
      expect(result).toContain('Score');
      expect(result).toContain('Syllables');
      expect(result).toContain('dime');
      expect(result).toContain('100');
      expect(result).toContain('sublime');
      expect(result).toContain('Found: 3 results');
    });

    it('should handle empty results', () => {
      const result = formatWordTable([], 'Test');
      expect(result).toContain('No results found');
    });

    it('should handle missing score and syllables', () => {
      const words: DatamuseWord[] = [{ word: 'test' }];
      const result = formatWordTable(words, 'Test');
      expect(result).toContain('test');
      expect(result).toContain('-');
    });
  });

  describe('formatWordInfo', () => {
    it('should format complete word info', () => {
      const word: DatamuseWord = {
        word: 'serendipity',
        score: 100,
        numSyllables: 5,
        defs: ['n\tgood luck in making unexpected discoveries'],
        tags: ['n', 'f:4.2'],
      };

      const result = formatWordInfo(word);
      expect(result).toContain('📖 Word Info: "serendipity"');
      expect(result).toContain('Definitions:');
      expect(result).toContain('(n) good luck in making unexpected discoveries');
      expect(result).toContain('Syllables: 5');
      expect(result).toContain('Frequency: 4.2');
      expect(result).toContain('Tags: n');
      expect(result).toContain('Score: 100');
    });

    it('should handle word with no defs', () => {
      const word: DatamuseWord = { word: 'test', numSyllables: 1 };
      const result = formatWordInfo(word);
      expect(result).toContain('📖 Word Info: "test"');
      expect(result).toContain('Syllables: 1');
      expect(result).not.toContain('Definitions');
    });

    it('should handle word with no tags', () => {
      const word: DatamuseWord = { word: 'test' };
      const result = formatWordInfo(word);
      expect(result).not.toContain('Tags');
      expect(result).not.toContain('Frequency');
    });

    it('should handle word with empty tags', () => {
      const word: DatamuseWord = { word: 'test', tags: [] };
      const result = formatWordInfo(word);
      expect(result).not.toContain('Tags');
    });

    it('should handle word with multiple defs', () => {
      const word: DatamuseWord = {
        word: 'run',
        defs: ['v\tto move quickly', 'n\tan act of running'],
      };
      const result = formatWordInfo(word);
      expect(result).toContain('(v) to move quickly');
      expect(result).toContain('(n) an act of running');
    });
  });

  describe('formatSimpleList', () => {
    it('should format a simple list with scores', () => {
      const words: DatamuseWord[] = [
        { word: 'hello', score: 1000 },
        { word: 'help', score: 900 },
      ];
      const result = formatSimpleList(words, '✍️ Test');
      expect(result).toContain('✍️ Test');
      expect(result).toContain('• hello (score: 1000)');
      expect(result).toContain('• help (score: 900)');
      expect(result).toContain('Found: 2 results');
    });

    it('should handle empty results', () => {
      const result = formatSimpleList([], 'Test');
      expect(result).toContain('No results found');
    });

    it('should handle words without scores', () => {
      const words: DatamuseWord[] = [{ word: 'hello' }];
      const result = formatSimpleList(words, 'Test');
      expect(result).toContain('• hello');
      expect(result).not.toContain('score');
    });
  });
});
