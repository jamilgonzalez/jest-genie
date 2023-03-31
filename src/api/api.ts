// move to separate file
const openai = require('openai-api')
import * as dotenv from 'dotenv'
import * as config from './config.json'

const parsedKey = dotenv.config()

// key generated on Mar 30th
const api_key = parsedKey.parsed?.GPT_API_KEY
const openai_client = new openai(api_key)

export const gptRequest = async (prompt: string) => {
  // todo: add error handling, add logging, add tests, add CI/CD
  const response = await openai_client.complete({
    engine: config.model_engine,
    prompt: prompt,
    max_tokens: config.max_tokens,
    n: config.completions,
    stop: config.stop,
  })

  return response.data.choices[0].text.trim()
}
