import { Configuration, OpenAIApi } from 'openai'
import { GPTModelConfig, OpenAiResponse, OpenAI } from './types'

class OpenAIInteractor implements OpenAI {
  config: GPTModelConfig

  constructor(config: GPTModelConfig) {
    this.config = config
  }

  postGPTPrompt = async (prompt: string, api_key: string): Promise<OpenAiResponse> => {
    const configuration = new Configuration({
      apiKey: api_key,
    })
    const openai = new OpenAIApi(configuration)
    try {
      const response = await openai.createChatCompletion({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        top_p: this.config.top_p,
        n: this.config.completions,
        stream: false,
        stop: this.config.stop,
        max_tokens: this.config.max_tokens,
        presence_penalty: this.config.presence_penalty,
        frequency_penalty: this.config.frequency_penalty,
        user: 'jest-genie',
      })

      return {
        response: response.data.choices[0].message?.content.trim(),
        total_usage: response.data.usage?.total_tokens,
      }
    } catch (e) {
      console.log(e)
      return { error: e }
    }
  }
}

export { OpenAIInteractor }
