"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FieldError,
  SitePageFormFooter,
} from "@/components/admin/site-page-form-ui";
import { putSitePage } from "@/lib/put-site-page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactPageSchema,
  type ContactPageContent,
} from "@/lib/validations/site-page";

export function ContactPageForm({
  initialData,
}: {
  initialData: ContactPageContent;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactPageContent>({
    resolver: zodResolver(contactPageSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ContactPageContent) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await putSitePage("contact", data);
      setSuccess("Đã lưu thông tin liên hệ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" type="email" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">Số điện thoại</Label>
        <Input id="contact-phone" {...register("phone")} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-address">Địa chỉ</Label>
        <Textarea id="contact-address" rows={3} {...register("address")} />
        <FieldError message={errors.address?.message} />
      </div>

      <SitePageFormFooter
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />
    </form>
  );
}
