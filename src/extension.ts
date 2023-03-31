// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { generateFixtures } from './Commands/GenerateFixtures'
import { Command } from './Commands/utils'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // vscode.commands.executeCommand('setContext', 'Command.GenerateFixtures', true)

  // register command and push to subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Command.GenerateFixtures,
      async (uri: vscode.Uri) => await generateFixtures(uri),
    ),
  )

  // create tree view
  vscode.window.createTreeView(Command.GenerateFixtures, {
    treeDataProvider: myTreeDataProvider,
  })

  // register tree view
  vscode.window.registerTreeDataProvider(Command.GenerateFixtures, myTreeDataProvider)
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
        command: Command.GenerateFixtures,
        title: 'Generate Fixtures GPT',
        arguments: [element],
      },
      contextValue: Command.GenerateFixtures,
    }
  },
}

// This method is called when your extension is deactivated
export function deactivate() {}
