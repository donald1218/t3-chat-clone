import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKeys } from "./key";

export async function createClient() {
  const keys = await getSupabaseKeys();

  return createBrowserClient(keys.supabaseUrl, keys.supabaseAnonKey);
}
