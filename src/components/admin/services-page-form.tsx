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
import { Textarea } from "@/components/ui/textarea";
import {
  servicesPageSchema,
  type ServicesPageFormValues,
} from "@/lib/validations/site-page";

const emptyService = {
  title: "",
  description: "",
  image: "",
  imageAlt: "",
};

export function ServicesPageForm({
  initialData,
}: {
  initialData: ServicesPageFormValues;
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
  } = useForm<ServicesPageFormValues>({
    resolver: zodResolver(servicesPageSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: ServicesPageFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await putSitePage("services", data);
      setSuccess("Đã lưu nội dung dịch vụ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Chưa có dịch vụ trên database. Thêm khối, chọn ảnh từ Media, rồi lưu.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Dịch vụ {index + 1}</p>
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
                onClick={() => remove(index)}
                aria-label="Xóa dịch vụ"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CoverImagePicker
            label="Ảnh"
            description="Chọn ảnh từ Media"
            value={watch(`items.${index}.image`)}
            onChange={(url) =>
              setValue(`items.${index}.image`, url, { shouldValidate: true })
            }
          />
          <FieldError message={errors.items?.[index]?.image?.message} />

          <div className="space-y-2">
            <Label htmlFor={`service-title-${index}`}>Tiêu đề</Label>
            <Input
              id={`service-title-${index}`}
              {...register(`items.${index}.title`)}
            />
            <FieldError message={errors.items?.[index]?.title?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`service-alt-${index}`}>Alt ảnh</Label>
            <Input
              id={`service-alt-${index}`}
              {...register(`items.${index}.imageAlt`)}
            />
            <FieldError message={errors.items?.[index]?.imageAlt?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`service-desc-${index}`}>Mô tả</Label>
            <Textarea
              id={`service-desc-${index}`}
              rows={4}
              {...register(`items.${index}.description`)}
            />
            <FieldError
              message={errors.items?.[index]?.description?.message}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append(emptyService)}
      >
        <Plus className="h-4 w-4" />
        Thêm dịch vụ
      </Button>
      <FieldError message={errors.items?.message} />

      <SitePageFormFooter
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />
    </form>
  );
}
