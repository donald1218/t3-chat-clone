/**
 * Types for the chat application
 */

export type MessageRole = "human" | "ai";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    [key: string]: unknown;
  };
}

export type LLMProvider = "openai" | "anthropic" | "google" | "openrouter";

export interface BYOKOpenAIConfig {
  apiKey: string;
}

export interface BYOKAnthropicConfig {
  apiKey: string;
}

export interface BYOKGoogleGeminiConfig {
  apiKey: string;
}
export interface BYOKOpenRouterConfig {
  apiKey: string;
}

export type BYOKConfig =
  | BYOKOpenAIConfig
  | BYOKAnthropicConfig
  | BYOKGoogleGeminiConfig
  | BYOKOpenRouterConfig;
