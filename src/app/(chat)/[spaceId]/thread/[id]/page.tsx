import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { getThread } from "@/lib/actions/thread/get-thread";

const Thread = dynamic(() => import("./thread"));

interface ThreadPageParams {
  id: string;
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<ThreadPageParams>;
}) {
  const { id } = await params; // Await the promise to get threadId

  if (!id) {
    redirect("/");
  }

  const thread = await getThread(id);

  return <Thread threadId={id} initialMessages={thread.messages} />;
}
