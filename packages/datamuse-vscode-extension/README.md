<p align="center">
  <img src="logo.png" alt="Datamuse MCP" width="140" />
</p>

<h1 align="center">Datamuse MCP — VS Code Extension</h1>

VS Code extension that registers the Datamuse MCP server for seamless integration with GitHub Copilot Chat and other MCP-compatible AI clients.

## Features

Once installed, the extension:

- **Registers the Datamuse MCP server** automatically — it appears in VS Code's MCP server list
- **Provides VS Code settings** for configuration (base URL, max results, timeout)
- **Supports start/stop/show output** through VS Code's built-in MCP server management

## Configuration

Open **Settings** (`Ctrl+,`) and search for "Datamuse":

| Setting | Default | Description |
|---------|---------|-------------|
| `datamuse.baseUrl` | `https://api.datamuse.com` | Datamuse API base URL |
| `datamuse.maxResults` | `50` | Default maximum results per query (1-1000) |
| `datamuse.timeoutMs` | `10000` | API request timeout in milliseconds (1000-60000) |

## Usage

1. Open Copilot Chat (`Ctrl+Shift+I`)
2. The Datamuse tools are available automatically
3. Ask questions like:
   - "What rhymes with orange?"
   - "Find synonyms for happy"
   - "What words sound like flower?"
   - "Autocomplete the prefix 'ser'"
   - words with a meaning similar to ringing in the ears
   - words related to duck that start with the letter b
   - words related to spoon that end with the letter a
   - words that sound like jirraf
   - words that start with t, end in k, and have two letters in between
   - words that are spelled similarly to hipopatamus
   - adjectives that are often used to describe ocean
   - adjectives describing ocean sorted by how related they are to temperature
   - nouns that are often described by the adjective yellow
   - words that often follow "drink" in a sentence, that start with the letter w
   - words that are triggered by (strongly associated with) the word "cow"
   - suggestions for the user if they have typed in rawand so far

## Troubleshooting

### Server not appearing in MCP list
- Ensure the extension is enabled
- Reload VS Code window (`Ctrl+Shift+P` → **Developer: Reload Window**)

### Server won't start
- Check the **Datamuse MCP** output channel for error messages
- Verify Node.js ≥ 18 is installed

### Configuration changes not taking effect
- After changing settings, restart the MCP server when prompted
- Or manually: `Ctrl+Shift+P` → **MCP: Restart Server**
