const path = require('path')
import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import { TextEncoder } from 'util'
import { gptRequest } from '../api/api'

const getSelectedText = (editor: vscode.TextEditor | undefined) => {
  if (!editor) {
    vscode.window.showErrorMessage('No active text editor found')
    return
  }

  const selectedText = editor.document.getText(editor.selection)

  if (selectedText.length === 0) {
    vscode.window.showErrorMessage('No text selected')
    return
  }

  myOutputChannel.appendLine(
    selectedText.split(' ').length > 1024
      ? 'Too many words must be below 1024'
      : `Input length is ${selectedText.split(' ').length} words`,
  )
  return selectedText
}

const getNumFixturesRequested = async (window: typeof vscode.window) => {
  const numRequested = await window.showInputBox({
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

  const extension = path.extname(currentFilePath)

  const currentFileDirectory = path.dirname(currentFilePath)

  return vscode.Uri.file(path.join(currentFileDirectory, filename.concat(extension)))
}

async function createFileInCurrentDirectory(content: string) {
  const newFileUri = getNewFileUri('fixtures')

  console.log(newFileUri)

  const fileData = new TextEncoder().encode(content)

  if (!newFileUri) {
    vscode.window.showErrorMessage('Could not create file.')
    return
  } else {
    await vscode.workspace.fs.writeFile(newFileUri, fileData)
    vscode.window.showInformationMessage(`File created: ${newFileUri.path}`)
    return newFileUri
  }
}
const myOutputChannel = vscode.window.createOutputChannel('My Output Channel')

const displayOutput = (output: string) => {
  // show output
  myOutputChannel.appendLine(output)

  // show output channel
  myOutputChannel.show()
}
// generate prompt
const prompt = (interfaceOrType: string, numFixturesRequested: string, projectLanguage: string) =>
  // `generate ${numFixturesRequested} test data for each interface or type I provide. Assign the output to a const with unique name and make sure each field has a value: ${interfaceOrType}`
  `Generate ${numFixturesRequested} test data for the type or interface I provide from my ${projectLanguage} project. Here's the definition: ${interfaceOrType} \n\n Please ensure that each field has a value and assign the test data to a const with a unique name with the appropriate type."`

export const generateFixtures = async (uri: vscode.Uri) => {
  const parsedKey = dotenv.config({ path: '/Users/jamilgonzalez/fixtures-generator-poc/.env' })
  const api_key = parsedKey.parsed?.GPT_API_KEY

  // get selected text
  const editor = vscode.window.activeTextEditor
  const selectedText = getSelectedText(editor)

  if (!selectedText || !['type', 'interface'].some((keyWord) => selectedText.includes(keyWord))) {
    vscode.window.showErrorMessage('Please select a type or interface')
    return
  }

  // regex to match interfaces and types
  const regex = /^(?:(?:export\s+))?(?:interface|type)\s+\w+\s*\{[\s\S]*?\}(?:\s*\n)?$/gm
  const delimiter = '#####UNIQUE_DELIMITER#####'

  const replacedText = selectedText.replace(regex, delimiter)
  const otherCodeBlocks = replacedText
    .split(delimiter)
    .filter((item) => item !== '\n' && item !== '')

  const interfacesOrTypes = selectedText
    .match(regex)
    ?.filter((item) => item !== '\n' && item !== '')

  // get number of fixtures to generate
  const window = vscode.window
  const numFixturesRequested = await getNumFixturesRequested(window)

  // make periods in output increase in amount until response is received from backend
  let i = 0
  function startLoadingOutput(active: boolean) {
    if (!active) {
      return () => {} // Return an empty function if not active
    }

    const intervalId = setInterval(() => {
      i === 0 ? myOutputChannel.replace('Generating Fixtures') : myOutputChannel.append('.')
      i++
      if (i === 4) {
        i = 0
      }
    }, 500)

    return () => {
      clearInterval(intervalId) // Return a function that clears the interval
    }
  }

  // send request to GPT
  let content
  let filepath

  if (numFixturesRequested && api_key) {
    const stopLoadingOutput = startLoadingOutput(true)

    content = interfacesOrTypes?.map(async (item) => {
      const response = await gptRequest(
        prompt(item.concat(`${otherCodeBlocks}}`), numFixturesRequested, 'typescript'),
        api_key,
      )
      stopLoadingOutput()
      return response
    })
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

  if (content) {
    const response = await Promise.all(content).then((res) => res.join(''))

    // create file in current directory
    filepath = (await createFileInCurrentDirectory(response)) || ''

    // clear output channel
    myOutputChannel.clear()

    // display output
    displayOutput(`Fixtures generated at ${filepath}`)
  }
}
