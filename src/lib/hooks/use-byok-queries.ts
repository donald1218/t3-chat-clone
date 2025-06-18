import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserKeys } from "../actions/byok/get-user-keys";
import { BYOKConfig, LLMProvider } from "../types";
import { addUserKey } from "../actions/byok/add-user-keys";
import { useCurrentUserId } from "./use-current-user-id";

export const byokKeys = {
  all: ["byokKeys"],
  user: (userId: string) => [...byokKeys.all, userId],
  detail: (userId: string) => [...byokKeys.user(userId), "detail"],
};

export const useByokUserKeys = () => {
  const userId = useCurrentUserId();

  return useQuery({
    queryKey: byokKeys.user(userId),
    queryFn: () => getUserKeys(userId),
    enabled: !!userId, // Only run the query if we have a userId
  });
};

export const useAddByokUserKeys = () => {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: byokKeys.detail(userId),
    mutationFn: ({
      provider,
      config,
    }: {
      provider: LLMProvider;
      config: BYOKConfig;
    }) => addUserKey(userId, provider, config),

    onSettled: () => {
      // Invalidate the user keys query to refresh the data
      queryClient.invalidateQueries({
        queryKey: byokKeys.user(userId),
      });
      queryClient.invalidateQueries({ queryKey: ["availableModels"] });
    },
  });
};
