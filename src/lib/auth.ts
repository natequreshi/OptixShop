import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const fetchUser = async () =>
          prisma.user.findUnique({ where: { username: credentials!.username } });

        let user;
        try {
          user = await fetchUser();
        } catch (err: any) {
          console.error("[Auth] DB error, retrying:", err?.message);
          await new Promise((r) => setTimeout(r, 2000));
          try {
            user = await fetchUser();
          } catch (retryErr: any) {
            console.error("[Auth] authorize error:", retryErr?.message);
            throw new Error("CONNECTION_ERROR");
          }
        }

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 60 * 60, // refresh session every hour
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    signIn: ({ user }) => console.log("[Auth] Signed in:", user?.name),
    signOut: () => console.log("[Auth] Signed out"),
  },
};
