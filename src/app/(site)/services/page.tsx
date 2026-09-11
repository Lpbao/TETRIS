import { ServicesPageScroll } from "@/components/site/services-page-scroll";
import { getSiteContact } from "@/lib/get-site-contact";
import { getSiteServices } from "@/lib/get-site-services";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Dịch vụ",
  description:
    "Dịch vụ Tetris Design: thiết kế nhận diện thương hiệu, kiến trúc & nội thất, thi công trọn gói.",
  path: "/services",
});

/** CMS đổi là thấy ngay — không cache trang dịch vụ. */
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, contact] = await Promise.all([
    getSiteServices(),
    getSiteContact(),
  ]);
  return <ServicesPageScroll services={services} contact={contact} />;
}
