import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { team: { select: { id: true, name: true } } },
    });
    if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 410 });
    }
    return NextResponse.json({
      email: invite.email,
      teamId: invite.team.id,
      teamName: invite.team.name,
    });
  } catch (error) {
    console.error("Get invite:", error);
    return NextResponse.json({ error: "Failed to fetch invite" }, { status: 500 });
  }
}
