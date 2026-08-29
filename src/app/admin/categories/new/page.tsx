import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader
        title="Tạo category"
        description="Taxonomy bài đăng — Lưu trú, FNB, Showroom,…"
        action={
          <Link href="/admin/categories">
            <Button variant="outline">Quay lại</Button>
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <CategoryForm mode="create" />
        </CardContent>
      </Card>
    </>
  );
}
