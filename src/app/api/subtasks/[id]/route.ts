import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    });
    if (!subtask) return NextResponse.json({ error: "Subtask not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.isDone !== undefined) updates.isDone = body.isDone;
    if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.orderIndex !== undefined) updates.orderIndex = body.orderIndex;

    const updated = await prisma.subtask.update({
      where: { id },
      data: updates,
    });

    await logActivity({
      workspaceId: subtask.task.workspaceId,
      entityType: "subtask",
      entityId: id,
      actionType: "updated",
      newValue: updates,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update subtask:", error);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    });
    if (!subtask) return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    await prisma.subtask.delete({ where: { id } });
    await logActivity({
      workspaceId: subtask.task.workspaceId,
      entityType: "subtask",
      entityId: id,
      actionType: "deleted",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subtask:", error);
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}
