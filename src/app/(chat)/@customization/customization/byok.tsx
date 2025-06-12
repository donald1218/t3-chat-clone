"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ControllerRenderProps, useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  // FormControl, // Removed unused import
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useAddByokUserKeys,
  useByokUserKeys,
} from "@/lib/hooks/use-byok-queries";
import { BYOK } from "@/db/schema";
// import { toast } from '@/components/ui/use-toast' // Assuming you have a toast component

const userProfileApiKeysSchema = z.object({
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  googleGeminiApiKey: z.string().optional(),
  openRouterApiKey: z.string().optional(),
});

type UserProfileApiKeysValues = z.infer<typeof userProfileApiKeysSchema>;

function transformDefaultValues(currentValues?: BYOK[] | null) {
  if (!currentValues || currentValues.length === 0) {
    return undefined;
  }

  return currentValues.reduce(
    (acc, key) => {
      switch (key.provider) {
        case "openai":
          acc.openaiApiKey = key.config.apiKey;
          break;
        case "anthropic":
          acc.anthropicApiKey = key.config.apiKey;
          break;
        case "google-gemini":
          acc.googleGeminiApiKey = key.config.apiKey;
          break;
        case "openrouter":
          acc.openRouterApiKey = key.config.apiKey;
          break;
      }
      return acc;
    },
    {
      openaiApiKey: "",
      anthropicApiKey: "",
      googleGeminiApiKey: "",
      openRouterApiKey: "",
    } as UserProfileApiKeysValues
  );
}

interface SecretInputProps {
  field: ControllerRenderProps;
  title: string;
  description: string;
  placeholder?: string;
}

export function SecretInput(props: SecretInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormItem>
      <FormLabel className="flex gap-2">
        <span>{props.title}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible(!visible)}
          className="p-0 size-5"
        >
          {visible ? (
            <Eye className="size-4" />
          ) : (
            <EyeClosed className="size-4" />
          )}
        </Button>
      </FormLabel>
      <Input
        type={visible ? "text" : "password"}
        placeholder={props.placeholder || "Enter your API key"}
        {...props.field}
      />
      <FormDescription>{props.description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}

export default function BYOKTab() {
  const currentValue = useByokUserKeys();
  const addKeyMutation = useAddByokUserKeys();

  const form = useForm<UserProfileApiKeysValues>({
    resolver: zodResolver(userProfileApiKeysSchema),
    mode: "onChange",
    // Initialize with undefined or empty state, will be reset later
    defaultValues: transformDefaultValues(undefined),
  });

  // Reset form when currentValue.data is loaded or changes
  useEffect(() => {
    if (currentValue.data) {
      form.reset(transformDefaultValues(currentValue.data));
    }
  }, [currentValue.data, form]); // Added form to dependency array

  function onSubmit(data: UserProfileApiKeysValues) {
    if (data.openaiApiKey) {
      addKeyMutation.mutate({
        provider: "openai",
        config: {
          apiKey: data.openaiApiKey,
        },
      });
    }

    if (data.anthropicApiKey) {
      addKeyMutation.mutate({
        provider: "anthropic",
        config: {
          apiKey: data.anthropicApiKey,
        },
      });
    }

    if (data.googleGeminiApiKey) {
      addKeyMutation.mutate({
        provider: "google-gemini",
        config: {
          apiKey: data.googleGeminiApiKey,
        },
      });
    }

    if (data.openRouterApiKey) {
      addKeyMutation.mutate({
        provider: "openrouter",
        config: {
          apiKey: data.openRouterApiKey,
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-xl mt-4"
      >
        <FormField
          control={form.control}
          name="openaiApiKey"
          render={({ field }) => (
            <SecretInput
              title="OpenAI API Key"
              description="Enter your OpenAI API key to use OpenAI models."
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="anthropicApiKey"
          render={({ field }) => (
            <SecretInput
              title="Anthropic API Key"
              description="Enter your Anthropic API key to use Anthropic models."
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="googleGeminiApiKey"
          render={({ field }) => (
            <SecretInput
              title="Google Gemini API Key"
              description="Enter your Google Gemini API key to use Gemini models."
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="openRouterApiKey"
          render={({ field }) => (
            <SecretInput
              title="OpenRouter API Key"
              description="Enter your OpenRouter API key to use models from OpenRouter."
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              field={field}
            />
          )}
        />
        <Button type="submit">Save Preferences</Button>
      </form>
    </Form>
  );
}
