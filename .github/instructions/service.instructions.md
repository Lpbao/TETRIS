---
applyTo: "src/app/api/**/*.ts,src/lib/validations/**/*.ts,src/lib/prisma.ts,src/lib/put-site-page.ts,src/lib/get-home-hero-slides.ts,src/lib/get-site-services.ts,src/lib/get-site-about.ts,src/lib/get-home-projects.ts,src/lib/get-site-project.ts,src/lib/get-media-titles.ts,src/lib/fetch-media-page.ts,src/lib/media.ts,src/lib/media-upload-titles.ts,src/lib/supabase.ts,src/lib/optimize-image.ts"
---

# API & lib helpers

There is **no** `services/` folder. Mutations go through `src/app/api/**/route.ts`. Server reads use Prisma in pages or small helpers in `src/lib/`. Client writes use `fetch("/api/…")` or `putSitePage()`.

```ts
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const row = await prisma.post.create({ data: parsed.data });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("Create post error:", err);
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- Every `/api/*` handler **except** NextAuth (`src/app/api/auth/[...nextauth]/route.ts` → `handlers`) starts with `auth()`; 401 `{ error: "Unauthorized" }`.
- Body: Zod in `src/lib/validations/{resource}.ts`. `safeParse` only. Vietnamese messages. Export `type XFormValues = z.infer<typeof xSchema>`. Reuse `slugSchema` / media schemas from `shared.ts`.
- Dynamic route context: `params: Promise<{ id: string }>` (or `slug`). Await `context.params`.
- Prisma **only** via `import { prisma } from "@/lib/prisma"`.
- Status: 400 validation, 401 auth, 404 missing, 409 slug clash (or category still has posts), 201 create, DELETE `{ success: true }`, 500 catch + `console.error`. Do not expose stack traces.
- JSON APIs: `request.json()`. **Media POST:** `request.formData()` (`file` + `title`), `validateMediaFile`, unique title check (409 `{ conflicts: [{ index, title, suggested }] }` — không upload nếu trùng), then Supabase (`optimizeImageForUpload`). Preflight titles: `POST /api/media/check-titles` `{ titles: string[] }`. GET media: cursor page `{ items, nextCursor }` via `mediaQuerySchema` (`q`, `cursor`, `limit`, `type`).
- Public Home slider helper: `getHomeHeroSlides()` — `homePageSchema`, fallback `siteHeroSlides` on empty/invalid/DB error.
- Public Home projects helper: `getHomeProjects()` — 8 bài published; đủ 8 trước, rồi chia đều category (round-robin, mới nhất trong nhóm). DB lỗi / trống → `siteProjects`.
- Public project detail helper: `getSiteProjectBySlug()` / `getRelatedSiteProjects()` — `Post` published; nháp → 404; DB lỗi / chưa có row → `siteProjects` cùng slug. Related: cùng category trước, rồi bài khác.
- Public About helper: `getSiteAbout()` — `aboutPageSchema`, fallback `siteAbout` on empty/invalid/DB error.
- Public Services helper: `getSiteServices()` — `servicesPageSchema`, fallback `siteServices` on empty/invalid/DB error.
- Admin site-page save: `putSitePage(slug, content)` (`PUT /api/site-pages/:slug` upsert). Do not fetch Prisma from client components.
- `Post.content` / `Post.excerpt` are deprecated — do not read/write them in admin API.
