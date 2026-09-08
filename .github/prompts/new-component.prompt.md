---
mode: agent
agent: agent
description: Add a kebab-case named-export component in site, admin, or ui matching existing patterns.
argument-hint: component name, bucket (site | admin | ui), purpose
---

Create component **${input:componentName:PascalCase name}** in **${input:bucket:site, admin, or ui}** (`site` | `admin` | `ui`).

Purpose: ${input:purpose:what it renders or does}

## Placement

| bucket | path | rule |
|--------|------|------|
| `site` | `src/components/site/{kebab}.tsx` | public only; no admin imports |
| `admin` | `src/components/admin/{kebab}.tsx` | CMS only; no site imports |
| `ui` | `src/components/ui/{kebab}.tsx` | `cva` + `forwardRef` + `cn()`, no business/Prisma |

## Pattern

- File kebab-case. Site/admin: `export function ComponentName({ … }: ComponentNameProps)`. UI: match `button.tsx` (`forwardRef`, `displayName`, export variants).
- `interface ComponentNameProps` with optional `className?: string` merged via `cn()`.
- Server Component unless it needs state/events/RHF/hooks → then `"use client"` first line.
- Reuse `@/components/ui/*` and `lucide-react`. Tailwind tokens (`bg-background`, `text-foreground`), not raw brand hex.
- Vietnamese UI text inline. Images: `next/image` or `SiteImage`.
- If used on `/` `/about` `/projects` `/services`, keep full-viewport section behavior; offsets via `getHeaderOffset()` / CSS vars.

Match style of `project-card.tsx` (site), `post-form.tsx` (admin), or `button.tsx` (ui).
