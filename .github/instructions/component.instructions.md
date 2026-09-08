---
applyTo: "src/components/**/*.tsx,src/components/**/*.ts,src/hooks/**/*.ts"
---

# Components & hooks

```tsx
interface ProjectCardProps {
  project: SiteProject;
  className?: string;
  variant?: "default" | "home" | "gallery";
}

export function ProjectCard({ project, className, variant = "default" }: ProjectCardProps) {
  return (
    <article className={cn("group", className)}>
      {/* next/image + fill + sizes; tokens via Tailwind */}
    </article>
  );
}
```

- Default **Server Component**. `"use client"` only for state, events, browser APIs, RHF, or hooks.
- Place by audience: `components/site/` (public), `components/admin/` (CMS), `components/ui/` (`cva` + `forwardRef`, no Prisma/business). **Never** import site ↔ admin.
- Named export, kebab-case file (`hero-carousel.tsx`). Props: `interface FooProps` + optional `className` merged with `cn()`.
- UI primitives only: `Button`, `Input`, `Label`, `Card`, `Textarea`, `Badge`, `Table`, `Sheet` from `@/components/ui/`. Icons: `lucide-react`.
- Public landing: fetch on the page; section receives props. Full-viewport landing uses `FullPageScrollRoot` or Home `home-scroll.ts` — do not mix.
- Header offset: `getHeaderOffset()` / `var(--site-header-total-height)`, never hardcoded `64`/`80px`.
- Vietnamese copy inline. Site photos: `SiteImage` or `next/image` (`fill` + `sizes`).
- Hooks live in `src/hooks/` (`use-section-enter-once.ts`); `"use client"` at top. Prefer `useSyncExternalStore` for media queries (see `use-prefers-reduced-motion.ts`).
