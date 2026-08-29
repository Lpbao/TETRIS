import { z } from "zod";

export const mediaUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title ảnh không được để trống")
    .max(200, "Title ảnh tối đa 200 ký tự"),
});

export const mediaQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
});

export type MediaUploadValues = z.infer<typeof mediaUploadSchema>;
