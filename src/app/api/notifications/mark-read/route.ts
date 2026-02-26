import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, workspaceId } = body;
    if (!recipientEmail || !workspaceId) {
      return NextResponse.json(
        { error: "recipientEmail and workspaceId required" },
        { status: 400 }
      );
    }
    await prisma.notification.updateMany({
      where: { recipientEmail, workspaceId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
