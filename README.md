## Jest-Genie: Test Suite Generator Using OpenAi's GPT-3.5 Turbo Model

- JestGenie is a tool that uses OpenAI's GPT technology to generate test suites for React projects written in typescript

- Typescript is especially useful here since it gives GPT-3.5 Turbo types and/or interfaces to work with which it will use to create more accurate and contextual test suites

- You can generate tests by right clicking a file and selecting "Jest Genie: Generate Tests" option in the menu

### Note:

- GPT-3.5 Turbo can only handle 4,096 tokens in a given request (at 4 tokens a word we get ~1,024 words)

- Both input and output tokens count toward this limit so some files may be too large to process

- This will become less of an issue as OpenAI opens up GPT-4 and future models to their api

## Requirements

- You will need to get an api key from https://platform.openai.com/account/api-keys

## How to Run in Debug Mode

1. Run `yarn install` to install all of the project dependencies
2. Then run `yarn start` to compile the project in watch mode
3. Open `generateTestSuite.ts`
4. Hit `F5` or click the debugger in the menu and run in debug mode (with no configuration)
5. Press `CMD+Shift+P` (in the newly opened VSCode window)
6. Type JestGenie to get the list of commands to run for the extension

## Demo

https://user-images.githubusercontent.com/21287418/230697326-bfdc5906-a805-4506-a2f5-f9d0152128e9.mp4

## Support

If you find my work helpful, please consider supporting me by sending a donation to my Bitcoin address:

![support_via_btc](https://user-images.githubusercontent.com/21287418/230697525-f913f028-3459-4aa8-9911-f10eb27f01c7.jpg)

Your contributions will help me continue to create high-quality content and improve my projects. Thank you for your support!
