import { QueryClient } from "@tanstack/react-query";
import { prefetchThreadQueries } from "@/lib/hooks/use-thread-queries";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "./sidebar";
import ChatHeader from "./header";

export default async function ChatLayout({
  children,
  customization,
}: {
  children: React.ReactNode;
  customization: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  prefetchThreadQueries(queryClient);

  return (
    <SidebarProvider>
      <ChatSidebar />

      <SidebarInset>
        <ChatHeader />

        {children}
        {customization}
      </SidebarInset>
    </SidebarProvider>
  );
}
