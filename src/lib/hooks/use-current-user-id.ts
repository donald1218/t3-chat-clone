import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export const useCurrentUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const client = await createClient();
      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error(error);
      }

      setUserId(data.session?.user.id ?? "Guest");
    };

    fetchUserId();
  }, []);

  return userId ?? "Guest";
};
