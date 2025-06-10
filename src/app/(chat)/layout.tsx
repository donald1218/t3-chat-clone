import ThreadManager from "@/components/ThreadManager";
import Profile from "./profile";
import { QueryClient } from "@tanstack/react-query";
import { prefetchThreadQueries } from "@/lib/hooks/use-thread-queries";
import NewThreadButton from "./new-thread-btn";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  prefetchThreadQueries(queryClient);

  return (
    <div className="flex h-screen">
      {/* Sidebar for threads */}
      <div className="relative hidden md:flex w-64 flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
        <ThreadManager />

        <div className="absolute bottom-0 left-0 right-0 py-2 px-2 flex place-content-between">
          <Profile />
        </div>
      </div>

      {children}
    </div>
  );
}
