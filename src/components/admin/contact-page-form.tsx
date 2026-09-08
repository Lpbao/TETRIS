"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FieldError,
  SitePageFormFooter,
} from "@/components/admin/site-page-form-ui";
import { composeContactAddress } from "@/lib/contact-address";
import { putSitePage } from "@/lib/put-site-page";
import { VN_PROVINCES } from "@/lib/vn-provinces";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactPageFormSchema,
  type ContactPageContent,
  type ContactPageFormValues,
} from "@/lib/validations/site-page";
import { cn } from "@/lib/utils";

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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactPageFormValues>({
    resolver: zodResolver(contactPageFormSchema),
    defaultValues: {
      email: initialData.email,
      phone: initialData.phone,
      addressLine: initialData.addressLine,
      province: initialData.province,
    },
  });

  const addressLine = useWatch({ control, name: "addressLine" }) ?? "";
  const province = useWatch({ control, name: "province" }) ?? "";
  const previewAddress = useMemo(
    () => composeContactAddress(addressLine, province),
    [addressLine, province],
  );

  const onSubmit = async (data: ContactPageFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: ContactPageContent = {
        ...data,
        address: composeContactAddress(data.addressLine, data.province),
      };
      await putSitePage("contact", payload);
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
        <Label htmlFor="contact-address-line">
          Địa chỉ chi tiết (số nhà, đường, ngõ, phường/xã…)
        </Label>
        <Textarea
          id="contact-address-line"
          rows={3}
          placeholder="Số 31 Ngõ 135 Đội Cấn, Ba Đình"
          {...register("addressLine")}
        />
        <FieldError message={errors.addressLine?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-province">Tỉnh / Thành phố</Label>
        <select
          id="contact-province"
          className={cn(
            "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...register("province")}
        >
          <option value="">— Chọn tỉnh / thành phố —</option>
          {VN_PROVINCES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <FieldError message={errors.province?.message} />
        <p className="text-muted-foreground text-xs">
          Chỉ Việt Nam — 34 tỉnh/TP (sau sắp xếp 2025). Không dùng autocomplete
          trả phí.
        </p>
      </div>

      {previewAddress ? (
        <div className="bg-muted/40 space-y-1 rounded-md border px-3 py-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Địa chỉ hiển thị trên site / map
          </p>
          <p className="text-sm">{previewAddress}</p>
        </div>
      ) : null}

      <SitePageFormFooter
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />
    </form>
  );
}
