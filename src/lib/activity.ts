import { prisma } from "@/lib/db";

export async function logActivity(params: {
  workspaceId: string;
  entityType: string;
  entityId: string;
  actionType: string;
  oldValue?: unknown;
  newValue?: unknown;
  actorId?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        workspaceId: params.workspaceId,
        entityType: params.entityType,
        entityId: params.entityId,
        actionType: params.actionType,
        oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
        newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
        actorId: params.actorId ?? null,
      },
    });
  } catch (e) {
    console.error("Activity log failed:", e);
  }
}
