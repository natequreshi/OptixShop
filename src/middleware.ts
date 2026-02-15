export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!login|customer-login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
