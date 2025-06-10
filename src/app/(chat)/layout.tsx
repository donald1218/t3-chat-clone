import ThreadManager from "@/components/ThreadManager";
import Profile from "./profile";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar for threads */}
      <div className="relative hidden md:flex w-64 flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
        <ThreadManager />

        <div className="absolute bottom-0 left-0 right-0 py-2 px-1">
          <Profile />
        </div>
      </div>

      {children}
    </div>
  );
}
