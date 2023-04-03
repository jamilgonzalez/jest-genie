const path = require('path')
import * as vscode from 'vscode'
import { TextEncoder } from 'util'
import { promptGPT } from '../api/api'
import { myOutputChannel } from '../extension'

const charactersPerToken = 4

const {
  showErrorMessage,
} = vscode.window


const getHighlightedText = () => {
  const activeTextEditor = vscode.window.activeTextEditor
  if (!activeTextEditor) {
    showErrorMessage('No active text editor found')
    return
  }

  const highlightedText = activeTextEditor.document.getText(activeTextEditor.selection)

  console.log(highlightedText)

  if (highlightedText.length === 0) {
    showErrorMessage('Please select a function to generate tests for.')
    return
  }

  const numberOfTokens = Math.ceil(highlightedText.length / charactersPerToken);


  if (numberOfTokens > 1024) {
    showErrorMessage(`Selection is too large (${numberOfTokens} tokens). \nPlease select a smaller function or reduce the size of this one. \nThat shit is huge.`)
    return
  } else {
    return highlightedText
  }
}

// generates a uri for the new file based on the current file user is in
const generateUri = () => {
  if (!vscode.window.activeTextEditor) {
    showErrorMessage('No active editor found.')
    return
  }

  const currentFilePath = vscode.window.activeTextEditor.document.fileName

  const componentName = currentFilePath.split('/').find(item => item.includes('.'))?.split('.')[0]

  const currentFileDirectory = path.dirname(currentFilePath)

  const ext = path.extname(currentFilePath)

  return vscode.Uri.file(path.join(currentFileDirectory, `/__tests__/${componentName}.test${ext}`))
}

async function createFileInCurrentDirectory(content: string, filename: vscode.Uri | undefined) {
  const fileData = new TextEncoder().encode(content)

  if (!filename) {
    // todo: update to more specific error message
    showErrorMessage('Could not create file.')
    return
  } else {
    await vscode.workspace.fs.writeFile(filename, fileData)
    // display output
    myOutputChannel.appendLine(`Tests generated at ${filename.path}`)
    myOutputChannel.show()
  }
}


const prompt = (fixture: string) =>
  `Generate a React test suite using only Jest testing framework and the React Testing Library for a typescript project that validate all  UI is rendering for the this functional component that I will provide you: \n\n` +
  `${fixture}`

// display loading output
function startLoadingOutput(active: boolean) {
  let i = 0
  if (!active) {
    return () => {} // Return an empty function if not active
  }

  const intervalId = setInterval(() => {
    // todo: extract out getting component name into a function
    if (!vscode.window.activeTextEditor) {
      showErrorMessage('No active editor found.')
      return
    }
    const currentFilePath = vscode.window.activeTextEditor.document.fileName
    const componentName = currentFilePath.split('/').find(item => item.includes('.'))?.split('.')[0]

    i === 0 ? myOutputChannel.replace(`Generating Tests for ${componentName}`) : myOutputChannel.append('.')
    i++
    if (i === 4) {
      i = 0
    }
  }, 500)

  return () => {
    clearInterval(intervalId) // Return a function that clears the interval
     myOutputChannel.clear()
  }
}

// what kind of params would make sense here?
const generateTests = async (uri: vscode.Uri, globalState: vscode.Memento) => {
  let api_key = globalState.get<string>('GPT_API_KEY')
  let selectedText = getHighlightedText()

  if (!selectedText) {
    showErrorMessage('Please select a function to generate tests for.')
    return
  }
    
  // send request to GPT
  if (api_key) {
    const stopLoadingOutput = startLoadingOutput(true)

      const gptPrompt = prompt(selectedText)

      const gptResponse = await promptGPT(gptPrompt, api_key)

      stopLoadingOutput()

    if (gptResponse) {
      await createFileInCurrentDirectory(gptResponse, generateUri())
    } else {
      showErrorMessage('Error in GPT response. You may have reached your API limit.')

      api_key = await vscode.window.showInputBox({
        prompt: 'Enter new API key: '
      });
      
      // Store the API key in global state
      if (api_key) {
        await globalState.update('myApiKey', api_key);
      }
      return
    }
  } else {
    api_key = await vscode.window.showInputBox({
      prompt: 'Please enter a valid API key: '
    });
    
    // Store the API key in global state
    if (api_key) {
      await globalState.update('myApiKey', api_key);
    }
    return
  }
}

export { generateTests }
