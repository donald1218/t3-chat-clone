"use server";

import { getLLMResponse } from "../lib/langchain";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// This is our server action that will process the form data
export async function processInput(input: {
  inputField: string;
  model: string;
}) {
  try {
    // Send the input to LLM using LangChain
    const llmResponse = await getLLMResponse(input.inputField, input.model);

    // Return the LLM response
    return {
      success: true,
      message: "LLM processing complete",
      data: input.inputField,
      modelUsed: input.model,
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
