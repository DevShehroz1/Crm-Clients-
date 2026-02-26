import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead, snoozedUntil } = body;

    const updates: Record<string, unknown> = {};
    if (typeof isRead === "boolean") {
      updates.isRead = isRead;
      if (isRead) updates.readAt = new Date();
    }
    if (snoozedUntil !== undefined) {
      updates.snoozedUntil = snoozedUntil ? new Date(snoozedUntil) : null;
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error("Update notification:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
