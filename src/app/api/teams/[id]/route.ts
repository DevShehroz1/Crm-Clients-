import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
        channels: true,
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            comments: true,
            voiceNotes: true,
            attachments: true,
          },
        },
      },
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json(team);
  } catch (error) {
    console.error("Get team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
