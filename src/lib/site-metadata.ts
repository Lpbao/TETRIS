import type { Metadata } from "next";
import { siteBrand } from "@/lib/site-content";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tetrisdesign.vn";

type PageMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description = "TETRIS DESIGN — thiết kế kiến trúc, nội thất và thi công không gian thương mại tại Việt Nam.",
  path = "",
  image = "/site/og-default.svg",
  noIndex = false,
}: PageMetadataOptions = {}): Metadata {
  const url = `${siteUrl}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url,
      siteName: siteBrand.name,
      title: title ? `${title} | ${siteBrand.name}` : siteBrand.name,
      description,
      images: [{ url: imageUrl, alt: siteBrand.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${siteBrand.name}` : siteBrand.name,
      description,
      images: [imageUrl],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
