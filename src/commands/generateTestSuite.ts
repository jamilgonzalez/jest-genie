const path = require('path')
import * as vscode from 'vscode'
import { TextEncoder } from 'util'
import { OpenAI } from '../api/types'
import { VscodeCommand } from './types'
import { charactersPerToken, outputChannel } from './utils'

export class GenerateTestSuite implements VscodeCommand {
  private context: vscode.ExtensionContext
  private openAiInteractor: OpenAI
  private commandId: string

  constructor(context: vscode.ExtensionContext, openAiInteractor: OpenAI, commandId: string) {
    this.context = context
    this.openAiInteractor = openAiInteractor
    this.commandId = commandId
  }

  private componentName = (activeTextEditor: vscode.TextEditor) =>
    activeTextEditor.document.fileName
      .split('/')
      .find((item) => item.includes('.'))
      ?.split('.')[0]

  private testSuiteFilePath = (activeTextEditor: vscode.TextEditor) => {
    const activeFileName = activeTextEditor.document.fileName
    const componentName = this.componentName(activeTextEditor)
    const activeDirectoryName = path.dirname(activeFileName)
    const ext = path.extname(activeFileName)

    return vscode.Uri.file(
      path.join(activeDirectoryName, `/__tests__/${componentName ?? 'index'}.test${ext}`), // todo request test path from user
    )
  }

  private createFileInCurrentDirectory = async (
    content: string,
    filename: vscode.Uri | undefined,
  ) => {
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

  private prompt = (fc: string) =>
    `As an AI language model, your task is to generate a comprehensive test suite for a React functional component using TypeScript.` +
    `The test suite should utilize the Jest testing framework and the React Testing Library.` +
    `Focus on ensuring that all UI components are properly rendering and handling user interactions, while also including appropriate test fixtures for different scenarios.\n` +
    `Make sure the test suite follows the principles behind tests as documentation, and that it is easy to understand and maintain. Consider edge cases, error handling, and any other relevant aspects when creating the test suite.\n` +
    `Respond with code only.\n` +
    `Here is the functional component for which the test suite needs to be created:\n` +
    `${fc}\n` +
    `Remember, the test suite should be compatible with a TypeScript project and make use of Jest and React Testing Library.`

  private numberOfTokens = (text: string) => Math.ceil(text.length / charactersPerToken)

  private generateTestSuite = async () => {
    const activeTextEditor = vscode.window.activeTextEditor
    const visibleTextEditors = vscode.window.visibleTextEditors

    const highlightedText = visibleTextEditors
      ?.map((editor) => editor.document.getText(editor.selection))
      .reduce((acc, curr) => acc + curr, '')

    if (!activeTextEditor) {
      vscode.window.showErrorMessage('No active editor found.')
      return
    }

    let textInFile = ''
    if (!highlightedText) {
      textInFile = activeTextEditor.document.getText()
    }

    if (!textInFile && !highlightedText) {
      vscode.window.showErrorMessage('No text selected or found in file.')
      return
    }

    const selectedCode = highlightedText || textInFile

    console.log('selectedCode', selectedCode)

    if (this.numberOfTokens(selectedCode) > 2043) {
      vscode.window.showErrorMessage(
        `File is too large (${this.numberOfTokens(selectedCode)} tokens).\n` +
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
          this.prompt(selectedCode),
          api_key || '',
        )

        if (response && total_usage) {
          const file = this.testSuiteFilePath(activeTextEditor)
          await this.createFileInCurrentDirectory(response, file)

          // display success message
          outputChannel.appendLine(`Tests generated at ${file.path}`)
          outputChannel.show()
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
