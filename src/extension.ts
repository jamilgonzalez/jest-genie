import * as vscode from 'vscode'
import { GenerateTestSuite } from './commands/generateTestSuite'
import { Command } from './commands/utils'
import { openAiInteractor } from './api'

const treeViewId = 'jest-genie.myTreeView'

const treeDataProvider: vscode.TreeDataProvider<vscode.Uri> = {
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
        command: Command.GenerateTestSuite,
        title: 'Jest Genie: Generate Test Suite',
        arguments: [element],
      },
      contextValue: Command.GenerateTestSuite,
    }
  },
}

export async function activate(context: vscode.ExtensionContext) {
  const generateTestSuiteCommand = new GenerateTestSuite(
    context,
    openAiInteractor,
    Command.GenerateTestSuite,
  )
  // todo: create tree view class and move this code there
  vscode.window.createTreeView(treeViewId, { treeDataProvider })

  // registering is a good practice to ensure proper cleanup and prevent memory leaks in the extension
  context.subscriptions.push(generateTestSuiteCommand.register())
  context.subscriptions.push(vscode.window.registerTreeDataProvider(treeViewId, treeDataProvider))
}
// This method is called when your extension is deactivated
export function deactivate() {
  return
}
