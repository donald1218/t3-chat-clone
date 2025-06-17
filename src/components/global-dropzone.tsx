"use client";

import { useCallback, useState, useEffect } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";

export function GlobalDropzone({
  accept = { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
  onFileAccepted,
}: {
  accept?: Accept;
  onFileAccepted: (file: File[]) => void;
}) {
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles);
      }
      setIsDraggingOverWindow(false); // Ensure this is reset on drop
    },
    [onFileAccepted]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept,
    onDropRejected: (rejectedFiles) => {
      toast("Some files are not supported", {
        description: rejectedFiles.map((file) => file.file.name).join(", "),
      });
    },
  });

  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      if (
        event.dataTransfer &&
        Array.from(event.dataTransfer.types).includes("Files")
      ) {
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      // relatedTarget is null when leaving the window
      if (event.relatedTarget === null) {
        setIsDraggingOverWindow(false);
      }
    };

    const handleDropGlobal = () => {
      // This handles the case where the drop happens outside the dropzone but still in the window
      setIsDraggingOverWindow(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDropGlobal); // Listen to global drop as well

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDropGlobal);
    };
  }, []);

  const shouldShowDropzone = isDraggingOverWindow || isDragActive;

  return (
    <div
      {...getRootProps()}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/30 backdrop-blur-xs bg-opacity-50 transition-opacity duration-300 ${
        shouldShowDropzone ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* <input {...getInputProps()} /> */}
      {/* The input is part of getRootProps, no need to render it separately if it's causing issues or not needed for the visual design. */}
      {/* If you specifically need a visible input element, it should be styled and positioned appropriately. */}
      <UploadCloudIcon className="h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-lg text-muted-foreground">Drop to upload</p>
    </div>
  );
}
