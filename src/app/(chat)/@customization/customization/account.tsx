"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile-queries";
import { useEffect } from "react";
import { CheckIcon } from "lucide-react";
// import { toast } from '@/components/ui/use-toast' // Assuming you have a toast component

const userProfileCustomizationSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not be longer than 50 characters.",
    })
    .optional(),
  userProfession: z.string().max(100).optional(),
  customInstructions: z.string().max(500).optional(),
});

type UserProfileCustomizationValues = z.infer<
  typeof userProfileCustomizationSchema
>;

export default function AccountTab() {
  const { data: profile, isLoading } = useProfile();
  const {
    mutate: updateProfile,
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
  } = useUpdateProfile();

  const form = useForm<UserProfileCustomizationValues>({
    resolver: zodResolver(userProfileCustomizationSchema),
    defaultValues: {
      name: profile?.name || "",
      userProfession: profile?.profession || "",
      customInstructions: profile?.customInstructions || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isLoading) return; // Prevents resetting form while loading
    if (!profile) return; // Prevents resetting form if profile is not available

    form.reset({
      name: profile.name || "",
      userProfession: profile.profession || "",
      customInstructions: profile.customInstructions || "",
    });
  }, [profile, isLoading, form]);

  function onSubmit(data: UserProfileCustomizationValues) {
    updateProfile({
      name: data.name,
      userProfession: data.userProfession,
      customInstructions: data.customInstructions,
    });
    // Here you would typically save the data to your backend
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-xl mt-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What should the AI call you?</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Captain, Friend, Your Name"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This name will be used by the AI when addressing you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userProfession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you do?</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Software Developer, Writer, Student"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Sharing your profession can help the AI tailor its responses.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Instructions for the AI</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Prefer concise answers. Explain complex topics simply."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide any other specific instructions for the AI.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <Button type="submit">Update</Button>
          {isUpdatePending && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          )}

          {isUpdateSuccess && (
            <CheckIcon className="h-4 w-4 stroke-2 stroke-primary" />
          )}
        </div>
      </form>
    </Form>
  );
}
