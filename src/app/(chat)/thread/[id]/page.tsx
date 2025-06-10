import { getThread } from "@/app/thread-actions";
import Thread from "./thread";
import { QueryClient } from "@tanstack/react-query";
import { prefetchThreadQuery } from "@/lib/hooks/use-thread-queries";

interface ThreadPageParams {
  id: string;
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<ThreadPageParams>;
}) {
  const { id } = await params; // Await the promise to get threadId

  const queryClient = new QueryClient();
  prefetchThreadQuery(queryClient, id);

  if (!id) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-gray-500">Thread ID is missing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen p-4">
      <main className="flex flex-col w-full min-h-screen gap-[32px] items-center justify-center">
        <Thread threadId={id} />
      </main>
    </div>
  );
}
