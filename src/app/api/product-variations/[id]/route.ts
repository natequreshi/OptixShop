import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/product-variations/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, value, attributeType, imageUrl, isActive, sortOrder } = body;

    const variation = await prisma.productVariation.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(value !== undefined && { value }),
        ...(attributeType !== undefined && { attributeType }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(variation);
  } catch (err: any) {
    console.error("[VARIATIONS PUT]", err);
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Variation not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
  }
}

// DELETE /api/product-variations/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.productVariation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[VARIATIONS DELETE]", err);
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Variation not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 });
  }
}
