---
applyTo: "src/components/admin/*context*.tsx,src/lib/full-page-scroll/context.tsx,src/hooks/**/*.ts"
---

# State (React Context + hooks only)

No Redux, Zustand, or TanStack Query. Client state is `useState` in forms, or a small Context next to the feature.

```tsx
"use client";

const MediaDrawerContext = createContext<MediaDrawerContextValue | null>(null);

export function MediaDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openMedia = useCallback((options?: OpenMediaOptions) => { /* … */ }, []);
  const value = useMemo(() => ({ open, openMedia, /* … */ }), [/* deps */]);
  return <MediaDrawerContext.Provider value={value}>{children}</MediaDrawerContext.Provider>;
}

export function useMediaDrawer() {
  const context = useContext(MediaDrawerContext);
  if (!context) {
    throw new Error("useMediaDrawer must be used within MediaDrawerProvider");
  }
  return context;
}
```

- Colocate: admin drawer → `components/admin/media-drawer-context.tsx`; pager → `lib/full-page-scroll/context.tsx`. Do not add a global store.
- Provider wraps the layout that needs it (`admin/layout.tsx` → `MediaDrawerProvider`). Public site does not use admin context. Root only has `SessionProvider`.
- Required hooks **throw** if used outside the provider (`useMediaDrawer`, `useFullPageScroll`). Optional ones may return null (`useEditorPreview`).
- Memoize context value (`useMemo` / `useCallback`). Keep forms on RHF (`useForm` + `zodResolver`) plus local `useState` for submit error — not Context.
- Server data: Prisma in Server Components. Do not add a client cache layer.
- Scroll/pager state stays in existing hubs (`home-scroll.ts`, `FullPageScrollRoot` hooks). Do not duplicate thresholds.
