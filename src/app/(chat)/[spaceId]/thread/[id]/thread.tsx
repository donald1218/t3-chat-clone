"use client";

import { type Message, useChat } from "@ai-sdk/react";
import InputForm from "../../input-form";
import { FormValues } from "../../input-form.schema";
import ThreadDisplay from "@/components/ThreadDisplay";
import { createIdGenerator } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQueryState } from "nuqs";

interface ThreadProps {
  threadId: string;
  initialMessages?: Message[]; // Optional initial messages
}

export default function Thread(props: ThreadProps) {
  const router = useRouter();
  const reloaded = useRef(false);
  const [isNew, setIsNew] = useQueryState("new", {
    parse: (value) => value === "true",
  });

  const { handleSubmit, append, messages, reload } = useChat({
    id: props.threadId,
    initialMessages: props.initialMessages ?? [],
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
      };
    },
  });

  // Handle form submission with server action
  async function onSubmit(data: FormValues) {
    await append({
      role: "user",
      content: data.inputField,
    });
  }

  useEffect(() => {
    if (!reloaded.current && isNew) {
      // If this is a new thread, reload to fetch the initial ai response
      reloaded.current = true; // Prevent infinite reload loop
      setIsNew(false); // Reset the new state after reloading
      reload();
    }
  }, [isNew, setIsNew, reload]);

  return (
    <>
      {/* Thread display showing conversation history */}
      <div className="w-full overflow-y-auto flex-1 pt-16">
        <ThreadDisplay className="pb-4" messages={messages} />
      </div>

      <div className="sticky bottom-4 w-full max-w-3xl mx-auto">
        <InputForm onSubmit={onSubmit} />
      </div>
    </>
  );
}
