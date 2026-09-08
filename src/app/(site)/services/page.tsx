import { ServicesPageScroll } from "@/components/site/services-page-scroll";
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
  const services = await getSiteServices();
  return <ServicesPageScroll services={services} />;
}
