import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL}`
  : "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, email, inviterName } = body;
    if (!teamId || !email?.trim()) {
      return NextResponse.json({ error: "teamId and email are required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: teamId } });
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const existingMember = await prisma.member.findFirst({
      where: { workspaceId: teamId, email: email.trim().toLowerCase() },
    });
    if (existingMember) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: teamId,
        email: email.trim().toLowerCase(),
        token,
        expiresAt,
      },
    });

    const joinUrl = `${APP_URL}/join/${token}`;
    const emailResult = await sendInviteEmail({
      to: email.trim(),
      teamName: workspace.name,
      inviterName: inviterName || undefined,
      joinUrl,
    });

    return NextResponse.json({
      id: invite.id,
      email: invite.email,
      expiresAt: invite.expiresAt,
      emailSent: emailResult.ok,
      joinUrl: !emailResult.ok ? joinUrl : undefined,
      emailError: !emailResult.ok && "error" in emailResult ? emailResult.error : undefined,
    });
  } catch (error) {
    console.error("Create invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
