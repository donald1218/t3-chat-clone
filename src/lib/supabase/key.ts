"use server";

export async function getSupabaseKeys() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL or Anon Key is not defined in environment variables."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
