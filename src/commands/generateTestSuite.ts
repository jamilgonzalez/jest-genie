const path = require('path')
import * as vscode from 'vscode'
import { TextEncoder } from 'util'
import { OpenAI } from '../api/types'
import { VscodeCommand } from './types'
import { outputChannel } from './utils'

export class GenerateTestSuite implements VscodeCommand {
  private context: vscode.ExtensionContext
  private openAiInteractor: OpenAI
  private commandId: string
  private charactersPerToken = 4

  constructor(context: vscode.ExtensionContext, openAiInteractor: OpenAI, commandId: string) {
    this.context = context
    this.openAiInteractor = openAiInteractor
    this.commandId = commandId
  }

  // generates a uri for the new file based on the current file user is in
  private generateUri = () => {
    if (!vscode.window.activeTextEditor) {
      vscode.window.showErrorMessage('No active editor found.')
      return
    }

    const currentFilePath = vscode.window.activeTextEditor.document.fileName

    const componentName = currentFilePath
      .split('/')
      .find((item) => item.includes('.'))
      ?.split('.')[0]

    const currentFileDirectory = path.dirname(currentFilePath)

    const ext = path.extname(currentFilePath)

    const filePath = vscode.Uri.file(
      path.join(currentFileDirectory, `/__tests__/${componentName ?? 'index'}.test${ext}`),
    )
    return { componentName, filePath }
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
      // display output
      outputChannel.appendLine(`* Tests generated at ${filename.path}`)
      outputChannel.show()
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

  private getApiCost = (globalState: vscode.Memento) => {
    // track api cost based on tokens used in jest-genie
    const date = new Date()
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.getFullYear()
    const key = `SESSION_COST_${month}_${year}`

    return { key, cost: Number(globalState.get<string>(key)) || 0, month }
  }

  private numberOfTokens = (text: string) => Math.ceil(text.length / this.charactersPerToken)

  private generateTestSuite = async () => {
    let api_key = this.context.globalState.get<string>('GPT_API_KEY')

    // Store the API key in global state
    if (!api_key) {
      api_key = await vscode.window.showInputBox({
        prompt: 'Enter your API key: ',
      })

      await this.context.globalState.update('GPT_API_KEY', api_key)
    }

    const textInFile = vscode.window.activeTextEditor?.document.getText()

    if (!textInFile) {
      vscode.window.showErrorMessage('No text selected or found in file.')
      return
    }

    if (this.numberOfTokens(textInFile) > 1024) {
      vscode.window.showErrorMessage(
        `File is too large (${this.numberOfTokens} tokens).\n` +
          `Please select a smaller function or reduce the size of this one.\n`,
      )
      return
    }

    const uriInfo = this.generateUri()

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Jest Genie: Generating test suite for ${uriInfo?.componentName}`,
        cancellable: false,
      },
      async (progress, token) => {
        const { response, total_usage, error } = await this.openAiInteractor.postGPTPrompt(
          this.prompt(textInFile!),
          api_key || '',
        )

        if (response && total_usage) {
          const { cost, key, month } = this.getApiCost(this.context.globalState)
          const monthApiCost = cost + total_usage * 0.000002

          this.context.globalState.update(key, monthApiCost)

          outputChannel.replace(`Jest Genie:\n* API Cost for ${month}: $${monthApiCost}\n`)
          outputChannel.show()

          await this.createFileInCurrentDirectory(response, uriInfo?.filePath)
        } else {
          vscode.window.showErrorMessage('Error connecting to GPT: ' + error)
          // TODO: only run this code if the error is an invalid api key
          const updated_api_key = await vscode.window.showInputBox({
            prompt: 'Enter new API key: ',
          })

          if (updated_api_key) {
            await this.context.globalState.update('GPT_API_KEY', updated_api_key)
            vscode.window.showInformationMessage('API key updated. Please try again.')
            return
          }
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
