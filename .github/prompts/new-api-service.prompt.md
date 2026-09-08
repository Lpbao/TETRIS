---
mode: agent
agent: agent
description: Add an authenticated App Router API route plus Zod schema, following posts/categories.
argument-hint: resource name and HTTP methods
---

Add API for resource **${input:resourceName:kebab resource, e.g. posts}**.
Methods: **${input:methods:subset of GET, POST, PUT, DELETE}**.

This repo has no service class. Create:

1. `src/lib/validations/{resource}.ts` — Zod schema, Vietnamese messages, `export type {Resource}FormValues = z.infer<typeof schema>`. Reuse `slugSchema` / media schemas from `shared.ts` when relevant.
2. `src/app/api/{resource}/route.ts` and, if needed, `src/app/api/{resource}/[id]/route.ts`.

## Handler rules (copy posts/categories)

- `import { auth } from "@/auth"` and `{ prisma } from "@/lib/prisma"`.
- First line of each handler: session check → 401 `{ error: "Unauthorized" }`.
- `params: Promise<{ id: string }>` (or `slug`); await it.
- `safeParse` body; 400 `{ error: "Validation failed", details: parsed.error.flatten() }`.
- Unique slug clash → 409 `{ error: "Slug already exists" }`. Missing row → 404. Category still referenced by posts → 409.
- POST → 201 + created row. DELETE → `{ success: true }`. Wrap DB in try/catch; `console.error` + 500 `{ error }`.
- JSON body unless this is media — then `formData()` like `src/app/api/media/route.ts`.
- Do not instantiate Prisma. Do not expose stack traces. Do not add `auth()` to `/api/auth/[...nextauth]`.

If this is `SitePage` content, extend `src/lib/validations/site-page.ts` and `PUT /api/site-pages/[slug]` / `putSitePage()` instead of a new resource.
