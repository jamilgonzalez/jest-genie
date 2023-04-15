const path = require('path')
import * as vscode from 'vscode'
import { TextEncoder } from 'util'
import { OpenAI } from '../api/types'
import { VscodeCommand } from './utils/types'
import { charactersPerToken } from './utils/constants'
import { jest_prompt } from './utils/prompts'

export class GenerateTestSuite implements VscodeCommand {
  context: vscode.ExtensionContext
  openAiInteractor: OpenAI
  commandId: string

  constructor(context: vscode.ExtensionContext, openAiInteractor: OpenAI, commandId: string) {
    this.context = context
    this.openAiInteractor = openAiInteractor
    this.commandId = commandId
  }

  componentName = (activeTextEditor: vscode.TextEditor) =>
    activeTextEditor.document.fileName
      .split('/')
      .find((item) => item.includes('.'))
      ?.split('.')[0]

  testSuiteFilePath = (activeTextEditor: vscode.TextEditor) => {
    const activeFileName = activeTextEditor.document.fileName
    const componentName = this.componentName(activeTextEditor)
    const activeDirectoryName = path.dirname(activeFileName)
    const ext = path.extname(activeFileName)

    return vscode.Uri.file(
      path.join(activeDirectoryName, `/__tests__/${componentName ?? 'index'}.test${ext}`), // todo request test path from user
    )
  }

  createFileInCurrentDirectory = async (content: string, filename: vscode.Uri | undefined) => {
    const fileData = new TextEncoder().encode(content)

    if (!filename) {
      // todo: update to more specific error message
      vscode.window.showErrorMessage('Could not create file.')
      return
    } else {
      await vscode.workspace.fs.writeFile(filename, fileData)
      vscode.env.openExternal(filename)
    }
  }

  numberOfTokens = (text: string) => Math.ceil(text.length / charactersPerToken)

  generateTestSuite = async () => {
    const activeTextEditor = vscode.window.activeTextEditor

    if (!activeTextEditor) {
      vscode.window.showErrorMessage('No active editor found.')
      return
    }

    const textInFile = activeTextEditor.document.getText()

    if (!textInFile) {
      vscode.window.showErrorMessage('No text found in file.')
      return
    }

    if (this.numberOfTokens(textInFile) > 2731) {
      vscode.window.showErrorMessage(
        `File is too large (${this.numberOfTokens(textInFile)} tokens).\n` +
          `Please select a smaller function or reduce the size of this one.\n`,
      )
      return
    }

    let api_key = this.context.globalState.get<string>('GPT_API_KEY')

    if (!api_key) {
      api_key = await vscode.window.showInputBox({
        prompt: 'Enter your API key: ',
      })

      await this.context.globalState.update('GPT_API_KEY', api_key)
    }

    // make call to openai
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Jest Genie: Generating test suite for ${this.componentName(activeTextEditor)}`,
        cancellable: false,
      },
      async (_progress, _token) => {
        const { response, total_usage, error } = await this.openAiInteractor.postGPTPrompt(
          jest_prompt(textInFile),
          api_key || '',
        )

        if (response && total_usage) {
          const file = this.testSuiteFilePath(activeTextEditor)
          await this.createFileInCurrentDirectory(response, file)
        } else {
          vscode.window.showErrorMessage('Error Generating Tests: ' + error)
          return
        }
      },
    )
  }

  register = () => {
    return vscode.commands.registerCommand(
      this.commandId,
      async (_: vscode.Uri) => await this.generateTestSuite(),
    )
  }
}
