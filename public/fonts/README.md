# Font files

Đặt file font brand vào đây (theo `DECISIONS.md`):

| Font | File đề xuất |
|------|----------------|
| Fashion Didot W90 Regular | `FashionDidotW90-Regular.woff2` |
| UTM Avo | `UTMAvo.woff2` |

Đường dẫn trong CSS: `/fonts/{filename}` — xem `@font-face` trong `src/app/globals.css`.

Sau khi thêm font, có thể preload trong `src/app/layout.tsx`:

```tsx
<link rel="preload" href="/fonts/UTMAvo.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

Nếu tên file khác, cập nhật `@font-face` tương ứng.
