#!/usr/bin/env node

// src/index.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/config.ts
function loadConfig() {
  return {
    baseUrl: process.env.DATAMUSE_BASE_URL ?? "https://api.datamuse.com",
    maxResults: parseInt(process.env.DATAMUSE_MAX_RESULTS ?? "50", 10),
    timeoutMs: parseInt(process.env.DATAMUSE_TIMEOUT_MS ?? "10000", 10)
  };
}

// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// src/client/datamuse-client.ts
var DatamuseClient = class {
  baseUrl;
  timeoutMs;
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = config.timeoutMs;
  }
  async words(params) {
    const url = new URL("/words", this.baseUrl);
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
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }
  async suggest(prefix, max) {
    const url = new URL("/sug", this.baseUrl);
    url.searchParams.set("s", prefix);
    url.searchParams.set("max", String(max));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }
};

// src/tools/rhymes.ts
import { z } from "zod";

// src/utils/formatter.ts
function formatWordTable(words, title) {
  if (words.length === 0) {
    return `${title}

No results found.`;
  }
  const header = `${"Word".padEnd(24)}${"Score".padEnd(10)}Syllables`;
  const separator = "\u2501".repeat(50);
  const rows = words.map((w) => {
    const word = w.word.padEnd(24);
    const score = (w.score?.toString() ?? "-").padEnd(10);
    const syllables = w.numSyllables?.toString() ?? "-";
    return `${word}${score}${syllables}`;
  });
  return [title, "", header, separator, ...rows, "", `Found: ${words.length} results`].join("\n");
}
function formatWordInfo(word) {
  const lines = [`\u{1F4D6} Word Info: "${word.word}"`, ""];
  if (word.defs && word.defs.length > 0) {
    lines.push("Definitions:");
    for (const def of word.defs) {
      const [pos, meaning] = def.split("	");
      lines.push(`  \u2022 (${pos}) ${meaning}`);
    }
    lines.push("");
  }
  if (word.numSyllables !== void 0) {
    lines.push(`Syllables: ${word.numSyllables}`);
  }
  if (word.tags && word.tags.length > 0) {
    const posTags = word.tags.filter((t) => !t.startsWith("f:"));
    const freqTags = word.tags.filter((t) => t.startsWith("f:"));
    if (freqTags.length > 0) {
      lines.push(`Frequency: ${freqTags[0].slice(2)} per million words`);
    }
    if (posTags.length > 0) {
      lines.push(`Tags: ${posTags.join(", ")}`);
    }
  }
  if (word.score !== void 0) {
    lines.push(`Score: ${word.score}`);
  }
  return lines.join("\n");
}
function formatSimpleList(words, title) {
  if (words.length === 0) {
    return `${title}

No results found.`;
  }
  const items = words.map((w) => `  \u2022 ${w.word}${w.score ? ` (score: ${w.score})` : ""}`);
  return [title, "", ...items, "", `Found: ${words.length} results`].join("\n");
}

