import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json().catch(() => ({}));
    const { name } = body;

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: { select: { id: true, name: true } } },
    });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    const existingMember = await prisma.member.findFirst({
      where: { workspaceId: invite.workspaceId, email: invite.email },
    });
    if (existingMember) {
      await prisma.workspaceInvite.delete({ where: { id: invite.id } }).catch(() => {});
      return NextResponse.json({
        team: { id: invite.workspace.id, name: invite.workspace.name },
        alreadyMember: true,
      });
    }

    await prisma.$transaction([
      prisma.member.create({
        data: {
          workspaceId: invite.workspaceId,
          email: invite.email,
          name: name?.trim() || null,
        },
      }),
      prisma.workspaceInvite.delete({ where: { id: invite.id } }),
    ]);

    return NextResponse.json({
      team: { id: invite.workspace.id, name: invite.workspace.name },
      alreadyMember: false,
    });
  } catch (error) {
    console.error("Accept invite:", error);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
