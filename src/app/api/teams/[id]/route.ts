import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: true,
        channels: true,
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            subtasks: true,
            comments: true,
            voiceNotes: true,
            attachments: true,
            dependencies: true,
            blockedBy: true,
          },
        },
      },
    });
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Get workspace:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}
