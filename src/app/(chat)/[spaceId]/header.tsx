"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";

export default function ChatHeader() {
  return (
    <header className="flex items-center justify-between absolute top-2 h-12 px-2 rounded-xl border border-sidebar-border bg-sidebar w-full z-50">
      <div className="flex items-center gap-1">
        <SidebarTrigger />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
