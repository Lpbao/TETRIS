import { CONTACT_MAP_ZOOM } from "@/lib/contact-map-config";
import { siteContact } from "@/lib/site-content";

export type ContactMapEmbedProvider =
  | "google-query"
  | "google-url"
  | "google-key"
  | "osm";

/** Link mở Google Maps theo địa chỉ CMS */
export function getContactMapsUrl(address: string): string {
  const q = address.trim();
  if (!q) {
    return siteContact.mapsUrl;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * Phase B1: ưu tiên iframe theo `address` CMS (không cần API key).
 * Env EMBED_* / OSM chỉ khi address trống.
 */
export function getContactMapEmbedSrc(address?: string): {
  src: string;
  provider: ContactMapEmbedProvider;
} {
  const q = address?.trim();
  if (q) {
    return {
      src: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=vi&z=${CONTACT_MAP_ZOOM.default}&output=embed`,
      provider: "google-query",
    };
  }

  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();
  if (embedUrl) {
    return { src: embedUrl, provider: "google-url" };
  }

  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();
  if (embedKey) {
    const { lat, lng } = siteContact.mapsCenter;
    return {
      src: `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(embedKey)}&center=${lat},${lng}&zoom=${CONTACT_MAP_ZOOM.default}`,
      provider: "google-key",
    };
  }

  return { src: siteContact.osmEmbedUrl, provider: "osm" };
}

/** Map ID thật từ Cloud Console — AdvancedMarkerElement cần giá trị này */
export function hasContactMapId(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim());
}
