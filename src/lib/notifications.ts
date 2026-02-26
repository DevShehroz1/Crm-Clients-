import { prisma } from "@/lib/db";

type CreateNotificationParams = {
  workspaceId: string;
  recipientEmail: string;
  type: string;
  entityType: string;
  entityId: string;
  actorEmail?: string;
  title: string;
  body?: string;
  url?: string;
};

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        workspaceId: params.workspaceId,
        recipientEmail: params.recipientEmail,
        type: params.type,
        entityType: params.entityType,
        entityId: params.entityId,
        actorEmail: params.actorEmail || null,
        title: params.title,
        body: params.body || null,
        url: params.url || null,
      },
    });
  } catch (e) {
    console.error("Create notification failed:", e);
  }
}
