import { QueryClient } from "@tanstack/react-query";
import { prefetchThreadQueries } from "@/lib/hooks/use-thread-queries";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "./sidebar";
import ChatHeader from "./header";

export default async function ChatLayout({
  params,
  children,
  customization,
}: {
  params: Promise<{ spaceId: string }>;
  children: React.ReactNode;
  customization: React.ReactNode;
}) {
  const { spaceId } = await params;

  const queryClient = new QueryClient();
  prefetchThreadQueries(queryClient);

  return (
    <SidebarProvider>
      <ChatSidebar spaceId={spaceId} />

      <SidebarInset className="h-screen mx-2">
        <ChatHeader />

        <main className="px-4 flex flex-col w-full h-full gap-[32px] pb-4 items-center justify-center">
          {children}
        </main>
        {customization}
      </SidebarInset>
    </SidebarProvider>
  );
}
