/**
 * Types for the chat application
 */

export type MessageRole = "user" | "assistant";

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
