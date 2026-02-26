import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

const DEFAULT_STATUSES = ["Backlog", "Todo", "In Progress", "Blocked", "Done"];

async function getNextShortCode(workspaceId: string): Promise<string> {
  const last = await prisma.task.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: { shortCode: true },
  });
  if (!last?.shortCode) return "FLX-1";
  const m = last.shortCode.match(/-(\d+)$/);
  const n = m ? parseInt(m[1], 10) + 1 : 1;
  return `FLX-${n}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const channelId = searchParams.get("channelId");
    const assigneeId = searchParams.get("assigneeId");
    const status = searchParams.get("status");
    const view = searchParams.get("view") || "list";

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    const where: Record<string, unknown> = { workspaceId };
    if (channelId) where.channelId = channelId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        subtasks: true,
        attachments: true,
        channel: { select: { id: true, name: true, color: true } },
      },
      orderBy: [
        { orderIndex: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("List tasks:", error);
    return NextResponse.json({ error: "Failed to list tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      workspaceId,
      channelId,
      status,
      priority,
      dueDate,
      dueTime,
      startDate,
      assignee,
      assigneeId,
      reporterId,
      estimate,
      points,
      subtasks,
    } = body;

    if (!title || !workspaceId) {
      return NextResponse.json(
        { error: "title and workspaceId are required" },
        { status: 400 }
      );
    }

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { channels: true },
    });
    if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const chId = channelId || ws.channels[0]?.id;
    const shortCode = await getNextShortCode(workspaceId);

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        workspaceId,
        channelId: chId,
        shortCode,
        status: status || "TODO",
        priority: priority || "NORMAL",
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime: dueTime || null,
        startDate: startDate ? new Date(startDate) : null,
        assignee: assignee || null,
        assigneeId: assigneeId || null,
        reporterId: reporterId || null,
        estimate: estimate ?? null,
        points: points ?? null,
        subtasks: Array.isArray(subtasks) && subtasks.length > 0
          ? {
              create: subtasks.map((s: { title: string }, i: number) => ({
                title: typeof s === "string" ? s : s?.title || "",
                orderIndex: i,
              })),
            }
          : undefined,
      },
      include: {
        subtasks: true,
        channel: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      workspaceId,
      entityType: "task",
      entityId: task.id,
      actionType: "created",
      newValue: { title: task.title, shortCode: task.shortCode },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
