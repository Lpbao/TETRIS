import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title="Chỉnh sửa category"
        description={category.name}
        action={
          <Link href="/admin/categories">
            <Button variant="outline">Quay lại</Button>
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <CategoryForm
            mode="edit"
            initialData={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              sortOrder: category.sortOrder,
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
