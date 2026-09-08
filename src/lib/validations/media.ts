import { z } from "zod";

export const mediaTitleSchema = z
  .string()
  .trim()
  .min(1, "Title ảnh không được để trống")
  .max(200, "Title ảnh tối đa 200 ký tự");

export const mediaUploadSchema = z.object({
  title: mediaTitleSchema,
});

export const mediaTitlesCheckSchema = z.object({
  titles: z.array(mediaTitleSchema).min(1, "Cần ít nhất một title"),
});

export const MEDIA_PAGE_SIZE = 24;

export const mediaQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  cursor: z.string().trim().min(1).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(MEDIA_PAGE_SIZE),
  type: z.enum(["image", "video"]).optional(),
});

export type MediaUploadValues = z.infer<typeof mediaUploadSchema>;
export type MediaTitlesCheckValues = z.infer<typeof mediaTitlesCheckSchema>;
export type MediaQueryValues = z.infer<typeof mediaQuerySchema>;
