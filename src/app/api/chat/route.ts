import { getProfile } from "@/lib/actions/account/get-profile";
import { getUserKeys } from "@/lib/actions/byok/get-user-keys";
import { getSpace } from "@/lib/actions/space/get-space";
import { getThread } from "@/lib/actions/thread/get-thread";
import { updateThread } from "@/lib/actions/thread/update-thread";
import { recordMessageTokenUsage } from "@/lib/actions/usage/record-message-token-usage";
import { SystemPromptBuilder } from "@/lib/llm/prompt";
import { LlmProviderRegistryBuilder } from "@/lib/llm/registry";
import {
  appendClientMessage,
  appendResponseMessages,
  createIdGenerator,
  streamText,
} from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export async function POST(req: Request) {
  const { id, message, model } = await req.json();

  const thread = await getThread(id);
  const previousMessages = thread?.messages || [];
  const messages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  const space = await getSpace(thread.spaceId);
  const byok = await getUserKeys(space.userId);
  const userPreferences = await getProfile();

  const registryBuilder = new LlmProviderRegistryBuilder();
  for (const key of byok ?? []) {
    switch (key.provider) {
      case "openai":
        registryBuilder.withOpenAI({ apiKey: key.config.apiKey });
        break;
      case "anthropic":
        registryBuilder.withAnthropic({ apiKey: key.config.apiKey });
        break;
      case "google":
        registryBuilder.withGoogleGemini({ apiKey: key.config.apiKey });
        break;
      case "openrouter":
        registryBuilder.withOpenRouter({ apiKey: key.config.apiKey });
        break;
      default:
        console.warn(`Unknown provider: ${key.provider}`);
    }
  }
  const registry = registryBuilder.build();

  const chatModel = registry.languageModel(model);
  if (!chatModel) {
    return new Response("Model not found", { status: 404 });
  }

  const systemPrompt = new SystemPromptBuilder()
    .withSpacePrompt(space?.prompt || "")
    .withUserCustomInstructions(userPreferences.customInstructions)
    .withUserName(userPreferences.name)
    .withUserProfession(userPreferences.profession)
    .build();

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages,
    async onFinish({ response, usage }) {
      await updateThread({
        threadId: id,
        updates: {
          messages: appendResponseMessages({
            messages,
            responseMessages: response.messages,
          }),
        },
      });

      const lastResponseMessage =
        response.messages[response.messages.length - 1];

      await recordMessageTokenUsage(id, message.id, usage.promptTokens);
      await recordMessageTokenUsage(
        id,
        lastResponseMessage.id,
        usage.completionTokens
      );
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
