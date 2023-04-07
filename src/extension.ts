import * as vscode from 'vscode'
import { generateTests } from './commands/generateTests'
import { Command } from './commands/utils'

export const myOutputChannel = vscode.window.createOutputChannel('Jest Genie Output')

export async function activate(context: vscode.ExtensionContext) {
  myOutputChannel.replace(
    '**********************************************************************************************************\n' +
      '|                                       Generate Jest Tests w/ GPT                                       |\n' +
      '**********************************************************************************************************\n' +
      '- You must have an API key from OpenAI to use this extension.\n' +
      '- You can get one by visiting https://platform.openai.com/account/api-keys\n',
  )

  // register generate tests command and push to subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Command.GenerateTests,
      async (uri: vscode.Uri) => await generateTests(uri, context.globalState),
    ),
  )

  // create tree view
  const treeView = vscode.window.createTreeView('jest-genie.myTreeView', {
    treeDataProvider: myTreeDataProvider,
  })

  context.subscriptions.push(treeView)

  // register tree view
  vscode.window.registerTreeDataProvider('jest-genie.myTreeView', myTreeDataProvider)
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
        title: 'Jest Genie: Generate Tests',
        arguments: [element],
      },
      contextValue: Command.GenerateTests,
    }
  },
}

// This method is called when your extension is deactivated
export function deactivate() {
  return
}
