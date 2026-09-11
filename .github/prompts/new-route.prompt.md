---
mode: agent
agent: agent
description: Add an App Router page under (site) or admin with metadata and the correct layout.
argument-hint: URL path and kind (site or admin)
---

Add route **${input:path:e.g. /about/team or /admin/posts/archive}**.
Kind: **${input:kind:site or admin}** (`site` | `admin`).

## site

- File: `src/app/(site)/{segments}/page.tsx` — inherits `SiteJsonLd` / `SiteHeader`. Do not render them again.
- `export const metadata = createPageMetadata({ title, description, path })`.
- Default-export Server Component. Load data in the page (`site-content`, `getHomeHeroSlides` / `getSiteAbout` / `getSiteServices` / `getSiteProjectBySlug`, or Prisma); pass props to `src/components/site/…`.
- If the URL is `/`, `/about`, `/projects`, or `/services` (or a new full-page landing), sections must fill the viewport: `FullPageScrollRoot` + `src/lib/{page}-section-config.ts`, **or** Home's `home-scroll.ts` — never both.
- `params` / `searchParams` are Promises. Static `site-content` lists may use `generateStaticParams`. `notFound()` for bad slugs.

## admin

- File: `src/app/admin/{segments}/page.tsx`. Protected by NextAuth `authorized` except `/admin/login`.
- `AdminPageHeader` + `Card`. Fetch with Prisma try/catch (Vietnamese `dbError`, empty list). Forms in `src/components/admin/`.
- No `components/site/` imports. Media via `useMediaDrawer()` / pickers, not a new `/admin/media` page.

Vietnamese copy. No i18n.
