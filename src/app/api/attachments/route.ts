import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, fileName, taskId } = body;
    if (!url || !fileName || !taskId) {
      return NextResponse.json(
        { error: "url, fileName, and taskId are required" },
        { status: 400 }
      );
    }
    const attachment = await prisma.taskAttachment.create({
      data: { url, fileName, taskId },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Create attachment:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 }
    );
  }
}
