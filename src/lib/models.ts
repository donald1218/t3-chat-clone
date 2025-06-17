import { LLMProvider } from "./types";

// Models available for selection in the chat interface
export type ModelType = {
  id: string;
  name: string;
  provider: LLMProvider;
};

// Available models
export const availableModels: ModelType[] = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
  },
  {
    id: "openai-gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
  },
  {
    id: "qwen/qwen3-30b-a3b:free",
    name: "Qwen 3 30B",
    provider: "openrouter",
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "openrouter",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "openrouter",
  },
];

export const defaultModel: ModelType = availableModels[0]; // Default model

export function modelProviderToName(provider: string): string {
  switch (provider) {
    case "google":
      return "Google";
    case "openai":
      return "OpenAI";
    case "openrouter":
      return "OpenRouter";
    default:
      return "Unknown Provider";
  }
}

export function getAvailableModelsGroupedByProvider(): Record<
  string,
  ModelType[]
> {
  return availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelType[]>);
}

// Get model by ID
export function getModelById(id: string): ModelType | undefined {
  return availableModels.find((model) => model.id === id);
}
