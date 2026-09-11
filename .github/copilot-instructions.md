# cms-app — Copilot instructions

TETRIS DESIGN CMS: public marketing site (read-only, except Home hero from DB) plus admin CRUD for landing `SitePage`, posts (projects), categories, and media.

## Tech stack (from package.json)

| Layer | Actual |
|-------|--------|
| Next.js (App Router) | 16.2.9 — read `node_modules/next/dist/docs/` before using APIs |
| React / React DOM | 19.2.4 |
| TypeScript | ^5, `strict: true`, paths `@/*` → `src/*` |
| Tailwind | v4 (`@tailwindcss/postcss`) |
| Prisma + PostgreSQL | ^6.19.3 |
| NextAuth | ^5.0.0-beta.31 (Credentials, JWT) — `SessionProvider` in `src/components/providers.tsx` |
| Zod / RHF | ^4.4.3 / ^7.80.0 + `@hookform/resolvers` |
| Storage | Supabase JS ^2.108.2 + `sharp` for upload optimize |
| Motion | GSAP ^3.15.0 (landing only; keep Home hero/curtain) |
| Lint | ESLint 9 + `eslint-config-next` 16.2.9 |
| Tests / Prettier / i18n | **none** — do not invent them |

Scripts: `npm run dev` (`prisma generate && next dev`), `lint`, `db:push`, `db:migrate`, `db:seed`.

`<html lang="vi">`. User-facing copy is Vietnamese, inline.

## Critical rules

1. **Server Components by default.** `"use client"` only for state, events, browser APIs, RHF, or hooks.
2. **Two UIs, never mixed.** `components/site/` only under `(site)/`. `components/admin/` only under `admin/`. Share **only** `components/ui/`.
3. **Public pages live in `src/app/(site)/`.** Do not copy `SiteHeader` / `SiteJsonLd` into a page; `(site)/layout.tsx` already wraps them. Root `layout.tsx` is html/body/`Providers` only.
4. **No hardcoded header offsets.** Use `getHeaderOffset()` (`src/lib/home-scroll.ts`) or `var(--site-header-total-height)`. Do not sprinkle `64` / `80px`.
5. **API routes:** `auth()` first → 401; Zod `safeParse` from `src/lib/validations/` → 400 + `flatten()`; Prisma via `@/lib/prisma` (never `new PrismaClient()`); JSON `{ error }` with 400/401/404/409/500. Exception: `/api/auth/[...nextauth]` re-exports `handlers` only. Media POST uses `formData()`, not JSON.
6. **Landing copy:** Contact / `/projects` list still `src/lib/site-content.ts`. Home slider: `getHomeHeroSlides()`; Home grid: `getHomeProjects()`; `/projects/[slug]`: `getSiteProjectBySlug()` (`Post` published); About: `getSiteAbout()`; `/services`: `getSiteServices()`. Admin must not write `Post.content` / `Post.excerpt`.
7. **Full-page scroll** on `/`, `/about`, `/projects`, `/services`. Home = anchor + `home-scroll.ts` (`HeroCarousel` + `ProjectGrid` + `HomeSectionPaging`). Others = `FullPageScrollRoot` + `{page}-section-config.ts`. Do not mix the two on one page. Keep Home hero paging and project curtain intact.
8. **No i18n library.** Vietnamese strings in the component, `site-content.ts`, or Zod messages. Auth UI exception: `/admin/*` except `/admin/login` is gated in NextAuth `authorized` (middleware matcher is still `/admin/:path*`).

Architecture docs: `docs/architecture/DECISIONS.md`, `OVERVIEW.md`, `CONVENTIONS.md`, `FULL-PAGE-SCROLL.md`.

## Folder structure

```
src/
├── app/
│   ├── (site)/                 # public: /, about, projects, services, contact, blog
│   ├── admin/                  # CMS (login public; rest requires session)
│   ├── api/                    # posts, categories, media, site-pages, auth
│   ├── layout.tsx              # html/body/Providers only
│   └── globals.css
├── components/
│   ├── site/                   # public UI + full-page-scroll/
│   ├── admin/                  # forms, media drawer, contexts
│   ├── ui/                     # cva + cn primitives
│   └── providers.tsx           # SessionProvider only
├── hooks/                      # use-section-*, use-viewport-below-header, …
├── lib/
│   ├── validations/            # Zod: post, category, media, site-page, shared
│   ├── full-page-scroll/       # types, constants, context
│   ├── site-content.ts         # public landing data
│   ├── prisma.ts               # singleton PrismaClient
│   └── home-scroll.ts          # header offset + Home paging hub
├── auth.ts
└── middleware.ts               # matcher: /admin/:path*
```

There is **no** `services/` folder, **no** `components/blog/`, **no** Redux/Zustand/Query. Media UI is a header drawer (`MediaDrawerProvider`), not `/admin/media` (that route redirects).

## Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Component file | kebab-case | `post-form.tsx`, `hero-carousel.tsx` |
| Site / admin export | named function | `export function PostForm` |
| UI primitive | `forwardRef` + `cva` | `export { Button, buttonVariants }` |
| Page / layout | `page.tsx` / `layout.tsx` | `app/(site)/about/page.tsx` |
| API | `route.ts` | `app/api/posts/[id]/route.ts` |
| Hook | `use-*.ts`, camelCase fn | `useViewportBelowHeader()` |
| Util | camelCase | `slugify()`, `cn()`, `putSitePage()` |
| Zod schema + inferred type | `*Schema` / `*FormValues` | `postSchema`, `PostFormValues` |
| Props type | PascalCase `*Props` | `ProjectCardProps` |
| Dynamic params | `Promise<{ … }>` | `params: Promise<{ slug: string }>` |

## Patterns (copy this style)

**Server page — fetch then pass props**

```tsx
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

**API — auth, validate, Prisma**

```ts
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const parsed = postSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: "Validation failed", details: parsed.error.flatten() },
    { status: 400 },
  );
}
```

**Client form — RHF + Zod; `fetch` JSON or `putSitePage`**

```ts
useForm<PostFormValues>({ resolver: zodResolver(postSchema), defaultValues: … });
await fetch("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

**Context — colocated, throw if missing provider**

```ts
export function useMediaDrawer() {
  const context = useContext(MediaDrawerContext);
  if (!context) throw new Error("useMediaDrawer must be used within MediaDrawerProvider");
  return context;
}
```

Imports: external → `@/` → relative. Icons: `lucide-react`. Class names: `cn()` from `@/lib/utils`. Site photos: `SiteImage` or `next/image` (`fill` + `sizes`). Brand tokens: `text-foreground`, `bg-background`, `text-brand-red` — not raw `#231f20`.
