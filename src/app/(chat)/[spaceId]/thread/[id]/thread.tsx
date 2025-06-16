"use client";

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

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    await addMessage.mutateAsync({
      threadId: props.threadId,
      model: data.model,
      content: data.inputField,
      metadata: {
        model: data.model,
      },
    });
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
