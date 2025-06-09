"use client";

import { processInput } from "./actions";
import InputForm from "./input-form";
import { FormValues } from "./input-form.schema";
import ThreadDisplay from "@/components/ThreadDisplay";
import ThreadManager from "@/components/ThreadManager";
import { useCurrentThread } from "@/lib/hooks/use-thread-store";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Home() {
  // Also use new thread store with TanStack Query
  const { messages, threadId, addMessage, clearThread, initializeThread } =
    useCurrentThread();

  // Initialize thread on component mount
  useEffect(() => {
    initializeThread();
  }, [initializeThread]);

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    try {
      // Add user message to thread (using both stores for now)
      await addMessage("user", data.inputField);

      // Use messages from the new store with TanStack Query
      const existingMessageContent = messages
        .map((msg) => msg.content)
        .join("\n");

      // Call server action
      const result = await processInput(
        existingMessageContent + "\n" + data.inputField
      );

      if (result.success) {
        // Get the LLM response text
        const responseText =
          typeof result.llmResponse === "string"
            ? result.llmResponse
            : result.message || `Processed: ${data.inputField}`;

        // Add assistant response to thread (using both stores for now)
        await addMessage("assistant", responseText);
      } else {
        // Handle error case
        const errorMsg =
          result.error ||
          (result.errors
            ? Object.values(result.errors).join(", ")
            : "Unknown error");

        // Add error message to thread (using both stores for now)
        await addMessage("assistant", `Error: ${errorMsg}`);
      }
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      await addMessage("assistant", "An unexpected error occurred");
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for threads */}
      <div className="hidden md:flex w-64 flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
        <ThreadManager />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen p-4">
        <main className="flex flex-col w-full min-h-screen gap-[32px] items-center justify-center">
          {/* Thread display showing conversation history */}
          <div className="w-full pt-8 overflow-y-auto flex-1 relative max-h-[calc(100vh-120px)]">
            {messages && messages.length > 0 && (
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearThread();
                  }}
                  className="text-xs"
                >
                  Clear Thread
                </Button>
              </div>
            )}
            <ThreadDisplay className="pb-4" />
          </div>

          <div className="sticky bottom-4 w-full max-w-3xl mx-auto">
            <InputForm onSubmit={onSubmit} />
          </div>
        </main>
      </div>
    </div>
  );
}
