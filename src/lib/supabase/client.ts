import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKeysAction } from "./key";

export async function createClient() {
  const keys = await getSupabaseKeysAction();

  return createBrowserClient(keys.supabaseUrl, keys.supabaseAnonKey);
}
