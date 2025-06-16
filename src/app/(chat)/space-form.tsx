"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { spaceFormSchema, SpaceFormValues } from "./space-form.schema";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useCreateSpace,
  useSpace,
  useUpdateSpace,
} from "@/lib/hooks/use-space-queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

interface BaseFieldsProps {
  form: ReturnType<typeof useForm<SpaceFormValues>>;
}

function BaseFields({ form }: BaseFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      <FormField
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <FormItem className="flex flex-col gap-1">
            <Label>Space Name</Label>
            <Input
              {...field}
              placeholder="Space name..."
              className={cn(
                "w-full border-primary",
                fieldState.error
                  ? "border-red-500 placeholder:text-destructive"
                  : ""
              )}
              autoFocus
            />
            <FormMessage className="px-0.5" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="prompt"
        render={({ field, fieldState }) => (
          <FormItem>
            <Label>Space Prompt</Label>
            <Textarea
              {...field}
              placeholder="This prompt will applied to all threads in this space."
              className={cn(
                "resize-none overflow-y-auto min-h-[40ch]",
                "w-full border-primary",
                fieldState.error
                  ? "border-red-500 placeholder:text-destructive"
                  : ""
              )}
            />
            <FormMessage className="px-0.5" />
          </FormItem>
        )}
      />
    </div>
  );
}

export function CreateSpaceForm() {
  const { mutate: createSpace } = useCreateSpace();

  const form = useForm({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      name: "",
      prompt: "",
    },
  });

  const handleSubmit = (data: SpaceFormValues) => {
    createSpace({
      spaceName: data.name,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <BaseFields form={form} />

        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className="w-full mt-2"
        >
          {form.formState.isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          ) : (
            "Create Space"
          )}
        </Button>
      </form>
    </Form>
  );
}

interface UpdateSpaceFormProps {
  spaceId: string;
  onSubmitted?: () => void;
}

export function UpdateSpaceForm({
  spaceId,
  onSubmitted,
}: UpdateSpaceFormProps) {
  const { data: space, isLoading } = useSpace(spaceId);
  const { mutate: updateSpace } = useUpdateSpace(spaceId);

  const form = useForm<SpaceFormValues>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      name: space?.name,
      prompt: space?.prompt || "",
    },
  });

  const handleSubmit = (data: SpaceFormValues) => {
    updateSpace({
      spaceName: data.name,
      spacePrompt: data.prompt,
    });

    onSubmitted?.();
  };

  useEffect(() => {
    form.reset({
      name: space?.name || "",
      prompt: space?.prompt || "",
    });
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Loading space details...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <BaseFields form={form} />

        <Button type="submit" className="w-full mt-2">
          Update Space
        </Button>
      </form>
    </Form>
  );
}
