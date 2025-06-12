import {
  DialogContent,
  DialogOverlay,
  DialogRoute,
} from "@/components/ui/dialog";
import React from "react";

export default function CusomizationLayout({
  children,
}: {
  account: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DialogRoute>
      <DialogOverlay className="bg-white/30 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 fixed inset-0 z-50" />

      <DialogContent className="drop-shadow-none shadow-none outline-0 border-0 bg-transparent">
        {children}
      </DialogContent>
    </DialogRoute>
  );
}
