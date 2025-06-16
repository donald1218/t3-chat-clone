import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSpaces } from "@/lib/actions/space/list-spaces";
import { createSpace } from "../actions/space/create-space";

export const spaceKeys = {
  all: ["space"],
  lists: () => [...spaceKeys.all, "list"],
  detail: (id: string) => [...spaceKeys.all, "detail", id],
};

export const useSpace = (spaceId: string) => {
  return useQuery({
    queryKey: spaceKeys.detail(spaceId),
    queryFn: async () => {
      const { getSpace } = await import("../actions/space/get-space");
      return getSpace(spaceId);
    },
    enabled: !!spaceId,
  });
};

export const useSpaces = () => {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: listSpaces,
  });
};

export const useCreateSpace = () => {
  return useMutation({
    mutationKey: spaceKeys.lists(),
    mutationFn: ({ spaceName }: { spaceName: string }) => {
      return createSpace(spaceName);
    },
  });
};

export const useUpdateSpace = (spaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: spaceKeys.detail(spaceId),
    mutationFn: async ({
      spaceName,
      spacePrompt,
    }: {
      spaceName: string;
      spacePrompt?: string;
    }) => {
      const { updateSpace } = await import("../actions/space/update-space");
      return updateSpace(spaceId, spaceName, spacePrompt);
    },
    onSuccess: () => {
      // Invalidate the space detail query to refresh the data
      queryClient.invalidateQueries({ queryKey: spaceKeys.detail(spaceId) });
    },
  });
};
