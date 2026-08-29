import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_NAV } from "@/lib/admin-nav";

export default async function AdminPostsPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  let posts: Array<{
    id: string;
    title: string;
    address: string;
    concept: string;
    published: boolean;
    category: { name: string } | null;
  }> = [];
  let dbError: string | null = null;

  try {
    posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        address: true,
        concept: true,
        published: true,
        category: { select: { name: true } },
      },
    });
  } catch {
    dbError =
      "Không kết nối được database. Kiểm tra DATABASE_URL trong file .env và chạy npm run db:push.";
  }

  return (
    <>
      <AdminPageHeader
        title="Bài đăng"
        description="Dự án — title, địa chỉ, concept, category"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={ADMIN_NAV.categories.href}>
              <Button variant="outline">
                <Tags className="h-4 w-4" />
                Category
              </Button>
            </Link>
            <Link href="/admin/posts/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo bài đăng
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
          {!dbError && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">Chưa có bài đăng nào.</p>
              <Link href="/admin/posts/new" className="mt-4 inline-block">
                <Button>Tạo bài đăng đầu tiên</Button>
              </Link>
            </div>
          ) : !dbError ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="hidden md:table-cell">Địa chỉ</TableHead>
                  <TableHead className="hidden sm:table-cell">Concept</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {post.address}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {post.concept}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.category?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.published ? "success" : "secondary"}>
                        {post.published ? "Đã xuất bản" : "Nháp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Sửa
                          </Button>
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
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
