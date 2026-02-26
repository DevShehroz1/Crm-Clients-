import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientEmail = searchParams.get("recipientEmail");
    const workspaceId = searchParams.get("workspaceId");
    const tab = searchParams.get("tab") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    if (!recipientEmail || !workspaceId) {
      return NextResponse.json(
        { error: "recipientEmail and workspaceId required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      workspaceId,
      recipientEmail,
      OR: [
        { snoozedUntil: null },
        { snoozedUntil: { lt: new Date() } },
      ],
    };
    if (tab === "unread") {
      where.isRead = false;
    } else if (tab === "mentions") {
      where.type = "MENTION";
    } else if (tab === "assigned") {
      where.type = "ASSIGNED";
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        workspaceId,
        recipientEmail,
        isRead: false,
        OR: [
          { snoozedUntil: null },
          { snoozedUntil: { lt: new Date() } },
        ],
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("List notifications:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
