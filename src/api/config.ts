import { GPTModelConfig } from './types'

export const config: GPTModelConfig = {
  model: 'gpt-3.5-turbo',
  completions: 1,
  max_tokens: 1024,
  stop: '\\n',
  temperature: 0.25,
  top_p: 0.9,
  frequency_penalty: 0.5,
  presence_penalty: 0.5,
}
