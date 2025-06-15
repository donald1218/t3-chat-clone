"use client";

import { useEffect, useState } from "react";
import InputForm from "./input-form";
import { FormValues } from "./input-form.schema";
import {
  prefetchThreadQuery,
  useCreateThread,
  useThreads,
} from "@/lib/hooks/use-thread-queries";
import { useRouter } from "next/navigation";
import ThreadDisplay from "@/components/ThreadDisplay";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const { data: threads } = useThreads();
  const queryClient = useQueryClient();
  const [hasNewThread, setHasNewThread] = useState(false);

  const createThreadMutation = useCreateThread();
  const router = useRouter();

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    let newThreadId: string;
    try {
      const newThread = await createThreadMutation.mutateAsync({
        firstMessage: data.inputField,
      });

      if (!newThread) {
        throw new Error("Failed to create new thread");
      }

      newThreadId = newThread.id;

      await prefetchThreadQuery(queryClient, newThreadId);
    } catch (error) {
      console.error("Failed to create new thread:", error);

      return;
    }

    router.push(`/thread/${newThreadId}`);
  }

  useEffect(() => {
    if (!threads) {
      return;
    }

    if (threads[0].id == "" && threads[0].user == "") {
      setHasNewThread(true);
    }
  }, [threads]);

  return (
    <>
      {hasNewThread ? (
        <div className="w-full overflow-y-auto flex-1 pt-16">
          <ThreadDisplay className="pb-4" messages={threads?.[0]?.messages} />
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-xl font-semibold mb-2">Ask me anything!</h2>
          <p>Type a message below to start a conversation.</p>
        </div>
      )}

      <div className="sticky bottom-4 w-full max-w-3xl mx-auto">
        <InputForm onSubmit={onSubmit} />
      </div>
    </>
  );
}
