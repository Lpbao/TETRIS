import { z } from "zod";
import { slugSchema } from "@/lib/validations/shared";

export const categorySchema = z.object({
  name: z.string().min(1, "Tên category không được để trống").max(100),
  slug: slugSchema,
  sortOrder: z.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
