import * as vscode from 'vscode'
import { VscodeCommand } from './utils/types'

class RemoveApiKey implements VscodeCommand {
  private context: vscode.ExtensionContext
  private commandId: string

  constructor(context: vscode.ExtensionContext, commandId: string) {
    this.context = context
    this.commandId = commandId
  }

  private removeApiKey() {
    this.context.globalState.update('GPT_API_KEY', '')
    vscode.window.showInformationMessage('Successfully Removed API Key')
  }

  register = () => {
    return vscode.commands.registerCommand(this.commandId, async (_: vscode.Uri) =>
      this.removeApiKey(),
    )
  }
}

export default RemoveApiKey
