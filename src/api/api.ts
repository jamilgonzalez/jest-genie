// move to separate file
const openai = require('openai-api')
import * as config from './config.json'

export const gptRequest = async (prompt: string, api_key: string) => {
  // todo: add error handling, add logging, add tests, add CI/CD
  const openai_client = new openai(api_key)
  const response = await openai_client.complete({
    engine: config.model_engine,
    prompt: prompt,
    max_tokens: config.max_tokens,
    n: config.completions,
    stop: config.stop,
  })

  console.log(response)

  return response.data.choices[0].text.trim()
}
