"use client";

import { Button } from "@/components/ui/button";
import { createThread } from "../thread-actions";
import { PlusIcon } from "lucide-react";

export default function NewThreadButton() {
  const handleNewThread = () => {
    createThread({ redirectAfterCreate: true });
  };

  return (
    <div>
      <Button
        onClick={handleNewThread}
        variant="outline"
        className="rounded-full group transition-all overflow-hidden w-[32px] h-[32px] hover:w-[140px] flex"
      >
        <PlusIcon className="top-2 bottom-2 left-2 right-2 h-4 w-4 translate-x-1 group-hover:translate-none" />
        <span className="new-thread-text whitespace-nowrap w-0 translate-x-0.5 group-hover:translate-none group-hover:w-auto">
          New Thread
        </span>
      </Button>
    </div>
  );
}
