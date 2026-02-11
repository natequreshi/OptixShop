export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!login|customer-login|api/auth|api/reset-data|_next/static|_next/image|favicon.ico).*)",
  ],
};
