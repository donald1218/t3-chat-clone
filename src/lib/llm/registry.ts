import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createProviderRegistry } from "ai";
import {
  BYOKAnthropicConfig,
  BYOKGoogleGeminiConfig,
  BYOKOpenAIConfig,
  BYOKOpenRouterConfig,
} from "../types";

export class LlmProviderRegistryBuilder {
  providers = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
    },
  };

  withOpenAI(config: BYOKOpenAIConfig): LlmProviderRegistryBuilder {
    this.providers.openai = {
      apiKey: config.apiKey,
    };
    return this;
  }

  withAnthropic(config: BYOKAnthropicConfig): LlmProviderRegistryBuilder {
    this.providers.anthropic = {
      apiKey: config.apiKey,
    };

    return this;
  }

  withGoogleGemini(config: BYOKGoogleGeminiConfig): LlmProviderRegistryBuilder {
    this.providers.google = {
      apiKey: config.apiKey,
    };
    return this;
  }

  withOpenRouter(config: BYOKOpenRouterConfig): LlmProviderRegistryBuilder {
    this.providers.openrouter = {
      apiKey: config.apiKey,
    };

    return this;
  }

  build() {
    return createProviderRegistry({
      openai: createOpenAI({
        apiKey: this.providers.openai.apiKey,
      }),

      anthropic: createAnthropic({
        apiKey: this.providers.anthropic.apiKey,
      }),

      google: createGoogleGenerativeAI({
        apiKey: this.providers.google.apiKey,
      }),

      openrouter: {
        ...createOpenRouter({
          apiKey: this.providers.openrouter.apiKey,
        }),
        textEmbeddingModel: () => {
          throw new Error("OpenRouter does not support embedding models");
        },
      },
    });
  }
}
