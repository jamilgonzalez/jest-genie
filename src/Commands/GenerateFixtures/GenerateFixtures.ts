const path = require('path')
import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import { TextEncoder } from 'util'
import { gptRequest } from '../../api/api'

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
    return
  } else if (Number(numRequested) > 7) {
    vscode.window.showErrorMessage('Please enter a number less than or equal to 5')
  } else {
    return numRequested
  }
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

export const generateFixtures = async (uri: vscode.Uri) => {
  const parsedKey = dotenv.config()
  const api_key = parsedKey.parsed?.GPT_API_KEY

  // get selected text
  const selectedText = getSelectedText()

  if (
    selectedText === undefined ||
    !['type', 'interface'].some((keyWord) => selectedText.includes(keyWord))
  ) {
    vscode.window.showErrorMessage('Please select a type or interface')
    return
  }

  // get number of fixtures to generate
  const numFixturesRequested = await getNumFixturesRequested()

  displayOutput('Generating fixtures...')

  // generate prompt
  const prompt = `generate ${numFixturesRequested} fixture(s) and output the result as consts with unique names and their type using the following type: ${selectedText}`

  // send request to GPT
  let content
  if (numFixturesRequested && api_key) {
    content = await gptRequest(prompt, api_key)
  } else {
    vscode.window.showErrorMessage(
      `${
        !numFixturesRequested
          ? 'Please specify how many fixures you want created.'
          : !api_key
          ? 'Please provide api key'
          : 'Unable to create fixtures.'
      }`,
    )
    myOutputChannel.clear()
    return
  }

  // create file
  const filename = 'fixtures.ts'

  // create file in current directory
  await createFileInCurrentDirectory(filename, content)

  // clear output channel
  myOutputChannel.clear()

  // display output
  displayOutput(`Fixtures generated at ${getNewFileUri(filename)}`)
  console.log('Generate Fixtures command executed:', uri.fsPath)
}
