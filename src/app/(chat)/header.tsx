import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ChatHeader() {
  return (
    <header className="flex items-center justify-between absolute top-2 h-12 px-2 rounded-xl border border-sidebar-border bg-sidebar w-full z-50">
      <SidebarTrigger />
    </header>
  );
}
