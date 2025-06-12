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
// import { toast } from '@/components/ui/use-toast' // Assuming you have a toast component

const userProfileCustomizationSchema = z.object({
  aiName: z
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

// This can come from your database or context
const defaultValues: Partial<UserProfileCustomizationValues> = {
  // aiName: "Buddy",
  // userProfession: "Software Engineer",
  // customInstructions: "Respond in a friendly and helpful manner."
};

export default function AccountTab() {
  const form = useForm<UserProfileCustomizationValues>({
    resolver: zodResolver(userProfileCustomizationSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: UserProfileCustomizationValues) {
    // toast({ // Assuming you have a toast component
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // })
    console.log("Customization data submitted:", data);
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
          name="aiName"
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
        <Button type="submit">Update Customization</Button>
      </form>
    </Form>
  );
}
