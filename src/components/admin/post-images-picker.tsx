"use client";

import { MediaMultiImagePicker } from "@/components/admin/media-multi-image-picker";

interface PostImagesPickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PostImagesPicker({ value, onChange }: PostImagesPickerProps) {
  return (
    <MediaMultiImagePicker
      value={value}
      onChange={onChange}
      label="Ảnh gallery"
      description="Chọn nhiều ảnh từ Media — hiển thị trên trang chi tiết dự án"
      emptyText="Chưa chọn ảnh gallery"
      buttonText="Chọn ảnh gallery từ Media"
    />
  );
}
