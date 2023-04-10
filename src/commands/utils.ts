import * as vscode from 'vscode'

export enum Command {
  GenerateFixtures = 'jest-genie.generateFixtures',
  GenerateTestSuite = 'jest-genie.generateTestSuite',
}

export const outputChannel = vscode.window.createOutputChannel('Jest Genie Output')
