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
import { useAvailableModels } from "@/lib/hooks/use-model-queries";
import {
  getModelById,
  groupModelsByProvider,
  modelProviderToName,
  ModelType,
} from "@/lib/models";
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
  const { data: availableModels } = useAvailableModels();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            className="hover:bg-accent/30"
          >
            {selectedModel
              ? getModelById(selectedModel)?.name ?? "Select model"
              : "Select model"}
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
            {Object.entries(groupModelsByProvider(availableModels || []))
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
                      key={model.id}
                      value={model.id}
                      onSelect={() => {
                        onModelChange(model.id);
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
