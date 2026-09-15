export { auth as middleware } from "@/auth";

export const config = {
  // `/admin/:path*` không khớp đúng `/admin` — thiếu matcher này thì chưa login ra trang trắng
  matcher: ["/admin", "/admin/:path*"],
};
