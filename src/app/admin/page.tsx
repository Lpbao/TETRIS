import Link from "next/link";
import { auth } from "@/auth";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return (
    <>
      <AdminPageHeader
        title="CMS Admin"
        description="Hai mục chính: cập nhật layout landing và quản lý bài đăng."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href={ADMIN_NAV.layout.href} className="block">
          <Card className="h-full transition-colors hover:border-foreground/25">
            <CardHeader>
              <CardTitle>Layout</CardTitle>
              <CardDescription>
                Home, About, Projects, Services, Contact — data trên bảng
                SitePage, chưa gắn landing.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={ADMIN_NAV.posts.href} className="block">
          <Card className="h-full transition-colors hover:border-foreground/25">
            <CardHeader>
              <CardTitle>Bài đăng</CardTitle>
              <CardDescription>
                Dự án: title, địa chỉ, concept, category, mô tả. Category CRUD
                nằm trong mục này.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </>
  );
}
