import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const body = await request.json();
    const { emoji, author } = body;
    if (!emoji || !author) {
      return NextResponse.json({ error: "emoji and author required" }, { status: 400 });
    }
    const existing = await prisma.commentReaction.findFirst({
      where: { commentId, emoji, author },
    });
    if (existing) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ removed: true });
    }
    const reaction = await prisma.commentReaction.create({
      data: { commentId, emoji, author },
    });
    return NextResponse.json(reaction);
  } catch (error) {
    console.error("Toggle reaction:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
