import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace";
}

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: true,
        channels: true,
        tasks: true,
        _count: { select: { members: true, tasks: true, channels: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Get workspaces:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerEmail, ownerName } = body;
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let i = 1;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        members: ownerEmail
          ? {
              create: {
                email: ownerEmail,
                name: ownerName || null,
                role: "OWNER",
              },
            }
          : undefined,
        channels: {
          create: { name: "general" },
        },
      },
      include: { members: true, channels: true },
    });
    await logActivity({
      workspaceId: workspace.id,
      entityType: "workspace",
      entityId: workspace.id,
      actionType: "created",
      newValue: { name: workspace.name },
    });
    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Create workspace:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
