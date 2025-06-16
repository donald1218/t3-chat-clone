import { redirect } from "next/navigation";

export default function DummyThreadPage() {
  // This is a dummy page to handle the thread route
  // It will be replaced by the actual thread page when the thread ID is available
  redirect("/");
}
