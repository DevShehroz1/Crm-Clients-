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

    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { team: { select: { id: true, name: true } } },
    });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }

    const existingMember = await prisma.teamMember.findFirst({
      where: { teamId: invite.teamId, email: invite.email },
    });
    if (existingMember) {
      await prisma.teamInvite.delete({ where: { id: invite.id } }).catch(() => {});
      return NextResponse.json({
        team: { id: invite.team.id, name: invite.team.name },
        alreadyMember: true,
      });
    }

    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invite.teamId,
          email: invite.email,
          name: name?.trim() || null,
        },
      }),
      prisma.teamInvite.delete({ where: { id: invite.id } }),
    ]);

    return NextResponse.json({
      team: { id: invite.team.id, name: invite.team.name },
      alreadyMember: false,
    });
  } catch (error) {
    console.error("Accept invite:", error);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
