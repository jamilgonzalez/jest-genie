export const jest_prompt = (fc: string) =>
  `As an AI language model, your task is to generate a comprehensive test suite for a React functional component using TypeScript.` +
  `The test suite should utilize the Jest testing framework and the React Testing Library.` +
  `Focus on ensuring that all UI components are properly rendering and handling user interactions, while also including appropriate test fixtures for different scenarios.\n` +
  `Make sure the test suite follows the principles behind tests as documentation, and that it is easy to understand and maintain. Consider edge cases, error handling, and any other relevant aspects when creating the test suite.\n` +
  `Respond with code only.\n` +
  `Here is the functional component for which the test suite needs to be created:\n` +
  `${fc}\n` +
  `Remember, the test suite should be compatible with a TypeScript project and make use of Jest and React Testing Library.`
