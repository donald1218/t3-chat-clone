import dynamic from "next/dynamic";

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
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-gray-500">Thread ID is missing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen px-4">
      <main className="flex flex-col w-full h-full gap-[32px] pb-4 items-center justify-center">
        <Thread threadId={id} />
      </main>
    </div>
  );
}
