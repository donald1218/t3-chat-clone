import { z } from "zod";

export const spaceFormSchema = z.object({
  name: z.string().min(1, "Space name is required"),
  prompt: z.string().optional(),
});

export type SpaceFormValues = z.infer<typeof spaceFormSchema>;