// src/tools/rhymes.ts
var rhymesSchema = z.object({
  word: z.string().min(1).describe("Word to find rhymes for"),
  limit: z.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleRhymes(client, args) {
  const results = await client.words({
    rel_rhy: args.word,
    max: String(args.limit),
    md: "s"
  });
  return formatWordTable(results, `\u{1F3B5} Rhymes for "${args.word}"`);
}
var nearRhymesSchema = z.object({
  word: z.string().min(1).describe("Word to find near-rhymes for"),
  limit: z.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleNearRhymes(client, args) {
  const results = await client.words({
    rel_nry: args.word,
    max: String(args.limit),
    md: "s"
  });
  return formatWordTable(results, `\u{1F3B6} Near rhymes for "${args.word}"`);
}

// src/tools/synonyms.ts
import { z as z2 } from "zod";
var synonymsSchema = z2.object({
  word: z2.string().min(1).describe("Word to find synonyms for"),
  limit: z2.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleSynonyms(client, args) {
  const results = await client.words({
    rel_syn: args.word,
    max: String(args.limit),
    md: "s"
  });
  return formatWordTable(results, `\u{1F4DD} Synonyms for "${args.word}"`);
}
var antonymsSchema = z2.object({
  word: z2.string().min(1).describe("Word to find antonyms for"),
  limit: z2.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleAntonyms(client, args) {
  const results = await client.words({
    rel_ant: args.word,
    max: String(args.limit),
    md: "s"
  });
  return formatWordTable(results, `\u{1F504} Antonyms for "${args.word}"`);
}

// src/tools/related.ts
import { z as z3 } from "zod";
var RELATION_MAP = {
  triggers: "rel_trg",
  followers: "lc",
  predecessors: "rc",
  kind_of: "rel_spc",
  part_of: "rel_com",
  comprises: "rel_par"
};
var RELATION_LABELS = {
  triggers: "\u{1F517} Trigger words",
  followers: "\u27A1\uFE0F Frequent followers",
  predecessors: "\u2B05\uFE0F Frequent predecessors",
  kind_of: "\u{1F333} Kind of (hypernyms)",
  part_of: "\u{1F9E9} Part of (holonyms)",
  comprises: "\u{1F4E6} Comprises (meronyms)"
};
var relatedSchema = z3.object({
  word: z3.string().min(1).describe("Trigger word"),
  relation: z3.enum(["triggers", "followers", "predecessors", "kind_of", "part_of", "comprises"]).optional().default("triggers").describe("Type of word relation"),
  limit: z3.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleRelated(client, args) {
  const apiParam = RELATION_MAP[args.relation];
  const label = RELATION_LABELS[args.relation];
  const params = {
    max: String(args.limit),
    md: "s"
  };
  if (args.relation === "followers") {
    params.lc = args.word;
  } else if (args.relation === "predecessors") {
    params.rc = args.word;
  } else {
    params[apiParam] = args.word;
  }
  const results = await client.words(params);
  return formatWordTable(results, `${label} for "${args.word}"`);
}

// src/tools/sounds.ts
import { z as z4 } from "zod";
var soundsLikeSchema = z4.object({
  word: z4.string().min(1).describe("Word or phonetic pattern"),
  limit: z4.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleSoundsLike(client, args) {
  const results = await client.words({
    sl: args.word,
    max: String(args.limit),
    md: "s"
  });
  return formatWordTable(results, `\u{1F50A} Words that sound like "${args.word}"`);
}

// src/tools/spelling.ts
import { z as z5 } from "zod";
var spelledLikeSchema = z5.object({
  pattern: z5.string().min(1).describe("Spelling pattern (use ? for single wildcard, * for multi)"),
  limit: z5.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleSpelledLike(client, args) {
  const results = await client.words({
    sp: args.pattern,
    max: String(args.limit),
    md: "s"
  });
  return formatWordTable(results, `\u{1F524} Words spelled like "${args.pattern}"`);
}
var autocompleteSchema = z5.object({
  prefix: z5.string().min(1).describe("Word prefix to autocomplete"),
  limit: z5.number().int().min(1).max(200).optional().default(10).describe("Maximum number of suggestions")
});
async function handleAutocomplete(client, args) {
  const results = await client.suggest(args.prefix, args.limit);
  return formatSimpleList(results, `\u270D\uFE0F Autocomplete for "${args.prefix}"`);
}

// src/tools/metadata.ts
import { z as z6 } from "zod";
var wordInfoSchema = z6.object({
  word: z6.string().min(1).describe("Word to look up")
});
async function handleWordInfo(client, args) {
  const results = await client.words({
    sp: args.word,
    max: "1",
    md: "dpsrf",
    ipa: "1"
  });
  if (results.length === 0) {
    return `\u{1F4D6} Word Info: "${args.word}"

No information found for this word.`;
  }
  return formatWordInfo(results[0]);
}
var creativeFindSchema = z6.object({
  meaningLike: z6.string().optional().describe("Means like this word"),
  soundsLike: z6.string().optional().describe("Sounds like this word"),
  spelledLike: z6.string().optional().describe("Spelled like this pattern"),
  topic: z6.string().optional().describe("Topic hint (e.g., 'ocean', 'music')"),
  limit: z6.number().int().min(1).max(200).optional().default(20).describe("Maximum number of results")
});
async function handleCreativeFind(client, args) {
  const params = {
    max: String(args.limit),
    md: "dps"
  };
  if (args.meaningLike) params.ml = args.meaningLike;
  if (args.soundsLike) params.sl = args.soundsLike;
  if (args.spelledLike) params.sp = args.spelledLike;
  if (args.topic) params.topics = args.topic;
  const hasConstraints = args.meaningLike || args.soundsLike || args.spelledLike;
  if (!hasConstraints) {
    return "\u{1F3A8} Creative Find\n\nPlease provide at least one constraint: meaningLike, soundsLike, or spelledLike.";
  }
  const results = await client.words(params);
  const constraints = [];
  if (args.meaningLike) constraints.push(`means like "${args.meaningLike}"`);
  if (args.soundsLike) constraints.push(`sounds like "${args.soundsLike}"`);
  if (args.spelledLike) constraints.push(`spelled like "${args.spelledLike}"`);
  if (args.topic) constraints.push(`topic: ${args.topic}`);
  const title = `\u{1F3A8} Creative Find (${constraints.join(", ")})`;
  if (results.length === 0) {
    return `${title}

No results found matching those constraints.`;
  }
  const lines = results.map((w) => {
    const parts = [`  \u2022 ${w.word}`];
    if (w.score) parts.push(`(score: ${w.score})`);
    if (w.defs && w.defs.length > 0) {
      const [pos, meaning] = w.defs[0].split("	");
      parts.push(`\u2014 ${pos}: ${meaning}`);
    }
    return parts.join(" ");
  });
  return [title, "", ...lines, "", `Found: ${results.length} results`].join("\n");
}

// src/server.ts
function createServer(config) {
  const client = new DatamuseClient(config);
  const server = new McpServer({
    name: "datamuse-mcp-server",
    version: "0.1.0"
  });
  server.tool(
    "datamuse_rhymes",
    "Find perfect rhyming words for a given word",
    rhymesSchema.shape,
    async (args) => ({
      content: [
        { type: "text", text: await handleRhymes(client, rhymesSchema.parse(args)) }
      ]
    })
  );
  server.tool(
    "datamuse_near_rhymes",
    "Find approximate/near rhymes for a given word",
    nearRhymesSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: await handleNearRhymes(client, nearRhymesSchema.parse(args))
        }
      ]
    })
  );
  server.tool(
    "datamuse_synonyms",
    "Find synonyms for a given word",
    synonymsSchema.shape,
    async (args) => ({
      content: [
        { type: "text", text: await handleSynonyms(client, synonymsSchema.parse(args)) }
      ]
    })
  );
  server.tool(
    "datamuse_antonyms",
    "Find antonyms (words with opposite meaning) for a given word",
    antonymsSchema.shape,
    async (args) => ({
      content: [
        { type: "text", text: await handleAntonyms(client, antonymsSchema.parse(args)) }
      ]
    })
  );
  server.tool(
    "datamuse_related",
    "Find related/associated words (triggers, followers, predecessors, kind_of, part_of, comprises)",
    relatedSchema.shape,
    async (args) => ({
      content: [
        { type: "text", text: await handleRelated(client, relatedSchema.parse(args)) }
      ]
    })
  );
  server.tool(
    "datamuse_sounds_like",
    "Find words that sound similar to a given word (homophones, near-homophones)",
    soundsLikeSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: await handleSoundsLike(client, soundsLikeSchema.parse(args))
        }
      ]
    })
  );
  server.tool(
    "datamuse_spelled_like",
    "Find words matching a spelling pattern (? = single wildcard, * = multi)",
    spelledLikeSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: await handleSpelledLike(client, spelledLikeSchema.parse(args))
        }
      ]
    })
  );
  server.tool(
    "datamuse_autocomplete",
    "Get autocomplete suggestions for a word prefix",
    autocompleteSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: await handleAutocomplete(client, autocompleteSchema.parse(args))
        }
      ]
    })
  );
  server.tool(
    "datamuse_word_info",
    "Get detailed word information: definitions, syllables, frequency, tags, pronunciation",
    wordInfoSchema.shape,
    async (args) => ({
      content: [
        { type: "text", text: await handleWordInfo(client, wordInfoSchema.parse(args)) }
      ]
    })
  );
  server.tool(
    "datamuse_creative_find",
    "Complex multi-constraint word finding: combine meaning, sound, spelling, and topic filters",
    creativeFindSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: await handleCreativeFind(client, creativeFindSchema.parse(args))
        }
      ]
    })
  );
  return server;
}

// src/index.ts
async function main() {
  const config = loadConfig();
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
