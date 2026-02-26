import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: channelId } = await params;
    const updates = await prisma.channelUpdate.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(updates);
  } catch (error) {
    console.error("List channel updates:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
