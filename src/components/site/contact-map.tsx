import { ContactMapJsSection } from "@/components/site/contact-map-js-section";
import { ContactMapEmbedSection } from "@/components/site/contact-map-embed-section";

interface ContactMapProps {
  /** Địa chỉ CMS — iframe / pin theo address (Phase B) */
  address: string;
  className?: string;
}

export function ContactMap({ address, className }: ContactMapProps) {
  // Maps JS vẫn dùng mapsCenter hardcode — Phase C. Embed theo address.
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return <ContactMapJsSection address={address} className={className} />;
  }

  return <ContactMapEmbedSection address={address} className={className} />;
}
