import { z } from "zod";

// Define validation schema
const formSchema = z.object({
  inputField: z.string().min(1, "Please enter some text"),
  model: z.string().min(1, "Please select a model"),
});

type FormValues = z.infer<typeof formSchema>;

export { formSchema, type FormValues };
