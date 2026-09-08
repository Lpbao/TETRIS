import { ContactInfo } from "@/components/site/contact-info";
import { ContactMap } from "@/components/site/contact-map";
import { getSiteContact } from "@/lib/get-site-contact";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Liên hệ",
  description:
    "Liên hệ Tetris Design — email, điện thoại và địa chỉ văn phòng tại Ba Đình, Hà Nội.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await getSiteContact();

  return (
    <>
      <ContactMap address={contact.address} />
      <ContactInfo contact={contact} />
    </>
  );
}
