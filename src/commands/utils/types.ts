import * as vscode from 'vscode'

export interface VscodeCommand {
  register: () => vscode.Disposable
}
