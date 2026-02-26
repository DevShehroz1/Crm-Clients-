import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

const APP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, taskId, author, authorEmail, parentCommentId, mentions } = body;
    if (!content || !taskId || !author) {
      return NextResponse.json(
        { error: "content, taskId, and author are required" },
        { status: 400 }
      );
    }
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const comment = await prisma.taskComment.create({
      data: {
        content: content.trim(),
        taskId,
        author,
        authorEmail: authorEmail || null,
        parentCommentId: parentCommentId || null,
        mentions:
          Array.isArray(mentions) && mentions.length > 0
            ? {
                create: mentions.map((email: string) => ({ mentionedEmail: email })),
              }
            : undefined,
      },
      include: {
        mentions: true,
        reactions: true,
        replies: { include: { mentions: true, reactions: true } },
      },
    });

    const mentionedEmails = Array.isArray(mentions) ? mentions : [];
    for (const email of mentionedEmails) {
      if (email && email !== authorEmail) {
        await createNotification({
          workspaceId: task.workspaceId,
          recipientEmail: email,
          type: "MENTION",
          entityType: "task",
          entityId: taskId,
          actorEmail: authorEmail || author,
          title: `${author} mentioned you`,
          body: content.slice(0, 100),
          url: `${APP_URL}/app/tasks?task=${taskId}`,
        });
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Create comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
