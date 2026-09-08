import { z } from "zod";
import {
  mediaPathSchema,
  optionalMediaPathSchema,
} from "@/lib/validations/shared";

const optionalSlugSchema = z
  .string()
  .max(200, "Slug tối đa 200 ký tự")
  .refine(
    (val) => val === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
    "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  );

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  slug: optionalSlugSchema,
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(200, "Địa chỉ tối đa 200 ký tự"),
  concept: z
    .string()
    .min(1, "Concept không được để trống")
    .max(100, "Concept tối đa 100 ký tự"),
  categoryId: z.string().min(1, "Chọn category"),
  description: z.string().min(1, "Mô tả không được để trống"),
  coverImage: optionalMediaPathSchema,
  /** Không dùng `.default([])` — lệch input/output làm `zodResolver` + RHF lỗi type. */
  images: z.array(mediaPathSchema),
  published: z.boolean(),
});

export type PostFormValues = z.infer<typeof postSchema>;
