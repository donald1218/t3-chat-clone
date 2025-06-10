import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google-gauth";
import { getModelById } from "./models";

// Function to get the appropriate LLM model based on the model ID
export function getChatModel(modelId: string = "gemma-3n-e4b-it") {
  const modelInfo = getModelById(modelId);

  if (!modelInfo) {
    console.warn(`Model ${modelId} not found, falling back to default model`);
    return new ChatGoogle({
      model: "gemma-3n-e4b-it",
    });
  }

  // Choose the appropriate model based on provider
  switch (modelInfo.provider) {
    case "google":
      return new ChatGoogle({
        model: modelId,
      });
    case "openai":
      return new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: modelId,
        temperature: 0.7,
      });
    case "openrouter":
      return new ChatOpenAI({
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        modelName: modelId,
        temperature: 0.7,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });
    default:
      return new ChatGoogle({
        model: "gemma-3n-e4b-it",
      });
  }
}

// Helper function to stream responses from the LLM
export async function streamingLLMResponse(input: string, modelId?: string) {
  try {
    const chatModel = getChatModel(modelId);
    const stream = await chatModel.stream(input);
    return stream;
  } catch (error) {
    console.error("Error streaming from LLM:", error);
    throw error;
  }
}

// Helper function for non-streaming responses
export async function getLLMResponse(input: string, modelId?: string) {
  try {
    const chatModel = getChatModel(modelId);
    const response = await chatModel.invoke(input);
    return response;
  } catch (error) {
    console.error("Error getting response from LLM:", error);
    throw error;
  }
}

export async function generateThreadTitle(input: string, modelId?: string) {
  try {
    const chatModel = getChatModel(modelId);
    const response = await chatModel.invoke(
      `You are an expert at generating concise and descriptive titles for discussion threads. You need to generate a title for the following input: "${input}". The title should be no longer than 100 characters and should be concise and descriptive. Do not include any other text in the title. The title should be a single line without any additional formatting or punctuation.`
    );

    return response.text || response.content;
  } catch (error) {
    console.error("Error generating thread title:", error);
    throw error;
  }
}
