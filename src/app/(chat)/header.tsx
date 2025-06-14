import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ChatHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <SidebarTrigger />
    </header>
  );
}
