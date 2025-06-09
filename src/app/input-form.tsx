"use client";

import { ArrowUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formSchema, FormValues } from "./input-form.schema";

interface InputFormProps {
  onSubmit: (input: FormValues) => Promise<void>;
}

export default function InputForm(props: InputFormProps) {
  // Initialize the form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputField: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    form.resetField("inputField");

    try {
      await props.onSubmit(data);
    } catch (error) {
      console.error("Error during form submission:", error);
      // Optionally handle error state here, e.g., show a toast notification

      // Reset the form state
      form.setError("inputField", {
        type: "manual",
        message: "Failed to submit. Please try again.",
      });
      form.setValue("inputField", data.inputField);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(props.onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="inputField"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col rounded-sm border overflow-hidden pb-1 p-2 max-h-[300px] bg-white">
                <Textarea
                  {...field}
                  placeholder="Type here..."
                  className="border-0 shadow-none px-1 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-y-auto min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />

                <div className="flex items-center justify-end w-full">
                  {/* <Select>
                    <SelectTrigger className="border-0 shadow-none">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select> */}

                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
