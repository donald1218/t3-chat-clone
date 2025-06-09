"use client";

import { type Message } from "@/lib/thread-store";
import { useCurrentThread } from "@/lib/hooks/use-thread-store";
import LlmResponseDisplay from "./LlmResponseDisplay";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface ThreadDisplayProps {
  className?: string;
}

export default function ThreadDisplay({ className }: ThreadDisplayProps) {
  // Get messages from thread store using TanStack Query
  const { messages, isLoading, threadId } = useCurrentThread();
  // Create a ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-xl font-semibold mb-2">
            Loading conversation...
          </h2>
          <div className="flex space-x-2 justify-center">
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no thread or no messages, show empty state
  if (!threadId || messages.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p>Type a message below to start a conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {/* Invisible div at the end to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageItem({ message }: { message: Message }) {
  const { role, content } = message;

  return (
    <div
      className={cn(
        "flex flex-col px-4 py-3 rounded-lg",
        role === "user"
          ? "bg-blue-50 dark:bg-blue-900/20 ml-8"
          : "bg-gray-50 dark:bg-gray-800/50 mr-8"
      )}
    >
      <div className="font-medium mb-1">
        {role === "user" ? "You" : "Assistant"}
      </div>

      {role === "assistant" ? (
        <LlmResponseDisplay response={content} />
      ) : (
        <div className="whitespace-pre-wrap">{content}</div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 self-end">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
