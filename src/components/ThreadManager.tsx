"use client";

import { useLocalThreadStore } from "@/lib/hooks/use-thread-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useCreateThread, useThreads } from "@/lib/hooks/use-thread-queries";
import { Thread } from "@/db/schema";
import { Message } from "@/lib/thread-store";
import { useEffect } from "react";

export default function ThreadManager() {
  const threadId = useLocalThreadStore((state) => state.threadId);
  const setThreadId = useLocalThreadStore((state) => state.setThreadId);
  const initializeThread = useLocalThreadStore(
    (state) => state.initializeThread
  );

  // Initialize thread on component mount
  useEffect(() => {
    initializeThread();
  }, [initializeThread]);

  // Use TanStack Query to fetch threads
  const { data: threads = [], isLoading, refetch } = useThreads();

  // Use mutation hook for creating threads
  const createThreadMutation = useCreateThread();

  // Function to create a new thread
  const handleCreateNewThread = async () => {
    try {
      const newThread = await createThreadMutation.mutateAsync();
      if (newThread) {
        // Store new thread ID in localStorage and update the store
        localStorage.setItem("current-thread-id", newThread.id);
        setThreadId(newThread.id);
      }
    } catch (error) {
      console.error("Failed to create new thread:", error);
    }
  };

  // Function to switch to an existing thread
  const switchToThread = (id: string) => {
    localStorage.setItem("current-thread-id", id);
    setThreadId(id);
  };

  // Format date for display
  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return "Unknown date";

    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Function to get thread display title
  const getThreadDisplayTitle = (thread: Thread) => {
    return thread.title;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Your Threads</h2>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            className="h-8 w-8 p-0"
            title="Refresh threads"
            disabled={isLoading}
          >
            <IconRefresh className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCreateNewThread}
            disabled={createThreadMutation.isPending}
          >
            <IconPlus className="mr-1 h-4 w-4" />
            New Thread
          </Button>
        </div>
      </div>

      <Separator className="my-2" />

      {isLoading ? (
        <div className="text-center py-4 text-sm text-gray-500">
          Loading threads...
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-4 text-sm text-gray-500">
          No threads yet. Create your first thread to get started!
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {threads.map((thread) => (
            <Button
              key={thread.id}
              variant={threadId === thread.id ? "default" : "ghost"}
              className={`w-full justify-start text-left h-auto py-2 ${
                threadId === thread.id
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              onClick={() => switchToThread(thread.id)}
            >
              <div className="flex flex-col items-start w-full">
                <span className="text-sm font-medium w-full truncate">
                  {getThreadDisplayTitle(thread)}
                </span>
                <span className="text-xs opacity-70">
                  {formatDate(thread.updatedAt)}
                </span>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
