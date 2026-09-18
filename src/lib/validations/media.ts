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

export const mediaPrepareSchema = z.object({
  title: mediaTitleSchema,
  filename: z
    .string()
    .trim()
    .min(1, "Thiếu tên file")
    .max(255, "Tên file tối đa 255 ký tự"),
  mimeType: z
    .string()
    .trim()
    .min(1, "Thiếu mime type")
    .max(100, "Mime type không hợp lệ"),
  size: z.coerce
    .number()
    .int()
    .positive("Kích thước file không hợp lệ")
    .max(100 * 1024 * 1024, "File vượt giới hạn cho phép"),
});

export const mediaCompleteSchema = z.object({
  title: mediaTitleSchema,
  path: z
    .string()
    .trim()
    .min(1, "Thiếu path upload")
    .max(400, "Path không hợp lệ"),
  filename: z
    .string()
    .trim()
    .min(1, "Thiếu tên file")
    .max(255, "Tên file tối đa 255 ký tự"),
  mimeType: z
    .string()
    .trim()
    .min(1, "Thiếu mime type")
    .max(100, "Mime type không hợp lệ"),
  size: z.coerce
    .number()
    .int()
    .positive("Kích thước file không hợp lệ")
    .max(100 * 1024 * 1024, "File vượt giới hạn cho phép"),
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
export type MediaPrepareValues = z.infer<typeof mediaPrepareSchema>;
export type MediaCompleteValues = z.infer<typeof mediaCompleteSchema>;
export type MediaQueryValues = z.infer<typeof mediaQuerySchema>;
