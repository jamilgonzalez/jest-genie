"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptGPT = void 0;
// move to separate file
const vscode = require('vscode');
const openai = require('openai-api');
const config_1 = require("./config");
const promptGPT = async (prompt, api_key) => {
    try {
        const openai_client = new openai(api_key);
        const response = await openai_client.complete({
            engine: config_1.config.model_engine,
            prompt: prompt,
            max_tokens: config_1.config.max_tokens,
            n: config_1.config.completions,
            stop: config_1.config.stop,
        });
        return response.data.choices[0].text.trim();
    }
    catch (e) {
        // todo: add logging and update error message to be more descriptive for user
        vscode.window.showErrorMessage('Error connecting to GPT: ' + e);
        console.log(e);
    }
};
exports.promptGPT = promptGPT;
//# sourceMappingURL=api.js.map