"use client";

import InputForm from "./input-form";
import { FormValues } from "./input-form.schema";
import { useAddMessage, useCreateThread } from "@/lib/hooks/use-thread-queries";
import { useRouter } from "next/navigation";

export default function Home() {
  const createThreadMutation = useCreateThread();
  const addMessageMutation = useAddMessage();
  const router = useRouter();

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    let newThreadId: string;
    try {
      const newThread = await createThreadMutation.mutateAsync();

      if (!newThread) {
        throw new Error("Failed to create new thread");
      }

      newThreadId = newThread.id;
    } catch (error) {
      console.error("Failed to create new thread:", error);

      return;
    }

    try {
      // Add user message to thread (using both stores for now)
      await addMessageMutation.mutateAsync({
        threadId: newThreadId,
        role: "user",
        content: data.inputField,
      });

      router.push(`/thread/${newThreadId}`);
    } catch (error) {
      console.error("Failed to add user message:", error);
      return;
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen p-4">
      <main className="flex flex-col w-full h-full gap-[32px] items-center justify-center">
        {/* <div className="w-full pt-8 overflow-y-auto flex-1 relative max-h-[calc(100vh-120px)]">
          <ThreadDisplay className="pb-4" />
        </div> */}

        <div className="text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-xl font-semibold mb-2">Ask me anything!</h2>
          <p>Type a message below to start a conversation.</p>
        </div>

        <div className="sticky bottom-4 w-full max-w-3xl mx-auto">
          <InputForm onSubmit={onSubmit} />
        </div>
      </main>
    </div>
  );
}
