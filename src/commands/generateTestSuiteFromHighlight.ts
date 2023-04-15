import * as vscode from 'vscode'
import { OpenAI } from '../api/types'
import { GenerateTestSuite } from './generateTestSuite'
import { jest_prompt } from './utils/prompts'

class GenerateTestSuiteFromHighlight extends GenerateTestSuite {
  commandId: string
  constructor(context: vscode.ExtensionContext, openAiInteractor: OpenAI, commandId: string) {
    super(context, openAiInteractor, commandId)
    this.commandId = commandId
  }

  generateTestSuiteFromHighlight = async () => {
    const activeTextEditor = vscode.window.activeTextEditor
    const visibleTextEditors = vscode.window.visibleTextEditors

    if (!activeTextEditor || !visibleTextEditors) {
      vscode.window.showErrorMessage('No active text editor.')
      return
    }

    const highlightedText = visibleTextEditors
      .map((editor) => editor.document.getText(editor.selection))
      .reduce((acc, curr) => acc + curr, '')

    if (!highlightedText) {
      vscode.window.showErrorMessage('No highlighted text found.')
      return
    }

    if (this.numberOfTokens(highlightedText) > 2731) {
      vscode.window.showErrorMessage(
        `File is too large (${this.numberOfTokens(highlightedText)} tokens).\n` +
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
          jest_prompt(highlightedText),
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
  override register = () => {
    return vscode.commands.registerCommand(this.commandId, this.generateTestSuiteFromHighlight)
  }
}

export default GenerateTestSuiteFromHighlight
