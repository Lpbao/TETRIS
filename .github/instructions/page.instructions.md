---
applyTo: "src/app/**/page.tsx,src/app/**/layout.tsx,src/middleware.ts"
---

# Pages & layouts (App Router)

```tsx
import { createPageMetadata } from "@/lib/site-metadata";
import { AboutPageScroll } from "@/components/site/about-page-scroll";
import { getSiteAbout } from "@/lib/get-site-about";

export const metadata = createPageMetadata({
  title: "Giới thiệu",
  description: "…",
  path: "/about",
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getSiteAbout();
  return <AboutPageScroll content={content} />;
}
```

- Public: `src/app/(site)/{route}/page.tsx`. Admin: `src/app/admin/.../page.tsx`. Default export Server Component.
- Metadata via `createPageMetadata`. Dynamic routes: `params` / `searchParams` are **Promises** — `const { slug } = await params`. Missing slug/id → `notFound()`.
- Do not add a second header on public pages. `(site)/layout.tsx` already renders `SiteJsonLd`, `SiteHeader`, `<main>`.
- Fetch in the page (Prisma, `site-content`, or `getHomeHeroSlides` / `getHomeProjects` / `getSiteProjects` / `getSiteAbout` / `getSiteServices` / `getSiteProjectBySlug`); pass props into `components/site/` or `components/admin/`.
- `/`, `/about`, `/projects`, `/services`: full-screen sections. Home: `HeroCarousel` + `ProjectGrid` + `HomeSectionPaging` and `dynamic = "force-dynamic"`. About/Projects/Services: `*PageScroll` + `{page}-section-config.ts`. About and Services also `dynamic = "force-dynamic"` (CMS). `/projects/[slug]` đọc `Post` (`getSiteProjectBySlug`, `force-dynamic`). Static `site-content` detail pages may use `generateStaticParams`.
- Admin pages: `AdminPageHeader` + `Card`; Prisma in try/catch that sets a Vietnamese `dbError` and `posts = []` (see `admin/posts/page.tsx`). Optional `auth()` then `return null` if no session. Layout already wraps `MediaDrawerProvider`.
- CRUD only under `/admin/*`. NextAuth `authorized` allows `/admin/login`; logged-in users hitting login redirect to `/admin`. `/admin/media` redirects — media is the header drawer.
- Do not import `components/site/` in admin or `components/admin/` in `(site)`.
