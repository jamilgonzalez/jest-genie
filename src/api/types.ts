interface OpenAI {
  postGPTPrompt: (prompt: string, api_key: string) => Promise<OpenAiResponse>
}

type OpenAiResponse = {
  response?: string
  total_usage?: number
  error?: any // TODO: create error type
}

type GPTModelConfig = {
  model: string
  completions: number
  max_tokens?: number
  stop: string
  temperature: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
}

export { OpenAiResponse, GPTModelConfig, OpenAI }
