import { listSpaces } from "@/lib/actions/space/list-spaces";
import { CreateSpaceForm } from "./space-form";
import { redirect } from "next/navigation";

export default async function Home() {
  const spaces = await listSpaces();

  if (spaces.length > 0) {
    redirect(`/${spaces[0].id}`);
  }

  return (
    <div className="flex flex-col gap-4 items-stretch justify-center min-h-screen p-4 max-w-[400px] mx-auto">
      <h1 className="font-bold text-2xl text-gray-600">
        Let&apos;s create your first space
      </h1>

      <CreateSpaceForm />
    </div>
  );
}
