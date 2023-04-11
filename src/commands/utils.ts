import * as vscode from 'vscode'

export enum Command {
  GenerateFixtures = 'jest-genie.generateFixtures',
  GenerateTestSuite = 'jest-genie.generateTestSuite',
  RemoveApiKey = 'jest-genie.removeApiKey',
  UpdateApiKey = 'jest-genie.updateApiKey',
}

export const outputChannel = vscode.window.createOutputChannel('Jest Genie Output')

export const charactersPerToken = 4
