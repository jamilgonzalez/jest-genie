import { Configuration, OpenAIApi } from "openai";
import { config } from './config'


const promptGPT = async (prompt: string, api_key: string) => {
	const configuration = new Configuration({
			apiKey: api_key
	});
	const openai = new OpenAIApi(configuration);
	try {
		const response = await openai.createChatCompletion({
			model: config.model,
			messages: [{role: 'user', content: prompt}],
			temperature: config.temperature,
			top_p: config.topP,
			n: config.completions,
			stream: false,
			stop: config.stop,
			max_tokens: config.max_tokens,
			presence_penalty: config.presence_penalty,
			frequency_penalty: config.frequency_penalty,
			user: 'jest-genie'
		});
				
		return {
			response: response.data.choices[0].message?.content.trim(), 
			total_usage: response.data.usage?.total_tokens
		}
	} catch (e) {
		console.log(e)
		return { error: e }
	}
}

export { promptGPT }
