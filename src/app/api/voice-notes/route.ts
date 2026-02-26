import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, taskId, duration } = body;
    if (!url || !taskId) {
      return NextResponse.json(
        { error: "URL and taskId are required" },
        { status: 400 }
      );
    }
    const voiceNote = await prisma.voiceNote.create({
      data: {
        url,
        taskId,
        duration: duration || 0,
      },
    });
    return NextResponse.json(voiceNote);
  } catch (error) {
    console.error("Create voice note:", error);
    return NextResponse.json(
      { error: "Failed to create voice note" },
      { status: 500 }
    );
  }
}
