"use client";

import { ArrowUp, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formSchema, FormValues } from "./input-form.schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  getAvailableModelsGroupedByProvider,
  getModelById,
  modelProviderToName,
  ModelType,
} from "@/lib/models";
import { useAtom } from "jotai/react";
import { modelSelectionAtom } from "@/lib/store/model-selection";
import { useEffect, useState } from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";

interface InputFormProps {
  onSubmit: (input: FormValues) => Promise<void>;
  externalSubmitting?: boolean; // Optional prop to control external submission
}

export default function InputForm(props: InputFormProps) {
  const [selectedModel, setSelectedModel] = useAtom(modelSelectionAtom);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize the form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputField: "",
      model: selectedModel, // Default model
    },
  });

  useEffect(() => {
    // Set the default model from the atom when the component mounts
    form.setValue("model", selectedModel);
  }, [selectedModel, form]);

  const onModelChange = (value: string) => {
    if (!value) {
      console.warn("No model selected");
      return;
    }

    // Update the model in the form state
    form.setValue("model", value);

    setSelectedModel(value); // Update the atom state
  };

  const onSubmit = async (data: FormValues) => {
    const modelValue = form.getValues("model");

    try {
      await props.onSubmit({
        inputField: data.inputField,
        model: modelValue,
      });

      form.resetField("inputField");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="inputField"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col rounded-sm border overflow-hidden pb-1 p-2 max-h-[300px] bg-white">
                <Textarea
                  {...field}
                  disabled={
                    form.formState.isSubmitting || props.externalSubmitting
                  }
                  placeholder="Type here..."
                  className="border-0 shadow-none px-1 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-y-auto min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />

                <div className="flex items-center justify-end w-full pt-2 gap-2">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" role="combobox">
                                {field.value
                                  ? getModelById(field.value.split(":")[1])
                                      ?.name ?? "Select model"
                                  : "Select model"}

                                <ChevronsUpDown className="ml-1 h-4 w-4" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>

                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search models..."
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No models found.</CommandEmpty>
                                {Object.entries(
                                  getAvailableModelsGroupedByProvider()
                                )
                                  .map(([provider, models]) => ({
                                    provider,
                                    models: (models as ModelType[]).filter(
                                      (model: ModelType) =>
                                        model.name
                                          .toLowerCase()
                                          .includes(searchTerm.toLowerCase())
                                    ),
                                  }))
                                  .filter(({ models }) => models.length > 0)
                                  .map(({ provider, models }) => (
                                    <CommandGroup
                                      key={provider}
                                      heading={modelProviderToName(provider)}
                                    >
                                      {(models as ModelType[]).map(
                                        (model: ModelType) => (
                                          <CommandItem
                                            key={`${model.provider}:${model.id}`}
                                            value={`${model.provider}:${model.id}`}
                                            onSelect={() => {
                                              onModelChange(
                                                `${model.provider}:${model.id}`
                                              );
                                              setSearchTerm(""); // Clear search term after selection
                                            }}
                                          >
                                            {model.name}
                                          </CommandItem>
                                        )
                                      )}
                                    </CommandGroup>
                                  ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    disabled={
                      form.formState.isSubmitting || props.externalSubmitting
                    }
                  >
                    {form.formState.isSubmitting || props.externalSubmitting ? (
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
