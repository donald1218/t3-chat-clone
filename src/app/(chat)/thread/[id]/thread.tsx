"use client";

import { processInput } from "@/app/actions";
import InputForm from "../../input-form";
import { FormValues } from "../../input-form.schema";
import ThreadDisplay from "@/components/ThreadDisplay";
import { useAddMessage, useThread } from "@/lib/hooks/use-thread-queries";

interface ThreadProps {
  threadId: string;
}

export default function Thread(props: ThreadProps) {
  const { data: threadData, isLoading } = useThread(props.threadId);
  const addMessage = useAddMessage();

  async function getReply(data: FormValues) {
    try {
      // Use messages from the new store with TanStack Query
      const existingMessageContent = threadData?.messages
        ?.map((msg) => msg.content)
        .join("\n");

      // Call server action with both input and selected model
      const result = await processInput({
        inputField: existingMessageContent + "\n" + data.inputField,
        model: data.model || "gemma-3n-e4b-it",
      });

      if (result.success) {
        // Get the LLM response text
        const responseText =
          typeof result.llmResponse === "string"
            ? result.llmResponse
            : result.message || `Processed: ${data.inputField}`;

        // Add assistant response to thread (using both stores for now)
        await addMessage.mutateAsync({
          threadId: props.threadId,
          role: "assistant",
          content: responseText,
        });
      } else {
        // Handle error case
        const errorMsg = result.error || "Unknown error";

        // Add error message to thread (using both stores for now)
        await addMessage.mutateAsync({
          threadId: props.threadId,
          role: "assistant",
          content: `Error: ${errorMsg}`,
        });
      }
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      await addMessage.mutateAsync({
        threadId: props.threadId,
        role: "assistant",
        content: "An unexpected error occurred",
      });
    }
  }

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    try {
      // Add user message to thread (using both stores for now)
      await addMessage.mutateAsync({
        threadId: props.threadId,
        role: "user",
        content: data.inputField,
        metadata: {
          model: data.model,
        },
      });
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      await addMessage.mutateAsync({
        threadId: props.threadId,
        role: "assistant",
        content: "An unexpected error occurred",
      });
    }

    await getReply(data);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <>
      {/* Thread display showing conversation history */}
      <div className="w-full overflow-y-auto flex-1 pt-16">
        <ThreadDisplay className="pb-4" messages={threadData?.messages} />
      </div>

      <div className="sticky bottom-4 w-full max-w-3xl mx-auto">
        <InputForm onSubmit={onSubmit} />
      </div>
    </>
  );
}
