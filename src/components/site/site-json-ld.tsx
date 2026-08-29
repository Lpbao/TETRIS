import { siteBrand, siteContact, siteSocial } from "@/lib/site-content";
import { siteUrl } from "@/lib/site-metadata";

export function SiteJsonLd() {
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
    email: siteContact.email,
    telephone: siteContact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteContact.address,
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
