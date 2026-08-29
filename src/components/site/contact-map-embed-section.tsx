import Link from "next/link";
import { getContactMapEmbedSrc } from "@/lib/contact-map-embed";
import { siteContact } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface ContactMapEmbedSectionProps {
  className?: string;
}

export function ContactMapEmbedSection({ className }: ContactMapEmbedSectionProps) {
  const { src, provider } = getContactMapEmbedSrc();

  return (
    <section className={cn("w-full", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted grayscale md:aspect-[21/9]">
        <iframe
          title="Vị trí Tetris Design trên bản đồ"
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {provider === "osm" && (
          <div className="pointer-events-none absolute inset-0 bg-foreground/5" />
        )}
      </div>

      {provider === "osm" && (
        <p className="mx-auto max-w-6xl px-4 pt-3 text-center">
          <Link
            href={siteContact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand-red"
          >
            Mở Google Maps →
          </Link>
        </p>
      )}
    </section>
  );
}
