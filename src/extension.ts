import * as vscode from 'vscode'
import { generateTests } from './commands/generateTests'
import { Command } from './commands/utils'

export const myOutputChannel = vscode.window.createOutputChannel('GPT Test Generator Output')

export async function activate(context: vscode.ExtensionContext) {
	// Get the stored API key from global state
	let storedApiKey = context.globalState.get<string>('GPT_API_KEY');


	if (!storedApiKey) {
		myOutputChannel.appendLine(
		'**********************************************************************************************************\n' +
		'|                                       Generate Jest Tests w/ GPT                                       |\n'+
		'**********************************************************************************************************\n' +
		'- You must have an API key from OpenAI to use this extension.\n' +
		'- You can get one by visiting https://platform.openai.com/account/api-keys\n' 
		)

		while (!storedApiKey) {
			storedApiKey = await vscode.window.showInputBox({
				prompt: 'Enter your API key: '
			});
			// Store the API key in global state
			if (storedApiKey) {
				await context.globalState.update('GPT_API_KEY', storedApiKey);
			}
		} 
	}

  // register generate tests command and push to subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Command.GenerateTests,
      async (uri: vscode.Uri) => await generateTests(uri, context.globalState),
    ),
  )

  // create tree view
  vscode.window.createTreeView(Command.GenerateTests, {
    treeDataProvider: myTreeDataProvider,
  })

  // register tree view
  vscode.window.registerTreeDataProvider(Command.GenerateTests, myTreeDataProvider)
}

// tree view
const myTreeDataProvider: vscode.TreeDataProvider<vscode.Uri> = {
  getChildren: async (element?: vscode.Uri): Promise<vscode.Uri[]> => {
    if (!element) {
      return vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || []
    } else {
      return []
    }
  },
  getTreeItem: (element: vscode.Uri) => {
    return {
      label: element.fsPath,
      command: {
        command: Command.GenerateTests,
        title: 'Generate Tests GPT',
        arguments: [element],
      },
      contextValue: Command.GenerateTests,
    }
  },
}

// This method is called when your extension is deactivated
export function deactivate() {}
