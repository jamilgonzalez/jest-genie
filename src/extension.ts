import * as vscode from 'vscode'
import { GenerateTestSuite } from './commands/generateTestSuite'
import { Command } from './commands/utils'
import { openAiInteractor } from './api'
import RemoveApiKey from './commands/removeApiKey'
import UpdateApiKey from './commands/updateApiKey'
import TreeView from './views/treeView'

export async function activate(context: vscode.ExtensionContext) {
  const generateTestSuiteCommand = new GenerateTestSuite(
    context,
    openAiInteractor,
    Command.GenerateTestSuite,
  )
  const removeApiKeyCommand = new RemoveApiKey(context, Command.RemoveApiKey)
  const updateApiKeyCommand = new UpdateApiKey(context, Command.UpdateApiKey)
  const treeView = new TreeView('jest-genie.myTreeView')

  // registering is a good practice to ensure proper cleanup and prevent memory leaks in the extension
  context.subscriptions.push(generateTestSuiteCommand.register())
  context.subscriptions.push(removeApiKeyCommand.register())
  context.subscriptions.push(updateApiKeyCommand.register())
  context.subscriptions.push(treeView.register())
}
// This method is called when your extension is deactivated
export function deactivate() {
  return
}
