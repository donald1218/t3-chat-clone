import {
  createThreadWithoutInput,
  getThread,
  updateThread,
} from "@/app/thread-actions";
import { getSpace } from "@/lib/actions/space/get-space";
import { google } from "@ai-sdk/google";
import {
  appendClientMessage,
  appendResponseMessages,
  createIdGenerator,
  streamText,
} from "ai";
import { redirect } from "next/navigation";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const spaceIdSchema = z.string().min(1, "Space ID is required");

export async function POST(req: Request) {
  const { message, id, spaceId } = await req.json();

  if (id === "") {
    const spaceIdResult = spaceIdSchema.safeParse(spaceId);
    if (!spaceIdResult.success) {
      return new Response(`Invalid space ID: ${spaceIdResult.error.message}`, {
        status: 400,
      });
    }

    const thread = await createThreadWithoutInput(spaceId);

    if (!thread) {
      return new Response("Failed to create new thread", { status: 500 });
    }

    updateThread(thread.id, {
      messages: [message],
    });

    redirect(`/${spaceId}/thread/${thread.id}?new=true`);
  }

  const thread = await getThread(id);
  const previousMessages = thread?.messages || [];
  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const space = await getSpace(thread.spaceId);

  // TODO: implement model registry
  const chatModel = google("gemini-1.5-flash");
  if (!chatModel) {
    return new Response("Model not found", { status: 404 });
  }

  const result = streamText({
    model: chatModel,
    system: space?.prompt || "You are a helpful t3 chat assistant.",
    messages,
    async onFinish({ response }) {
      await updateThread(id, {
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      });
    },
    async onError(error) {
      console.error("Error during streaming:", error);
      // Handle error appropriately, e.g., log it or notify the user
    },
    experimental_generateMessageId: createIdGenerator({
      prefix: "msgs",
      separator: "-",
      size: 16,
    }),
  });

  return result.toDataStreamResponse();
}
