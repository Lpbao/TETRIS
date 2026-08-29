import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminCategoriesPage() {
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    _count: { posts: number };
  }> = [];
  let dbError: string | null = null;

  try {
    categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  } catch {
    dbError =
      "Không kết nối được database. Kiểm tra DATABASE_URL trong file .env và chạy npm run db:push.";
  }

  return (
    <>
      <AdminPageHeader
        title="Category"
        description="Thuộc mục Bài đăng — Lưu trú, FNB, Showroom"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={ADMIN_NAV.posts.href}>
              <Button variant="outline">Bài đăng</Button>
            </Link>
            <Link href="/admin/categories/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo category
              </Button>
            </Link>
          </div>
        }
      />

      {dbError && (
        <div className="mb-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {dbError}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {!dbError && categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">
                Chưa có category. Tạo mới hoặc chạy npm run db:seed.
              </p>
              <Link href="/admin/categories/new" className="mt-4 inline-block">
                <Button>Tạo category đầu tiên</Button>
              </Link>
            </div>
          ) : !dbError ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden sm:table-cell">Thứ tự</TableHead>
                  <TableHead className="text-right">Bài đăng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {category._count.posts}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Sửa
                          </Button>
                        </Link>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
