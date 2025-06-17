import { GlobalDropzone } from "@/components/global-dropzone";
import FileStack from "./file-stack";
import InputForm from "./input-form";
import { FormValues } from "./input-form.schema";
import { useRef, useState } from "react";

interface UserInputProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting?: boolean; // Optional prop to control external submission
}

export default function UserInput(props: UserInputProps) {
  const uploadedFile = useRef<Map<string, File>>(new Map());
  const [fileStack, setFileStack] = useState<File[]>([]);

  const handleFileAccepted = (files: File[]) => {
    // Handle the accepted files, e.g., upload them or pass them to another component
    files.forEach((file) => {
      uploadedFile.current.set(file.name, file);
    });
    setFileStack(Array.from(uploadedFile.current.values()));
  };

  const handleFileDelete = (fileName: string) => {
    // Remove the file from the uploadedFile map and update the state
    uploadedFile.current.delete(fileName);
    setFileStack(Array.from(uploadedFile.current.values()));
  };

  // TODO: Handle file upload on submission
  return (
    <>
      <div className="sticky bottom-4 w-full max-w-3xl mx-auto flex flex-col gap-2">
        <FileStack files={fileStack} onDeleteFile={handleFileDelete} />
        <InputForm
          onSubmit={props.onSubmit}
          externalSubmitting={props.isSubmitting}
        />
      </div>

      <GlobalDropzone onFileAccepted={handleFileAccepted} />
    </>
  );
}
