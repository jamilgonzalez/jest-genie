# Mock Data Generator GPT VS Code Extension

This VS Code extension allows you to generate mock test data for TypeScript types and interfaces. Simply highlight the type or interface in your code, and the extension will generate mock data and write it to a `fixtures.ts` file in your project.

## GPT

We use the OpenAI GPT-3 API with the following configuration:

model_engine: 'text-davinci-002'
completions: 1
max_tokens: 1024
stop: '\\n'

## Usage

To run this project locally, you will need to obtain an API key from OpenAI.

Once you have your API key, you will need to create a `.env` file at the root of your directory and add the following line:

```
GPT_API_KEY=your-api-key-here

```

Replace `your-api-key-here` with your actual API key. This will allow the extension to communicate with the OpenAI GPT API and generate mock data for your TypeScript types and interfaces.

## Run the Plugin

1. Run `yarn install` to install dependencies.
2. Run `yarn start` to compile and run the project in watch mode.
3. Press F5 to launch the extension locally.
4. To generate mock data for a TypeScript type or interface, highlight the type or interface and select "Generate Fixtures GPT" from the context menu.
5. In the prompt that appears, enter the amount of fixtures you want generated and hit enter.
6. The extension will generate mock data and write it to a `fixtures.ts` file in your project.

## Example

Suppose you have the following TypeScript interface in your code:

```
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isPremium: boolean;
}

```

To generate mock data for this interface, simply highlight the interface and select "Generate Fixtures GPT" from the context menu. You can then enter the amount of fixtures you want created.

The extension will generate mock data for the `User` interface and write it to a `fixtures.ts` file in your project:

```
export const userFixture: User = {
  id: 1,
  name: 'string',
  email: 'string',
  age: 35,
  isPremium: false,
};

```
