import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google-gauth";
import { getModelById } from "./models";
import { createClient } from "./supabase/server";
import {
  BYOKAnthropicConfig,
  BYOKGoogleGeminiConfig,
  BYOKOpenAIConfig,
  BYOKOpenRouterConfig,
} from "./types";
import { getUserKeys } from "./actions/byok/get-user-keys";

const getUserId = async () => {
  const supabaseClient = await createClient();
  const user = await supabaseClient.auth.getUser();

  return user.data.user?.id || null;
};

// Function to get the appropriate LLM model based on the model ID
export async function getChatModel(modelId: string = "gemma-3n-e4b-it") {
  const modelInfo = getModelById(modelId);
  const userId = await getUserId();

  let byokConfigs: {
    openaiKey: BYOKOpenAIConfig | null;
    anthropicKey: BYOKAnthropicConfig | null;
    googleGemeniKey: BYOKGoogleGeminiConfig | null;
    openRouterKey: BYOKOpenRouterConfig | null;
  } = {
    openaiKey: null,
    anthropicKey: null,
    googleGemeniKey: null,
    openRouterKey: null,
  };

  if (userId) {
    const configs = await getUserKeys(userId);
    if (configs) {
      byokConfigs = {
        openaiKey: configs.find((c) => c.provider === "openai")?.config || null,
        anthropicKey:
          configs.find((c) => c.provider === "anthropic")?.config || null,
        googleGemeniKey:
          configs.find((c) => c.provider === "google-gemini")?.config || null,
        openRouterKey:
          configs.find((c) => c.provider === "openrouter")?.config || null,
      };
    }
  }

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
        apiKey:
          byokConfigs.googleGemeniKey?.apiKey || process.env.GOOGLE_API_KEY,
      });
    case "openai":
      return new ChatOpenAI({
        openAIApiKey:
          byokConfigs.openaiKey?.apiKey || process.env.OPENAI_API_KEY,
        modelName: modelId,
        temperature: 0.7,
      });
    case "openrouter":
      return new ChatOpenAI({
        openAIApiKey:
          byokConfigs.openRouterKey?.apiKey || process.env.OPENROUTER_API_KEY,
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
    const chatModel = await getChatModel(modelId);
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
    const chatModel = await getChatModel(modelId);
    const response = await chatModel.invoke(input);
    return response;
  } catch (error) {
    console.error("Error getting response from LLM:", error);
    throw error;
  }
}

export async function generateThreadTitle(input: string, modelId?: string) {
  try {
    const chatModel = await getChatModel(modelId);
    const response = await chatModel.invoke(
      `You are an expert at generating concise and descriptive titles for discussion threads. You need to generate a title for the following input: "${input}". The title should be no longer than 100 characters and should be concise and descriptive. Do not include any other text in the title. The title should be a single line without any additional formatting or punctuation.`
    );

    return response.text || response.content;
  } catch (error) {
    console.error("Error generating thread title:", error);
    throw error;
  }
}
