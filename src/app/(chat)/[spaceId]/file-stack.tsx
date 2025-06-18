import { Button } from "@/components/ui/button";
import {
  X,
  Trash2,
  FileText,
  ImageIcon,
  FileType2,
  FileQuestion,
} from "lucide-react"; // Import Trash2 icon
import { motion, PanInfo } from "motion/react";
import { useState } from "react"; // Import useState
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FileStackProps {
  files: File[];
  onDeleteFile?: (fileName: string) => void;
}

interface FileBlockProps {
  file: File;
  onDeleteFile?: (fileName: string) => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-gray-700" />;
  }
  if (fileType === "application/pdf") {
    return <FileType2 className="h-8 w-8 text-red-700" />;
  }
  if (fileType.startsWith("text/")) {
    return <FileText className="h-8 w-8 text-blue-700" />;
  }
  return <FileQuestion className="h-8 w-8 text-gray-500" />;
};

function FileBlock({ file, onDeleteFile }: FileBlockProps) {
  const [isDraggingOverThreshold, setIsDraggingOverThreshold] = useState(false);
  const handleDelete = () => {
    onDeleteFile?.(file.name);
  };

  const dragThreshold = 60; // Adjust this value as needed

  const onDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      Math.abs(info.offset.x) > dragThreshold ||
      Math.abs(info.offset.y) > dragThreshold
    ) {
      setIsDraggingOverThreshold(true);
    } else {
      setIsDraggingOverThreshold(false);
    }
  };

  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      Math.abs(info.offset.x) > dragThreshold ||
      Math.abs(info.offset.y) > dragThreshold
    ) {
      handleDelete();
    }
    setIsDraggingOverThreshold(false); // Reset on drag end
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.5}
      onDrag={onDrag} // Add onDrag handler
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 1.05,
        zIndex: 10,
        boxShadow: "0px 8px 16px rgba(0,0,0,0.15)",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-between p-4 bg-gray-100 rounded-md relative group cursor-grab"
    >
      <div className="flex gap-2 items-center">
        {getFileIcon(file.type)}

        <div className="flex flex-col gap-1 items-start justify-between w-30">
          <span className="text-sm font-medium w-full truncate">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(file.size / 1024)} KB
          </span>
        </div>
      </div>

      {isDraggingOverThreshold && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute inset-0 flex items-center justify-center bg-destructive/40 backdrop-blur-sm rounded-md peer"
        >
          <Trash2 className="h-8 w-8 text-white" />
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -top-2 -right-2 peer-hover:hidden"
      >
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete} // Added onClick for the button as well for explicit delete
          className="h-6 w-6 p-0 rounded-full hover:cursor-pointer hidden group-hover:flex group-hover:animate-in fade-in zoom-in duration-200"
        >
          <X className="h-4 w-4 p-0" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function FileStack(props: FileStackProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        watchDrag: false,
      }}
    >
      <CarouselContent className="overflow-visible">
        {props.files.map((file) => (
          <CarouselItem key={file.name} className="basis-1/4">
            <FileBlock file={file} onDeleteFile={props.onDeleteFile} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="disabled:hidden h-14 p-4" />
      <CarouselNext className="disabled:hidden h-14 p-4" />
    </Carousel>
  );
}
