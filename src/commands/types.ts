import * as vscode from 'vscode'

export interface VscodeCommand {
  register: () => vscode.Disposable
}

export enum TestSuitePromptType {
  JEST = 'JEST',
  MOCHA = 'MOCHA',
  CHAI = 'CHAI',
}
