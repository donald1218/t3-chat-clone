import { useQuery } from "@tanstack/react-query";
import { getUsage } from "../actions/usage/get-usage";

export const useUsageQueries = (threadId?: string, messageId?: string) => {
  return useQuery({
    queryKey: ["usage", threadId, messageId],
    queryFn: () => {
      if (!threadId) return null;
      if (!messageId) return null;
      return getUsage(threadId, messageId);
    },
    enabled: !!threadId && !!messageId,
  });
};
