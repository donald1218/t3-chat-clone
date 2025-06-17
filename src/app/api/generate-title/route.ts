import { getUserKeys } from "@/lib/actions/byok/get-user-keys";
import { LlmProviderRegistryBuilder } from "@/lib/llm/registry";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const TitleGenerationPrompt = (conversation: string) =>
  `Generate a concise and descriptive title for the following conversation. The title should capture the main topic or theme discussed in the conversation.\n<conversation>\n${conversation}\n</conversation>\nTitle: `;

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user.data?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user.data?.user?.id;

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { prompt, model } = await req.json();

  const byok = await getUserKeys(userId);
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

  const result = streamText({
    model: chatModel,
    prompt: TitleGenerationPrompt(prompt),
  });

  return result.toDataStreamResponse();
}
