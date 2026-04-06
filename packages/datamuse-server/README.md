<p align="center">
  <img src="logo.png" alt="Datamuse MCP Server" width="140" />
</p>

<h1 align="center">Datamuse MCP Server</h1>

MCP server providing 10 word-finding tools powered by the [Datamuse API](https://www.datamuse.com/api/).

## Integration with AI Clients

### VS Code (GitHub Copilot / Copilot Chat)

Add to your VS Code settings JSON (`.vscode/mcp.json` or user `settings.json`):

```json
{
  "mcp": {
    "servers": {
      "datamuse": {
        "command": "node",
        "args": ["/absolute/path/to/datamuse-mcp-server/packages/datamuse-server/dist/index.js"],
        "env": {
          "DATAMUSE_MAX_RESULTS": "50",
          "DATAMUSE_TIMEOUT_MS": "10000"
        }
      }
    }
  }
}
```

Or if installed globally via npm:

```json
{
  "mcp": {
    "servers": {
      "datamuse": {
        "command": "npx",
        "args": ["datamuse-mcp-server"]
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config file (`claude_desktop_config.json`):

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "datamuse": {
      "command": "node",
      "args": ["/absolute/path/to/datamuse-mcp-server/packages/datamuse-server/dist/index.js"],
      "env": {
        "DATAMUSE_MAX_RESULTS": "50",
        "DATAMUSE_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

Or if installed globally via npm:

```json
{
  "mcpServers": {
    "datamuse": {
      "command": "npx",
      "args": ["datamuse-mcp-server"]
    }
  }
}
```

## Tools

### `datamuse_rhymes`
Find perfect rhyming words.
```
Input:  { word: "time", limit?: 20 }
Output: dime, lime, crime, rhyme, climb, paradigm, sublime...
```

### `datamuse_near_rhymes`
Find approximate/near rhymes.
```
Input:  { word: "orange", limit?: 20 }
Output: arrange, strange, range...
```

### `datamuse_synonyms`
Find synonyms.
```
Input:  { word: "happy", limit?: 20 }
Output: joyful, glad, pleased, cheerful...
```

### `datamuse_antonyms`
Find words with opposite meaning.
```
Input:  { word: "happy", limit?: 20 }
Output: sad, unhappy, miserable...
```

### `datamuse_related`
Find related/associated words with specific relation types.
```
Input:  { word: "ocean", relation?: "triggers"|"followers"|"predecessors"|"kind_of"|"part_of"|"comprises", limit?: 20 }
Output: (triggers) beach, waves, salt, water...
```

### `datamuse_sounds_like`
Find words that sound similar (homophones).
```
Input:  { word: "their", limit?: 20 }
Output: there, they're...
```

### `datamuse_spelled_like`
Find words matching a spelling pattern (`?` = single char, `*` = multi).
```
Input:  { pattern: "ca?", limit?: 20 }
Output: cat, car, cap, can, cab...
```

### `datamuse_autocomplete`
Autocomplete suggestions for a prefix.
```
Input:  { prefix: "hel", limit?: 10 }
Output: hello, help, helicopter, helmet...
```

### `datamuse_word_info`
Get definitions, syllables, frequency, pronunciation.
```
Input:  { word: "serendipity" }
Output: (noun) good luck in making unexpected discoveries | 5 syllables | 4.2/million
```

### `datamuse_creative_find`
Multi-constraint word finding — combine meaning, sound, spelling, and topic.
```
Input:  { meaningLike?: "ocean", soundsLike?: "see", spelledLike?: "s*", topic?: "nature", limit?: 20 }
Output: sea, surf, shore...
```

## Datamuse API Mapping

| Tool | API Parameter |
|------|---------------|
| rhymes | `rel_rhy` |
| near_rhymes | `rel_nry` |
| synonyms | `rel_syn` |
| antonyms | `rel_ant` |
| related (triggers) | `rel_trg` |
| related (followers) | `lc` |
| related (predecessors) | `rc` |
| related (kind_of) | `rel_spc` |
| related (part_of) | `rel_com` |
| related (comprises) | `rel_par` |
| sounds_like | `sl` |
| spelled_like | `sp` |
| autocomplete | `/sug?s=` |
| word_info | `sp` + `md=dpsrf` + `ipa=1` |
| creative_find | `ml`, `sl`, `sp`, `topics` |

## Usage

```bash
# Run directly
node dist/index.js

# Or via npx
npx datamuse-mcp-server
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATAMUSE_BASE_URL` | `https://api.datamuse.com` | API endpoint |
| `DATAMUSE_MAX_RESULTS` | `50` | Max results per query |
| `DATAMUSE_TIMEOUT_MS` | `10000` | Request timeout |
