import * as vscode from 'vscode'

import {
  getSelectedText,
  getNumFixturesRequested,
  displayOutput,
  Command,
  gptRequest,
  createFileInCurrentDirectory,
  getNewFileUri,
  myOutputChannel,
} from './util'

const FixtureGenerator = async (context: vscode.ExtensionContext) => {
  // get selected text
  const selectedText = getSelectedText()

  // get number of fixtures to generate
  const numFixturesRequested = await getNumFixturesRequested()

  displayOutput('Generating fixtures...')

  // generate prompt
  const prompt = `generate ${numFixturesRequested} fixture(s) and output the result as consts with unique names and their type using the following type: ${selectedText}`

  // send request to GPT
  const content = numFixturesRequested
    ? await gptRequest(prompt)
    : vscode.window.showErrorMessage('Could not request fixtures.')

  // create file
  const filename = 'fixtures.ts'

  // create file in current directory
  await createFileInCurrentDirectory(filename, content)

  // clear output channel
  myOutputChannel.clear()

  // display output
  displayOutput(`Fixtures generated at ${getNewFileUri(filename)}`)

  // register command
  return vscode.commands.registerCommand(Command.GenerateFixtures, async () => {
    context.subscriptions.push(myOutputChannel)
  })
}

export { FixtureGenerator }
