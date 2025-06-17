import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  getAvailableModelsGroupedByProvider,
  getModelById,
  modelProviderToName,
  ModelType,
} from "@/lib/models";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface ModelSelectProps {
  onModelChange: (model: string) => void;
  selectedModel?: string;
}

export default function ModelSelect({
  selectedModel,
  onModelChange,
}: ModelSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button variant="outline" role="combobox">
            {selectedModel
              ? getModelById(selectedModel.split(":")[1])?.name ??
                "Select model"
              : "Select model"}

            <ChevronsUpDown className="ml-1 h-4 w-4" />
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder="Search models..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {Object.entries(getAvailableModelsGroupedByProvider())
              .map(([provider, models]) => ({
                provider,
                models: (models as ModelType[]).filter((model: ModelType) =>
                  model.name.toLowerCase().includes(searchTerm.toLowerCase())
                ),
              }))
              .filter(({ models }) => models.length > 0)
              .map(({ provider, models }) => (
                <CommandGroup
                  key={provider}
                  heading={modelProviderToName(provider)}
                >
                  {(models as ModelType[]).map((model: ModelType) => (
                    <CommandItem
                      key={`${model.provider}:${model.id}`}
                      value={`${model.provider}:${model.id}`}
                      onSelect={() => {
                        onModelChange(`${model.provider}:${model.id}`);
                        setSearchTerm(""); // Clear search term after selection
                      }}
                    >
                      {model.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
