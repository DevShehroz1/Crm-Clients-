import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comment = await prisma.taskComment.findUnique({
      where: { id },
      include: {
        mentions: true,
        reactions: true,
        replies: { include: { mentions: true, reactions: true } },
      },
    });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Get comment:", error);
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 });
  }
}
