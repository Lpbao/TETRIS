import { siteContact } from "@/lib/site-content";

export type ContactMapEmbedProvider = "google-url" | "google-key" | "osm";

export function getContactMapEmbedSrc(): {
  src: string;
  provider: ContactMapEmbedProvider;
} {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;
  if (embedUrl) {
    return { src: embedUrl, provider: "google-url" };
  }

  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  if (embedKey) {
    return {
      src: `https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=${encodeURIComponent(siteContact.mapsQuery)}`,
      provider: "google-key",
    };
  }

  return { src: siteContact.osmEmbedUrl, provider: "osm" };
}

/** Map ID thật từ Cloud Console — AdvancedMarkerElement cần giá trị này */
export function hasContactMapId(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim());
}
