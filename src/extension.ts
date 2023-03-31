// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { generateFixtures } from './Commands/FixtureGenerator'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand('setContext', 'fixtures-generator-poc.generateFixtures', true)

  // The command has been defined in the package.json file
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fixtures-generator-poc.generateFixtures',
      async (uri: vscode.Uri) => await generateFixtures(uri),
    ),
  )

  // create tree view
  vscode.window.createTreeView('fixtures-generator-poc.generateFixtures', {
    treeDataProvider: myTreeDataProvider,
  })

  // register tree view
  vscode.window.registerTreeDataProvider(
    'fixtures-generator-poc.generateFixtures',
    myTreeDataProvider,
  )
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
        command: 'fixtures-generator-poc.generateFixtures',
        title: 'Generate Fixtures',
        arguments: [element],
      },
      contextValue: 'fixtures-generator-poc.generateFixtures',
    }
  },
}

// This method is called when your extension is deactivated
export function deactivate() {}
