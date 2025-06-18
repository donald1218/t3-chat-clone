import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseKeys } from "./key";

export async function createClient() {
  const keys = await getSupabaseKeys();
  const cookieStore = await cookies();

  return createServerClient(keys.supabaseUrl, keys.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
