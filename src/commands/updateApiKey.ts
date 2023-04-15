import * as vscode from 'vscode'
import { VscodeCommand } from './utils/types'

class UpdateApiKey implements VscodeCommand {
  private context: vscode.ExtensionContext
  private commandId: string

  constructor(context: vscode.ExtensionContext, commandId: string) {
    this.context = context
    this.commandId = commandId
  }

  private async updateApiKey() {
    const updatedKey = await vscode.window.showInputBox({ placeHolder: 'Enter API Key' })

    if (updatedKey) {
      this.context.globalState.update('GPT_API_KEY', updatedKey)
      vscode.window.showInformationMessage('Successfully Updated API Key to ' + updatedKey)
    } else {
      vscode.window.showErrorMessage('No API Key Entered')
      return
    }
  }

  register = () => {
    return vscode.commands.registerCommand(
      this.commandId,
      async (_: vscode.Uri) => await this.updateApiKey(),
    )
  }
}

export default UpdateApiKey
