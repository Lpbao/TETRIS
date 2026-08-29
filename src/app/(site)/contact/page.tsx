import { ContactInfo } from "@/components/site/contact-info";
import { ContactMap } from "@/components/site/contact-map";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Liên hệ",
  description:
    "Liên hệ Tetris Design — email, điện thoại và địa chỉ văn phòng tại Ba Đình, Hà Nội.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <ContactMap />
      <ContactInfo />
    </>
  );
}
