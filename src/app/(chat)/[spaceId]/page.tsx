import NewThreadPage from "./new-thread";

export default async function Home({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;

  return <NewThreadPage spaceId={spaceId} />;
}
