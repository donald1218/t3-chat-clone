import { z } from "zod";

// Define validation schema
const formSchema = z.object({
  inputField: z.string().min(1, "Please enter some text"),
});

type FormValues = z.infer<typeof formSchema>;

export { formSchema, type FormValues };
