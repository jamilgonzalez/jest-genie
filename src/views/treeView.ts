import * as vscode from 'vscode'
import { Command } from '../commands/utils'

class TreeView {
  private viewId: string

  constructor(viewId: string) {
    this.viewId = viewId
  }

  private treeDataProvider: vscode.TreeDataProvider<vscode.Uri> = {
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

  register = () => {
    vscode.window.createTreeView(this.viewId, { treeDataProvider: this.treeDataProvider })
    return vscode.window.registerTreeDataProvider(this.viewId, this.treeDataProvider)
  }
}

export default TreeView
