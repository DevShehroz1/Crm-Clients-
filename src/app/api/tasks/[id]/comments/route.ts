import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const comments = await prisma.taskComment.findMany({
      where: { taskId, parentCommentId: null },
      include: {
        mentions: true,
        reactions: true,
        replies: {
          include: { mentions: true, reactions: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("List comments:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
