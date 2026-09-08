import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { DEV_CLIENT_PROBE } from "@/lib/dev-client-probe";
import { siteBrand } from "@/lib/site-content";
import { siteUrl } from "@/lib/site-metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteBrand.name,
    template: `%s | ${siteBrand.name}`,
  },
  description:
    "Thiết kế kiến trúc, nội thất và thi công không gian thương mại tại Việt Nam.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: siteBrand.name,
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV === "production" ? null : (
          <script
            id="site-dev-probe"
            dangerouslySetInnerHTML={{ __html: DEV_CLIENT_PROBE }}
          />
        )}
        <link
          rel="preload"
          href="/fonts/FashionDidotW90-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/UTMAvo.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
