import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, author } = body;
    if (!content?.trim() || !author) {
      return NextResponse.json({ error: "Content and author are required" }, { status: 400 });
    }
    const message = await prisma.channelMessage.create({
      data: {
        channelId: id,
        content: content.trim(),
        author,
      },
    });
    return NextResponse.json(message);
  } catch (error) {
    console.error("Create message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
