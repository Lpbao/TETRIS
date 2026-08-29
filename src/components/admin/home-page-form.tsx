"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import {
  FieldError,
  SitePageFormFooter,
} from "@/components/admin/site-page-form-ui";
import { putSitePage } from "@/lib/put-site-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  homePageSchema,
  type HomePageContent,
} from "@/lib/validations/site-page";

const emptySlide = {
  image: "",
  title: "",
  location: "",
  href: "/projects",
};

export function HomePageForm({
  initialData,
}: {
  initialData: HomePageContent;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HomePageContent>({
    resolver: zodResolver(homePageSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "slides",
  });

  const onSubmit = async (data: HomePageContent) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await putSitePage("home", data);
      setSuccess("Đã lưu slider trang chủ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Slide {index + 1}</p>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label="Lên"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Xuống"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
                aria-label="Xóa slide"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CoverImagePicker
            label="Ảnh slider"
            description="Chọn ảnh từ Media"
            value={watch(`slides.${index}.image`)}
            onChange={(url) =>
              setValue(`slides.${index}.image`, url, { shouldValidate: true })
            }
          />
          <FieldError message={errors.slides?.[index]?.image?.message} />

          <div className="space-y-2">
            <Label htmlFor={`slide-title-${index}`}>Tiêu đề</Label>
            <Input
              id={`slide-title-${index}`}
              {...register(`slides.${index}.title`)}
            />
            <FieldError message={errors.slides?.[index]?.title?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`slide-location-${index}`}>Địa điểm</Label>
            <Input
              id={`slide-location-${index}`}
              {...register(`slides.${index}.location`)}
            />
            <FieldError message={errors.slides?.[index]?.location?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`slide-href-${index}`}>Link</Label>
            <Input
              id={`slide-href-${index}`}
              placeholder="/projects/d-chic"
              {...register(`slides.${index}.href`)}
            />
            <FieldError message={errors.slides?.[index]?.href?.message} />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append(emptySlide)}
      >
        <Plus className="h-4 w-4" />
        Thêm slide
      </Button>
      <FieldError message={errors.slides?.message} />

      <SitePageFormFooter
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />
    </form>
  );
}
