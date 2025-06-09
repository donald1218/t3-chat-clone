"use server";

import { z } from "zod";
import { getLLMResponse } from "../lib/langchain";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Define a schema for input validation
const FormSchema = z.string().min(1, "Input is required");

// This is our server action that will process the form data
export async function processInput(input: string) {
  // Validate the input
  const validatedInput = FormSchema.safeParse(input);

  // If validation fails, return an error
  if (!validatedInput.success) {
    return {
      success: false,
      errors: validatedInput.error.flatten().fieldErrors,
    };
  }

  try {
    // Get the validated input
    const input = validatedInput.data;

    // Send the input to LLM using LangChain
    const llmResponse = await getLLMResponse(input);

    // Return the LLM response
    return {
      success: true,
      message: "LLM processing complete",
      data: input,
      llmResponse: llmResponse.text || llmResponse.content,
    };
  } catch (error) {
    console.error("Error processing with LLM:", error);
    return {
      success: false,
      message: "Failed to process input with LLM",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}
