import { ServicesPageScroll } from "@/components/site/services-page-scroll";
import { siteServices } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Dịch vụ",
  description:
    "Dịch vụ Tetris Design: thiết kế nhận diện thương hiệu, kiến trúc & nội thất, thi công trọn gói.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesPageScroll services={siteServices} />;
}
