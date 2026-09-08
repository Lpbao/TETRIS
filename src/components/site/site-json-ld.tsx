import { getSiteContact } from "@/lib/get-site-contact";
import { siteBrand, siteSocial } from "@/lib/site-content";
import { siteUrl } from "@/lib/site-metadata";

export async function SiteJsonLd() {
  const contact = await getSiteContact();

  const sameAs = [
    siteSocial.facebook,
    siteSocial.instagram,
    siteSocial.tiktok,
    siteSocial.behance,
  ].filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteBrand.name,
    url: siteUrl,
    email: contact.email,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: "Hà Nội",
      addressCountry: "VN",
    },
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
