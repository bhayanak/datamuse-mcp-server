<p align="center">
  <img src="logo.png" alt="Datamuse MCP Server" width="180" />
</p>

<h1 align="center">Datamuse MCP Server</h1>

<p align="center">
  <strong>AI-powered word finding — rhymes, synonyms, antonyms, homophones, autocomplete & more</strong>
</p>

<p align="center">
  <a href="https://github.com/bhayanak/datamuse-mcp-server/actions"><img src="https://github.com/bhayanak/datamuse-mcp-server/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node" />
  <img src="https://img.shields.io/badge/MCP-compatible-purple.svg" alt="MCP" />
</p>

---

A **Model Context Protocol (MCP) server** that gives AI assistants access to the [Datamuse API](https://www.datamuse.com/api/) — a powerful, free, no-auth word-finding engine. Includes a VS Code extension for seamless integration with GitHub Copilot and other MCP-compatible AI clients.

## Packages

| Package | Description | README |
|---------|-------------|--------|
| [`datamuse-server`](packages/datamuse-server/) | MCP server with 10 word-finding tools | [Server README](packages/datamuse-server/README.md) |
| [`datamuse-vscode-extension`](packages/datamuse-vscode-extension/) | VS Code extension for one-click MCP integration | [Extension README](packages/datamuse-vscode-extension/README.md) |

## Tools

| Tool | Description |
|------|-------------|
| `datamuse_rhymes` | Find perfect rhyming words |
| `datamuse_near_rhymes` | Find approximate/near rhymes |
| `datamuse_synonyms` | Find synonyms |
| `datamuse_antonyms` | Find antonyms |
| `datamuse_related` | Find related words (triggers, followers, predecessors, hypernyms, etc.) |
| `datamuse_sounds_like` | Find homophones and similar-sounding words |
| `datamuse_spelled_like` | Pattern-based word search (wildcards) |
| `datamuse_autocomplete` | Autocomplete suggestions |
| `datamuse_word_info` | Definitions, syllables, frequency, tags |
| `datamuse_creative_find` | Multi-constraint word finding (meaning + sound + spelling + topic) |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATAMUSE_BASE_URL` | `https://api.datamuse.com` | API base URL |
| `DATAMUSE_MAX_RESULTS` | `50` | Default max results |
| `DATAMUSE_TIMEOUT_MS` | `10000` | Request timeout (ms) |

In VS Code, these are configurable via **Settings → Datamuse MCP**.


## License

MIT © [bhayanak](https://github.com/bhayanak)
