import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const channel = await prisma.channel.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        workspace: true,
        tasks: true,
      },
    });
    if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    return NextResponse.json(channel);
  } catch (error) {
    console.error("Get channel:", error);
    return NextResponse.json({ error: "Failed to fetch channel" }, { status: 500 });
  }
}
