import { useQuery } from "@tanstack/react-query";

export const useAvailableModels = () => {
  return useQuery({
    queryKey: ["availableModels"],
    queryFn: async () => {
      const { getAvailableModels } = await import(
        "@/lib/actions/model/get-available-models"
      );
      return getAvailableModels();
    },
  });
};
