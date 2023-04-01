const path = require('path')
import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import { TextEncoder } from 'util'
import { gptRequest } from '../../api/api'
const delay = require('delay')

// { path: '/Users/jamilgonzalez/fixtures-generator-poc/.env' }

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

  myOutputChannel.appendLine(
    selectedText.split(' ').length > 1024
      ? 'Too many words must be below 1024'
      : `Input length is ${selectedText.split(' ').length} words`,
  )
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

function splitArray(arr: string[], predicate: (item: string) => boolean) {
  return arr.reduce(
    (acc: string[][], item: string) => {
      if (predicate(item)) {
        acc[0].push(item) // add item to first element of tuple
      } else {
        acc[1].push(item) // add item to second element of tuple
      }
      return acc
    },
    [[], []],
  )
}

const myOutputChannel = vscode.window.createOutputChannel('My Output Channel')

const displayOutput = (output: string) => {
  // show output
  myOutputChannel.appendLine(output)

  // show output channel
  myOutputChannel.show()
}

export const generateFixtures = async (uri: vscode.Uri) => {
  // const parsedKey = dotenv.config({ path: '/Users/jamilgonzalez/fixtures-generator-poc/.env' })
  const parsedKey = dotenv.config({ path: '/Users/jamilgonzalez/fixtures-generator-poc/.env' })
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
  const numFixturesRequested = await getNumFixturesRequested()

  displayOutput('Generating fixtures...')

  // generate prompt
  const prompt = (interfaceOrType: string, projectLanguage: string) =>
    // `generate ${numFixturesRequested} test data for each interface or type I provide. Assign the output to a const with unique name and make sure each field has a value: ${interfaceOrType}`
    `Generate ${numFixturesRequested} test data for the type or interface I provide from my ${projectLanguage} project. Here's the definition: ${interfaceOrType} \n\n Please ensure that each field has a value and assign the test data to a const with a unique name with the appropriate type. Thank you!"`

  // send request to GPT
  let content
  if (numFixturesRequested && api_key) {
    const releventCode = `${otherCodeBlocks}}`

    content = interfacesOrTypes?.map(async (item) => {
      console.log(prompt(item.concat(`${releventCode}`), 'typescript'))
      return await gptRequest(prompt(item.concat(`${releventCode}`), 'typescript'), api_key)
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

  // create file
  const filename = 'fixtures.ts'

  if (content) {
    const response = await Promise.all(content).then((res) => res.join(''))
    console.log(response)
    // create file in current directory
    await createFileInCurrentDirectory(filename, response)
  }

  // clear output channel
  myOutputChannel.clear()

  // display output
  displayOutput(`Fixtures generated at ${getNewFileUri(filename)}`)
  console.log('Generate Fixtures command executed:', uri.fsPath)
}
