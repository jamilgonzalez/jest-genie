// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FixtureGenerator } from './Commands/FixtureGenerator/FixtureGenerator'
import { Command } from './Commands/FixtureGenerator/util'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const fixtureGenerator = await FixtureGenerator(context)

  context.subscriptions.push(fixtureGenerator)
  vscode.commands.executeCommand('setContext', 'myExtensionExplorer', true)

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fixtures-generator-poc.generateFixtures',
      async (uri: vscode.Uri) => {
        // Execute your command logic here
        console.log('Generate Fixtures command executed:', uri.fsPath)
      },
    ),
  )
  vscode.window.createTreeView('fixtures-generator-poc.generateFixtures', {
    treeDataProvider: myTreeDataProvider,
  })
  vscode.window.registerTreeDataProvider(
    'fixtures-generator-poc.generateFixtures',
    myTreeDataProvider,
  )
}

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
      contextValue: 'myExtensionExplorer',
    }
  },
}

// This method is called when your extension is deactivated
export function deactivate() {}
