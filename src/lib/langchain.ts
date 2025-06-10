import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google-gauth";

// Initialize the OpenAI model with your API key
// This should be stored in an environment variable
// export const chatModel = new ChatOpenAI({
//   openAIApiKey: process.env.OPENAI_API_KEY,
//   modelName: "google/gemma-3n-e4b-it:free", // You can change this to the model you want to use
//   temperature: 0.7,
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1",
//   },
// });

// Initialize the Google Generative AI model with your API key
export const chatModel = new ChatGoogle({
  model: "gemma-3n-e4b-it",
});

// Helper function to stream responses from the LLM
export async function streamingLLMResponse(input: string) {
  try {
    const stream = await chatModel.stream(input);
    return stream;
  } catch (error) {
    console.error("Error streaming from LLM:", error);
    throw error;
  }
}

// Helper function for non-streaming responses
export async function getLLMResponse(input: string) {
  try {
    const response = await chatModel.invoke(input);
    return response;
  } catch (error) {
    console.error("Error getting response from LLM:", error);
    throw error;
  }
}

export async function generateThreadTitle(input: string) {
  try {
    const response = await chatModel.invoke(
      `You are an expert at generating concise and descriptive titles for discussion threads. You need to generate a title for the following input: "${input}". The title should be no longer than 100 characters and should be concise and descriptive. Do not include any other text in the title. The title should be a single line without any additional formatting or punctuation.`
    );

    return response.text || response.content;
  } catch (error) {
    console.error("Error generating thread title:", error);
    throw error;
  }
}
