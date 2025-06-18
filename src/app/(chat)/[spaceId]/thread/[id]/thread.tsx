"use client";

import { type Message, useChat, useCompletion } from "@ai-sdk/react";
import { FormValues } from "../../input-form.schema";
import ThreadDisplay from "@/components/ThreadDisplay";
import { createIdGenerator } from "ai";
import { useEffect } from "react";
import { useQueryState } from "nuqs";
import { useAtom } from "jotai/react";
import { modelSelectionAtom } from "@/lib/store/model-selection";
import UserInput from "../../user-input";
import { useUpdateThread } from "@/lib/hooks/use-thread-queries";

interface ThreadProps {
  threadId: string;
  initialMessages?: Message[]; // Optional initial messages
}

export default function Thread(props: ThreadProps) {
  const [selectedModel] = useAtom(modelSelectionAtom);
  const [isNew, setIsNew] = useQueryState("new", {
    parse: (value) => value === "true",
  });
  const { mutate: updateThread } = useUpdateThread();

  const { append, messages, reload, status } = useChat({
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
        model: selectedModel, // Use the selected model from the atom
        message: body.messages[body.messages.length - 1], // Only send the last message content
      };
    },
  });

  const { completion, complete } = useCompletion({
    api: "/api/generate-title",
    body: {
      model: selectedModel, // Use the selected model from the atom
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
    if (isNew) {
      // If this is a new thread, reload to fetch the initial ai response
      setIsNew(false); // Reset the new state after reloading
      reload();

      const intervalId = setInterval(() => {
        if (status === "submitted" || status === "streaming") {
          // If the thread is still being processed, keep checking
          return;
        }

        if (status === "ready") {
          // If the thread is ready and has only one message, complete the title generation
          complete(messages.map((msg) => msg.content).join("\n"));
        }

        clearInterval(intervalId); // Clear the interval once processing is done
      }, 100);
    }
  }, [isNew, setIsNew, reload, status, messages, complete]);

  useEffect(() => {
    if (status !== "ready" || !completion) {
      return; // Only update the thread if the status is ready and we have a completion
    }

    // Update the thread with the latest messages when the component mounts
    updateThread({
      threadId: props.threadId,
      updates: {
        title: completion,
      },
    });
  }, [props.threadId, completion, updateThread, status]);

  return (
    <>
      {/* Thread display showing conversation history */}
      <div className="w-full overflow-y-auto flex-1 pt-16">
        <ThreadDisplay
          className="pb-4"
          threadId={props.threadId}
          messages={messages}
        />
      </div>

      <UserInput
        onSubmit={onSubmit}
        isSubmitting={status === "submitted" || status === "streaming"}
      />
    </>
  );
}
