import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1, "Slug không được để trống")
  .max(200, "Slug tối đa 200 ký tự")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
  );

export function isMediaPath(value: string): boolean {
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

export const mediaPathSchema = z
  .string()
  .min(1, "Đường dẫn ảnh không được để trống")
  .max(2048)
  .refine(isMediaPath, "Phải là đường dẫn /... hoặc URL http(s)");

export const optionalMediaPathSchema = z
  .string()
  .max(2048)
  .optional()
  .refine(
    (val) => !val || val === "" || isMediaPath(val),
    "Ảnh phải là đường dẫn /... hoặc URL http(s)",
  );
