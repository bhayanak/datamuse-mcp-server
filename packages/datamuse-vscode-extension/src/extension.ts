import * as vscode from 'vscode';
import * as path from 'path';

let outputChannel: vscode.OutputChannel | undefined;

export function activate(context: vscode.ExtensionContext): void {
  outputChannel = vscode.window.createOutputChannel('Datamuse MCP');
  outputChannel.appendLine('Datamuse MCP extension activated');

  const serverPath = path.join(context.extensionPath, 'server', 'index.js');

  const config = vscode.workspace.getConfiguration('datamuse');
  const baseUrl = config.get<string>('baseUrl', 'https://api.datamuse.com');
  const maxResults = config.get<number>('maxResults', 50);
  const timeoutMs = config.get<number>('timeoutMs', 10000);

  outputChannel.appendLine(`Server path: ${serverPath}`);
  outputChannel.appendLine(`Config: baseUrl=${baseUrl}, maxResults=${maxResults}, timeoutMs=${timeoutMs}`);

  const mcpServer = new vscode.McpStdioServerDefinition(
    'Datamuse MCP',
    process.execPath,
    [serverPath],
    {
      DATAMUSE_BASE_URL: baseUrl,
      DATAMUSE_MAX_RESULTS: maxResults,
      DATAMUSE_TIMEOUT_MS: timeoutMs,
    },
    '0.1.0',
  );

  const collection = vscode.lm.registerMcpServerDefinitionProvider('datamuse', {
    provideMcpServerDefinitions(_token: vscode.CancellationToken): vscode.McpServerDefinition[] {
      return [mcpServer];
    },
  });

  context.subscriptions.push(collection);

  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('datamuse')) {
      outputChannel?.appendLine('Configuration changed — restart the MCP server to apply.');
      vscode.window
        .showInformationMessage(
          'Datamuse MCP configuration changed. Restart the MCP server to apply.',
          'Restart Server',
        )
        .then((selection) => {
          if (selection === 'Restart Server') {
            vscode.commands.executeCommand('workbench.action.chat.restartMcpServer', 'datamuse');
          }
        });
    }
  });

  context.subscriptions.push(configWatcher);
  context.subscriptions.push(outputChannel);

  outputChannel.appendLine('Datamuse MCP server registered successfully');
  outputChannel.appendLine('Available tools: datamuse_rhymes, datamuse_near_rhymes, datamuse_synonyms, datamuse_antonyms, datamuse_related, datamuse_sounds_like, datamuse_spelled_like, datamuse_autocomplete, datamuse_word_info, datamuse_creative_find');
}

export function deactivate(): void {
  outputChannel?.appendLine('Datamuse MCP extension deactivated');
}
