import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileClient from "./client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, username: true, fullName: true, email: true, role: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return <ProfileClient user={{
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email ?? "",
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }} />;
}
