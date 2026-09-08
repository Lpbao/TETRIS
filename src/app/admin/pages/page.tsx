import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ADMIN_LAYOUT_PAGE_LIST } from "@/lib/admin-nav";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPagesHubPage() {
  return (
    <>
      <AdminPageHeader
        title="Layout landing"
        description="Nội dung 5 trang — lưu SitePage. Home / About / Services / Contact (email, SĐT, địa chỉ) đã hiện trên site public."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_LAYOUT_PAGE_LIST.map((page) => (
          <Link key={page.slug} href={page.href} className="block">
            <Card className="h-full transition-colors hover:border-foreground/25">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{page.label}</CardTitle>
                  <CardDescription className="mt-1.5">
                    {page.description}
                  </CardDescription>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
