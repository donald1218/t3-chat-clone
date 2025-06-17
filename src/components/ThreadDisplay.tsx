"use client";

import LlmResponseDisplay from "./LlmResponseDisplay";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { useUsageQueries } from "@/lib/hooks/use-usage-queries";

interface ThreadDisplayProps {
  className?: string;
  threadId?: string; // Optional thread ID for context
  messages?: UIMessage[];
}

export default function ThreadDisplay({
  className,
  threadId,
  messages,
}: ThreadDisplayProps) {
  // Create a ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If no thread or no messages, show empty state
  if (messages === undefined || messages.length === 0) {
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
        <MessageItem key={message.id} threadId={threadId} message={message} />
      ))}
      {/* Invisible div at the end to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageItem({
  threadId,
  message,
}: {
  threadId?: string;
  message: UIMessage;
}) {
  const { id, role, content } = message;
  const { data: usage } = useUsageQueries(threadId, id);

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

      {usage && (
        <div className="text-xs text-right text-gray-500 mt-1">
          {usage.tokenNumber} tokens used
        </div>
      )}
    </div>
  );
}
