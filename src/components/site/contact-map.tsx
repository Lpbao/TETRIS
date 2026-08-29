import { ContactMapJsSection } from "@/components/site/contact-map-js-section";
import { ContactMapEmbedSection } from "@/components/site/contact-map-embed-section";
import { cn } from "@/lib/utils";

interface ContactMapProps {
  className?: string;
}

export function ContactMap({ className }: ContactMapProps) {
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return <ContactMapJsSection className={className} />;
  }

  return <ContactMapEmbedSection className={className} />;
}
