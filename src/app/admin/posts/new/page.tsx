import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    return [];
  }
}

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <>
      <AdminPageHeader
        title="Tạo bài đăng"
        description="Dự án — title, địa chỉ, concept, category, mô tả"
        action={
          <Link href="/admin/posts">
            <Button variant="outline">Quay lại</Button>
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <PostForm mode="create" categories={categories} />
        </CardContent>
      </Card>
    </>
  );
}
