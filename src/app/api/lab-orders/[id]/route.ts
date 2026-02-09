import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: any = { status: body.status };
  if (body.status === "delivered") data.actualDelivery = new Date().toISOString().split("T")[0];
  const lo = await prisma.labOrder.update({ where: { id: params.id }, data });
  return NextResponse.json(lo);
}
