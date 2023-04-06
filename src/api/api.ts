// move to separate file
const vscode = require('vscode')
const openai = require('openai-api')
import { config } from './config'

// todo: replace openai with axios and use the openai api directly
// this will allow us to use the gpt-3.5-turbo model which performs like 
// davinci but each token is 1/10th the cost
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
      frequency_penalty: config.frequency_penalty
    })
    return response.data.choices[0].text.trim()
  } catch (e) {
    // todo: add logging and update error message to be more descriptive for user
    vscode.window.showErrorMessage('Error connecting to GPT: ' + e)
    console.log(e)
  }
}
