"use client";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function SignOutPage() {
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.signOut();

    redirect("/login");
  });

  return <p>Signing out...</p>;
}
