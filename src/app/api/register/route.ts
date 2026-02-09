import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await prisma.registerSession.findMany({
    include: { user: true, transactions: { orderBy: { createdAt: "desc" } } },
    orderBy: { openedAt: "desc" },
    take: 20,
  });

  const data = sessions.map(s => ({
    id: s.id, openedAt: s.openedAt.toISOString(), closedAt: s.closedAt?.toISOString() ?? null,
    openingCash: s.openingCash, closingCash: s.closingCash, expectedCash: s.expectedCash,
    difference: s.difference, status: s.status, userName: s.user.fullName,
    transactions: s.transactions.map(t => ({
      id: t.id, type: t.type, amount: t.amount, method: t.method,
      notes: t.notes ?? "", createdAt: t.createdAt.toISOString(),
    })),
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();

  if (body.action === "open") {
    const reg = await prisma.registerSession.create({
      data: {
        userId: (session?.user as any)?.id ?? "",
        openingCash: body.openingCash ?? 0,
        status: "open",
      },
    });
    return NextResponse.json(reg);
  }

  if (body.action === "close") {
    const reg = await prisma.registerSession.update({
      where: { id: body.sessionId },
      data: {
        closedAt: new Date(),
        closingCash: body.closingCash ?? 0,
        expectedCash: body.closingCash ?? 0,
        difference: 0,
        status: "closed",
      },
    });
    return NextResponse.json(reg);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
