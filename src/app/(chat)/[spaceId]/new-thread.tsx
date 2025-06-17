"use client";

import { FormValues } from "./input-form.schema";
import ThreadDisplay from "@/components/ThreadDisplay";
import UserInput from "./user-input";
import { useChat } from "@ai-sdk/react";
import { createIdGenerator } from "ai";
import { createThread } from "@/lib/actions/thread/create-thread";
import { useRouter } from "next/navigation";
import { useInvalidListThreadQuery } from "@/lib/hooks/use-thread-queries";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NewThreadPageProps {
  spaceId: string;
}

export default function NewThreadPage(props: NewThreadPageProps) {
  const router = useRouter();
  const invalidListThreadQuery = useInvalidListThreadQuery(props.spaceId);
  const [isLoading, setIsLoading] = useState(false);

  const { messages, append, setMessages, status } = useChat({
    id: "",
    initialMessages: [],
    sendExtraMessageFields: true,
    generateId: createIdGenerator({
      prefix: "msgc",
      separator: "-",
      size: 16,
    }),
    experimental_prepareRequestBody(body) {
      return {
        id: body.id,
        message: body.messages[body.messages.length - 1], // Only send the last message content
        spaceId: props.spaceId, // Include spaceId in the request body
      };
    },
    fetch: async (input, init) => {
      if (!init) return new Response("No init provided", { status: 400 });

      const body = JSON.parse(init.body as string);
      console.log("fetch message", body.message);

      const newThread = await createThread(props.spaceId, body.message);
      invalidListThreadQuery();

      return new Response("", {
        status: 200,

        headers: {
          "X-Thread-ID": newThread.id,
        },
      });
    },
    onError(error) {
      console.error("Error in NewThreadPage:", error);
      // Handle error appropriately, e.g., show a notification or log it
    },
    onResponse(response) {
      router.push(
        `/${props.spaceId}/thread/${response.headers.get(
          "X-Thread-ID"
        )}?new=true`
      );
      // Handle response if needed, e.g., update UI or state
    },
  });

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    append(
      {
        role: "user",
        content: data.inputField,
      },
      {
        body: {
          spaceId: props.spaceId,
        },
      }
    );
  }

  useEffect(() => {
    setMessages([]);
  }, [setMessages]);

  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      setIsLoading(true);
    }
  }, [status]);

  return (
    <>
      {messages.length > 0 ? (
        <div className="w-full overflow-y-auto flex-1 pt-16">
          <ThreadDisplay className="pb-4" messages={messages} />
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-xl font-semibold mb-2">Ask me anything!</h2>
          <p>Type a message below to start a conversation.</p>
        </div>
      )}

      <UserInput onSubmit={onSubmit} isSubmitting={isLoading} />
      <Link href="/voice" prefetch>
        Voice Assistant
      </Link>
    </>
  );
}
