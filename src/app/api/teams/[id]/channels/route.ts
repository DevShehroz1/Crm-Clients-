import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const channel = await prisma.channel.create({
      data: { name: name.trim(), workspaceId: id },
    });
    return NextResponse.json(channel);
  } catch (error) {
    console.error("Create channel:", error);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}
