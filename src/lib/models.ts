import { anthropicModels } from "./llm/anthropic";
import { googleGeminiModels } from "./llm/google";
import { openAiModels } from "./llm/openai";
import { openRouterModels } from "./llm/openrouter";
import { LLMProvider } from "./types";

// Models available for selection in the chat interface
export type ModelType = {
  id: string;
  name: string;
  provider: LLMProvider;
};

// Available models
export const availableModels: ModelType[] = [
  ...googleGeminiModels.map(
    (model) =>
      ({
        id: `google:${model.id}`,
        name: model.name,
        provider: "google",
      } satisfies ModelType)
  ),
  ...openAiModels.map(
    (model) =>
      ({
        id: `openai:${model.id}`,
        name: model.name,
        provider: "openai",
      } satisfies ModelType)
  ),
  ...anthropicModels.map(
    (model) =>
      ({
        id: `anthropic:${model.id}`,
        name: model.name,
        provider: "anthropic",
      } satisfies ModelType)
  ),
  ...openRouterModels.map(
    (model) =>
      ({
        id: `openrouter:${model.id}`,
        name: model.name,
        provider: "openrouter",
      } satisfies ModelType)
  ),
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

export function groupModelsByProvider(
  models: ModelType[]
): Record<string, ModelType[]> {
  return models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelType[]>);
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
