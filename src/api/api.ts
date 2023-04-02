// move to separate file
const vscode = require('vscode')
const openai = require('openai-api')
import { config } from './config'

export const promptGPT = async (prompt: string, api_key: string) => {
  try {
    const openai_client = new openai(api_key)
    const response = await openai_client.complete({
      engine: config.model_engine,
      prompt: prompt,
      max_tokens: config.max_tokens,
      n: config.completions,
      stop: config.stop,
      temperature: config.temperature,
      top_p: config.topP,
    })
    return response.data.choices[0].text.trim()
  } catch (e) {
    // todo: add logging and update error message to be more descriptive for user
    vscode.window.showErrorMessage('Error connecting to GPT: ' + e)
    console.log(e)
  }
}
