export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!login|customer-login|customer-portal|api/auth|api/customer-auth|api/reset-data|_next/static|_next/image|favicon.ico).*)",
  ],
};
