import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { addChannelUpdate } from "@/lib/channel-updates";

const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: true,
        comments: {
          where: { parentCommentId: null },
          include: {
            mentions: true,
            reactions: true,
            replies: {
              include: { mentions: true, reactions: true },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        voiceNotes: true,
        attachments: true,
        dependencies: true,
        blockedBy: true,
        watchers: true,
        channel: { select: { id: true, name: true, color: true } },
      },
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    const fields = [
      "title", "description", "status", "priority", "assignee", "assigneeId",
      "reporterId", "startDate", "dueDate", "dueTime", "completedAt",
      "estimate", "timeTracked", "points", "orderIndex", "boardColumnId",
      "channelId", "customFields",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) {
        if (f === "startDate" || f === "dueDate" || f === "completedAt") {
          updates[f] = body[f] ? new Date(body[f]) : null;
        } else {
          updates[f] = body[f];
        }
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(task);
    }

    const prev = { ...task };
    const updated = await prisma.task.update({
      where: { id },
      data: updates,
      include: {
        subtasks: true,
        comments: {
          where: { parentCommentId: null },
          include: {
            mentions: true,
            reactions: true,
            replies: {
              include: { mentions: true, reactions: true },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        voiceNotes: true,
        attachments: true,
        dependencies: true,
        blockedBy: true,
        watchers: true,
        channel: { select: { id: true, name: true } },
      },
    });

    if (task.channelId) {
      if (updates.status !== undefined && updates.status !== prev.status) {
        await addChannelUpdate({
          channelId: task.channelId,
          type: "status_changed",
          entityType: "task",
          entityId: id,
          body: `Status changed: ${prev.status} → ${updates.status}`,
        });
      }
      if (updates.assignee !== undefined && updates.assignee !== prev.assignee) {
        const newAssignee = updates.assignee as string | null;
        await addChannelUpdate({
          channelId: task.channelId,
          type: "assigned",
          entityType: "task",
          entityId: id,
          body: newAssignee ? `Assigned to ${newAssignee}` : "Unassigned",
        });
      }
      if (updates.dueDate !== undefined && updates.dueDate !== prev.dueDate) {
        await addChannelUpdate({
          channelId: task.channelId,
          type: "due_date_changed",
          entityType: "task",
          entityId: id,
          body: "Due date updated",
        });
      }
    }

    if (updates.assignee !== undefined && updates.assignee !== prev.assignee) {
      const newAssignee = updates.assignee as string | null;
      if (newAssignee) {
        await createNotification({
          workspaceId: task.workspaceId,
          recipientEmail: newAssignee,
          type: "ASSIGNED",
          entityType: "task",
          entityId: id,
          actorEmail: undefined,
          title: `Assigned to ${task.title}`,
          body: `You were assigned to this task`,
          url: `${APP_URL}/app/tasks?task=${id}`,
        });
      }
    }

    await logActivity({
      workspaceId: task.workspaceId,
      entityType: "task",
      entityId: id,
      actionType: "updated",
      oldValue: updates,
      newValue: Object.fromEntries(
        Object.keys(updates).map((k) => [k, (updated as Record<string, unknown>)[k]])
      ),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    await prisma.task.delete({ where: { id } });
    await logActivity({
      workspaceId: task.workspaceId,
      entityType: "task",
      entityId: id,
      actionType: "deleted",
      oldValue: { title: task.title },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
