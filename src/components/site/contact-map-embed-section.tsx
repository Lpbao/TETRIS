import Link from "next/link";
import { CONTACT_MAP_PIN } from "@/lib/contact-map-config";
import {
  getContactMapEmbedSrc,
  getContactMapsUrl,
} from "@/lib/contact-map-embed";
import { cn } from "@/lib/utils";

interface ContactMapEmbedSectionProps {
  /** Địa chỉ CMS — sinh iframe + link pin */
  address: string;
  className?: string;
}

export function ContactMapEmbedSection({
  address,
  className,
}: ContactMapEmbedSectionProps) {
  const { src, provider } = getContactMapEmbedSrc(address);
  const mapsUrl = getContactMapsUrl(address);

  return (
    <section className={cn("w-full", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted md:aspect-[21/9]">
        {/* pointer-events-none: iOS/Android iframe nuốt touch → pin không bấm được */}
        <iframe
          title="Vị trí Tetris Design trên bản đồ"
          src={src}
          className="pointer-events-none absolute inset-0 h-full w-full border-0 grayscale"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
          aria-hidden
        />
        {provider === "osm" && (
          <div className="pointer-events-none absolute inset-0 bg-foreground/5" />
        )}

        {/* Pin + vùng chạm ≥44px — mở Google Maps / app chỉ đường */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1 p-3 touch-manipulation"
          aria-label={`${address} — mở Google Maps`}
        >
          <span className="rounded-sm bg-background px-2 py-0.5 text-[11px] font-medium tracking-wide text-foreground shadow-sm">
            Tetris
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG pin tĩnh public */}
          <img
            src={CONTACT_MAP_PIN.src}
            width={CONTACT_MAP_PIN.width}
            height={CONTACT_MAP_PIN.height}
            alt=""
            draggable={false}
            className="drop-shadow-md"
          />
        </a>
      </div>

      <p className="mx-auto max-w-6xl px-4 pt-3 text-center">
        <Link
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center px-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors touch-manipulation hover:text-brand-red"
        >
          Mở Google Maps →
        </Link>
      </p>
    </section>
  );
}
