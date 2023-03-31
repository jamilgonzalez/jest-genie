# Mock Data Generator GPT VS Code Extension

This VS Code extension allows you to generate mock test data for TypeScript types and interfaces. Simply highlight the type or interface in your code, and the extension will generate mock data and write it to a `fixtures.ts` file in your project.

## Features

- Generate mock data for TypeScript types and interfaces
- Write generated mock data to a `fixtures.ts` file in your project
- Customize the generated data using options such as minimum and maximum values, string formats, and more

## Usage

To generate mock data for a TypeScript type or interface:

1. Install the Mock Data Generator extension from the VS Code Marketplace.
2. Highlight the type or interface for which you want to generate mock data.
3. Right-click on the highlighted text and select "Generate Fixtures GPT" from the context menu.
4. In the prompt that appears, enter the amount of fixtures you want generated and hit enter
5. The extension will generate mock data and write it to a `fixtures.ts` file in your project.

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
