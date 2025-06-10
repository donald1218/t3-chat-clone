"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import {
  useCreateThread,
  useDeleteThread,
  useThreads,
} from "@/lib/hooks/use-thread-queries";
import { Thread } from "@/db/schema";
import { TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";

export default function ThreadManager() {
  const router = useRouter();

  const segment = useSelectedLayoutSegments();
  let currentThreadId = undefined;
  if (segment.length > 0 && segment[0] === "thread") {
    // If we're in a thread context, we don't show the thread manager
    currentThreadId = segment[1];
  }

  // Use TanStack Query to fetch threads
  const { data: threads = [], isLoading, refetch } = useThreads();

  // Use mutation hook for creating threads
  const createThreadMutation = useCreateThread();
  const deleteThreadMutation = useDeleteThread();

  // Function to create a new thread
  const handleCreateNewThread = async () => {
    try {
      const newThread = await createThreadMutation.mutateAsync();

      router.push(`/thread/${newThread.id}`);
    } catch (error) {
      console.error("Failed to create new thread:", error);
    }
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
            <Link
              key={thread.id}
              href={`/thread/${thread.id}`}
              shallow
              prefetch
              className={`group flex items-center w-full min-w-0 h-auto py-2 px-4 rounded-lg ${
                currentThreadId === thread.id
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              <div className="flex flex-col items-start grow min-w-0">
                <span className="text-sm font-medium max-w-full truncate">
                  {getThreadDisplayTitle(thread)}
                </span>
                <span className="text-xs opacity-70">
                  {formatDate(thread.updatedAt)}
                </span>
              </div>

              <div className="hidden group-hover:block">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-6 w-6 p-0 ${
                    currentThreadId === thread.id ? "" : "hover:bg-red-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent button click from triggering thread switch
                    e.nativeEvent.preventDefault();

                    deleteThreadMutation.mutate(thread.id, {
                      onSuccess: () => {
                        if (currentThreadId === thread.id) {
                          router.push("/"); // Ensure we don't stay on the deleted thread
                        }
                      },
                    });
                  }}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
