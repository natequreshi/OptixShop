import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fullName, email } = await req.json();
  const userId = (session.user as any).id;

  await prisma.user.update({
    where: { id: userId },
    data: { fullName, email: email || null },
  });

  return NextResponse.json({ success: true });
}
