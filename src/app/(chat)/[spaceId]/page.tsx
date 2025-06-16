import { createThreadWithoutInput } from "@/app/thread-actions";
import { redirect } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;

  const newThread = await createThreadWithoutInput(spaceId);

  redirect(`/${spaceId}/thread/${newThread.id}`);
}
