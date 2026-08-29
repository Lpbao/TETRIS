"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FieldError } from "@/components/admin/site-page-form-ui";
import {
  categorySchema,
  type CategoryFormValues,
} from "@/lib/validations/category";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormProps {
  initialData?: CategoryFormValues & { id?: string };
  mode: "create" | "edit";
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ?? {
      name: "",
      slug: "",
      sortOrder: 0,
    },
  });

  const name = watch("name");

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/categories"
          : `/api/categories/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        const details =
          result.details?.fieldErrors &&
          Object.entries(result.details.fieldErrors as Record<string, string[]>)
            .map(([k, v]) => `${k}: ${v?.join(", ")}`)
            .join("; ");
        throw new Error(details || result.error || "Something went wrong");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Tên</Label>
        <Input
          id="name"
          placeholder="VD: LƯU TRÚ"
          {...register("name")}
          onBlur={() => {
            const currentSlug = watch("slug");
            if (!currentSlug && name) {
              setValue("slug", slugify(name), { shouldValidate: true });
            }
          }}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="luu-tru" {...register("slug")} />
        <FieldError message={errors.slug?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Thứ tự</Label>
        <Input
          id="sortOrder"
          type="number"
          min={0}
          step={1}
          {...register("sortOrder", { valueAsNumber: true })}
        />
        <FieldError message={errors.sortOrder?.message} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Tạo category" : "Cập nhật"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
