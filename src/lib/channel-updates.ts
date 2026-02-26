import { prisma } from "@/lib/db";

export async function addChannelUpdate(params: {
  channelId: string;
  type: string;
  entityType?: string;
  entityId?: string;
  body: string;
  actorEmail?: string;
}) {
  try {
    await prisma.channelUpdate.create({
      data: {
        channelId: params.channelId,
        type: params.type,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        body: params.body,
        actorEmail: params.actorEmail || null,
      },
    });
  } catch (e) {
    console.error("Channel update failed:", e);
  }
}
