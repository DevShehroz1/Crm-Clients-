import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { workspaceId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("List activity:", error);
    return NextResponse.json({ error: "Failed to list activity" }, { status: 500 });
  }
}
