const path = require('path')
import * as vscode from 'vscode'
import * as dotenv from 'dotenv'
import { TextEncoder } from 'util'
import { promptGPT } from '../api/api'

// The module 'vscode' contains the VS Code extensibility API
const { window } = vscode

const {
  showErrorMessage,
  showInformationMessage,
  createOutputChannel,
  activeTextEditor,
  visibleTextEditors,
} = window

const myOutputChannel = createOutputChannel('GPT Fixtures Generator Output')

const getSelectedText = () => {
  const activeTextEditor = visibleTextEditors.find(
    (editor) => editor.document.uri.scheme === 'file',
  )

  if (!activeTextEditor) {
    showErrorMessage('No active text editor found')
    return
  }

  const selectedText = activeTextEditor.document.getText(activeTextEditor.selection)

  if (selectedText.length === 0) {
    showErrorMessage('Please select a type or interface.')
    return
  }
  return selectedText
}

// todo: update this function to return error if the sum of the prompt and the selected text is greater than 1024
const getNumFixturesRequested = async () => {
  const numRequested = await window.showInputBox({
    prompt: 'How many fixtures do you want to generate?',
  })

  if (!numRequested) {
    return
  } else if (Number(numRequested) > 7) {
    showErrorMessage('Please enter a number less than or equal to 7')
  } else {
    return numRequested
  }
}

// generates a uri for the new file based on the current file user is in
const generateUri = (filename: string) => {
  if (!activeTextEditor) {
    showErrorMessage('No active editor found.')
    return
  }

  const currentFilePath = activeTextEditor.document.fileName
  const currentFileDirectory = path.dirname(currentFilePath)
  const newFile = filename.concat(path.extname(currentFilePath))

  return vscode.Uri.file(path.join(currentFileDirectory, newFile))
}

async function createFileInCurrentDirectory(content: string, filename: vscode.Uri | undefined) {
  const fileData = new TextEncoder().encode(content)

  if (!filename) {
    // todo: update to more specific error message
    showErrorMessage('Could not create file.')
    return
  } else {
    await vscode.workspace.fs.writeFile(filename, fileData)
    showInformationMessage(`File created: ${filename.path}`)
    // clear output channel
    myOutputChannel.clear()
    // display output
    myOutputChannel.appendLine(`Fixtures generated at ${filename.path}`)
    myOutputChannel.show()
  }
}

// generate prompt
const prompt = (
  defenition: string,
  types: string,
  numFixturesRequested: string,
  projectLanguage = 'typescript',
) =>
  `Generate ${numFixturesRequested} test data for ${types} type/interface. I will provide the definition below from my ${projectLanguage} project. ` +
  `Here's the definition: \n${defenition} \n\n` +
  `Please ensure that each field has a value and assign the test data to a const with a unique name and with its type."`

// display loading output
function startLoadingOutput(active: boolean) {
  let i = 0
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

const parseSelectedText = (selectedText: string) => {
  // regex to match interfaces and types
  const regex = /^(?:(?:export\s+))?(?:interface|type)\s+\w+\s*\{[\s\S]*?\}(?:\s*\n)?$/gm
  const delimiter = '#####UNIQUE_DELIMITER#####'

  const otherCodeBlocks = selectedText
    .replace(regex, delimiter)
    .split(delimiter)
    .filter((item) => item !== '\n' && item !== '')

  const interfacesOrTypes = selectedText
    .match(regex)
    ?.filter((item) => item !== '\n' && item !== '')

  return [interfacesOrTypes, otherCodeBlocks]
}

// what kind of params would make sense here?
const generateFixtures = async (uri: vscode.Uri) => {
  const parsedKey = dotenv.config()
  const api_key = parsedKey.parsed?.GPT_API_KEY || ''

  // get selected text
  const selectedText = getSelectedText()
  
  // TODO: make this more robust for other languages
  if (!selectedText || !['type', 'interface'].some((keyWord) => selectedText.includes(keyWord))) {
    showErrorMessage('Please select a type or interface')
    return
  }
  
  const [interfacesOrTypes, otherCodeBlocks] = parseSelectedText(selectedText)
  
  // get number of fixtures to generate
  const numFixturesRequested = await getNumFixturesRequested()
  const targetType = await window.showInputBox({prompt: 'Which type or interface are we creating fixtures for (comma separated if multiple)?'})

  if (!targetType) {
    window.showErrorMessage('Please enter a type or interface')
    return
  }
  // send request to GPT
  if (numFixturesRequested && api_key) {
    const stopLoadingOutput = startLoadingOutput(true)
    const gptResponses = interfacesOrTypes?.filter(iot => iot.includes(`${targetType} {`)).map(async (iot) => {
      const selectedCode = otherCodeBlocks ? iot.concat(`\n\n${otherCodeBlocks}`) : iot
      const gptPrompt = prompt(selectedCode, targetType, numFixturesRequested)

      console.log('gptPrompt', gptPrompt)

      const response = await promptGPT(gptPrompt, api_key)

      stopLoadingOutput()
      return response
    })

    if (gptResponses) {
      const gptResponse = await Promise.all(gptResponses).then((res) => res.join(''))
      await createFileInCurrentDirectory(gptResponse, generateUri('fixtures'))
    } else {
      showErrorMessage('Unable to create fixtures.')
      myOutputChannel.clear()
      return
    }
  } else {
    showErrorMessage(
      `${
        !numFixturesRequested
          ? 'Please specify how many fixures you want created.'
          : !api_key
          ? 'Please provide api key'
          : 'Unable to create fixtures.'
      }`,
    )
    return
  }
}

export { generateFixtures }
