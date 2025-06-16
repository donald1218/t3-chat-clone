import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { getProfile } = await import("@/lib/actions/account/get-profile");
      return getProfile();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      userProfession?: string;
      customInstructions?: string;
    }) => {
      const { updateProfile } = await import(
        "@/lib/actions/account/update-profile"
      );
      return updateProfile(
        data.name,
        data.userProfession,
        data.customInstructions
      );
    },
    onSuccess: () => {
      // Optionally, you can invalidate the profile query to refetch the updated profile
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
