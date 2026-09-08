---
mode: agent
agent: agent
description: Scaffold a feature across page, lib/API, validation, and optional context using this repo's real folders.
argument-hint: feature name and area (site or admin)
---

Implement feature: **${input:featureName:feature name}**
Area: **${input:area:site or admin}** (`site` = public landing under `(site)/`, `admin` = CMS)

Follow existing files. Do not invent i18n, tests, Redux, Prettier, or a `services/` folder.

## Do

1. **Page**
   - `site`: `src/app/(site)/{route}/page.tsx` — `createPageMetadata`, Server Component, pass props into `src/components/site/`. If this is a full-page landing (`/`, `/about`, `/projects`, `/services`), add `{page}-section-config.ts` + `{page}-page-scroll.tsx` and `FullPageScrollRoot` (not Home's `home-scroll.ts` unless the feature is Home).
   - `admin`: `src/app/admin/.../page.tsx` — `AdminPageHeader` + `Card`, Prisma fetch with try/catch. Put the form in `src/components/admin/`.
2. **Data / "service"**
   - Public read: `site-content.ts` **or** a `src/lib/get-*.ts` helper (see `getHomeHeroSlides.ts`, `getSiteAbout.ts`) using `prisma` from `@/lib/prisma`.
   - Admin write: `src/app/api/{resource}/route.ts` + Zod in `src/lib/validations/{resource}.ts`. Client: `fetch("/api/…")` or extend `putSitePage` for `SitePage` slugs.
3. **State** — only if UI needs shared client state: colocated `*-context.tsx` (`createContext` + throwing `useX`). Forms stay on `useForm` + `zodResolver`.
4. **Types** — infer from Zod (`z.infer`) or extend types in `site-content.ts` / Prisma. No parallel type dump.
5. **Copy** — Vietnamese strings in the component or `site-content.ts`. No i18n keys.

## Do not

- Mix `components/site` and `components/admin`.
- Hardcode header height; use `getHeaderOffset()` / `--site-header-total-height`.
- Break Home hero paging or project curtain (`home-scroll.ts`).
- Write `Post.content` / `Post.excerpt` from admin.
- Add Prettier, Jest, or next-intl.

Read `docs/architecture/DECISIONS.md` and a sibling feature (e.g. posts or about) before writing.
