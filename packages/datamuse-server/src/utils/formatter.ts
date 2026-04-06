import type { DatamuseWord } from '../client/datamuse-client.js';

export function formatWordTable(words: DatamuseWord[], title: string): string {
  if (words.length === 0) {
    return `${title}\n\nNo results found.`;
  }

  const header = `${'Word'.padEnd(24)}${'Score'.padEnd(10)}Syllables`;
  const separator = '━'.repeat(50);

  const rows = words.map((w) => {
    const word = w.word.padEnd(24);
    const score = (w.score?.toString() ?? '-').padEnd(10);
    const syllables = w.numSyllables?.toString() ?? '-';
    return `${word}${score}${syllables}`;
  });

  return [title, '', header, separator, ...rows, '', `Found: ${words.length} results`].join('\n');
}

export function formatWordInfo(word: DatamuseWord): string {
  const lines: string[] = [`📖 Word Info: "${word.word}"`, ''];

  if (word.defs && word.defs.length > 0) {
    lines.push('Definitions:');
    for (const def of word.defs) {
      const [pos, meaning] = def.split('\t');
      lines.push(`  • (${pos}) ${meaning}`);
    }
    lines.push('');
  }

  if (word.numSyllables !== undefined) {
    lines.push(`Syllables: ${word.numSyllables}`);
  }

  if (word.tags && word.tags.length > 0) {
    const posTags = word.tags.filter((t) => !t.startsWith('f:'));
    const freqTags = word.tags.filter((t) => t.startsWith('f:'));

    if (freqTags.length > 0) {
      lines.push(`Frequency: ${freqTags[0].slice(2)} per million words`);
    }
    if (posTags.length > 0) {
      lines.push(`Tags: ${posTags.join(', ')}`);
    }
  }

  if (word.score !== undefined) {
    lines.push(`Score: ${word.score}`);
  }

  return lines.join('\n');
}

export function formatSimpleList(words: DatamuseWord[], title: string): string {
  if (words.length === 0) {
    return `${title}\n\nNo results found.`;
  }

  const items = words.map((w) => `  • ${w.word}${w.score ? ` (score: ${w.score})` : ''}`);

  return [title, '', ...items, '', `Found: ${words.length} results`].join('\n');
}
