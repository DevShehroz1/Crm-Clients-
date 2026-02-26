import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { title, assigneeId, dueDate } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const maxOrder = await prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });
    const orderIndex = (maxOrder?.orderIndex ?? -1) + 1;

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title: title.trim(),
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        orderIndex,
      },
    });

    await logActivity({
      workspaceId: task.workspaceId,
      entityType: "subtask",
      entityId: subtask.id,
      actionType: "created",
      newValue: { title: subtask.title },
    });

    return NextResponse.json(subtask);
  } catch (error) {
    console.error("Create subtask:", error);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}
