import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, taskId, author } = body;
    if (!content || !taskId || !author) {
      return NextResponse.json(
        { error: "Content, taskId, and author are required" },
        { status: 400 }
      );
    }
    const comment = await prisma.taskComment.create({
      data: { content, taskId, author },
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
