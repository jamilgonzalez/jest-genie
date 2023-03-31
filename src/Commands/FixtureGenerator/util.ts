import * as vscode from 'vscode'
const openai = require('openai-api')
const path = require('path')
import { TextEncoder } from 'util'

// key generated on Mar 30th
const api_key = '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'

// send code to server
const openai_client = new openai(api_key)
const model_engine = 'text-davinci-002'
const completions = 1

const getSelectedText = () => {
  const editor = vscode.window.activeTextEditor

  if (!editor) {
    vscode.window.showErrorMessage('No active text editor found')
    return
  }

  const selectedText = editor.document.getText(editor.selection)

  if (selectedText.length === 0) {
    vscode.window.showErrorMessage('No text selected')
    return
  }

  return selectedText
}

const getNumFixturesRequested = async () => {
  const numRequested = await vscode.window.showInputBox({
    prompt: 'How many fixtures do you want to generate?',
  })

  if (!numRequested) {
    vscode.window.showErrorMessage('Please enter a number')
  } else if (Number(numRequested) > 7) {
    vscode.window.showErrorMessage('Please enter a number less than or equal to 5')
  } else {
    return numRequested
  }
}

const gptRequest = async (prompt: string) => {
  // todo: add error handling, add logging, add tests, add CI/CD
  const response = await openai_client.complete({
    engine: model_engine,
    prompt: prompt,
    max_tokens: 1024,
    n: completions,
    stop: '\\n',
  })

  console.log(response)

  return response.data.choices[0].text.trim()
}

const getNewFileUri = (filename: string) => {
  const activeEditor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.scheme === 'file',
  )

  if (!activeEditor) {
    vscode.window.showErrorMessage('No active editor found.')
    return
  }

  const currentFilePath = activeEditor.document.fileName
  const currentFileDirectory = path.dirname(currentFilePath)

  return vscode.Uri.file(path.join(currentFileDirectory, filename))
}

async function createFileInCurrentDirectory(filename: string, content: string) {
  const newFileUri = getNewFileUri(filename)

  const fileData = new TextEncoder().encode(content)

  if (!newFileUri) {
    vscode.window.showErrorMessage('Could not create file.')
    return
  } else {
    await vscode.workspace.fs.writeFile(newFileUri, fileData)
    vscode.window.showInformationMessage(`File created: ${newFileUri.fsPath}`)
  }
}

const myOutputChannel = vscode.window.createOutputChannel('My Output Channel')

const displayOutput = (output: string) => {
  // show output
  myOutputChannel.appendLine(output)

  // show output channel
  myOutputChannel.show()
}

enum Command {
  GenerateFixtures = 'fixtures-generator-poc.fixture-gpt',
}

export {
  myOutputChannel,
  createFileInCurrentDirectory,
  getNewFileUri,
  Command,
  displayOutput,
  getNumFixturesRequested,
  getSelectedText,
  gptRequest,
}
