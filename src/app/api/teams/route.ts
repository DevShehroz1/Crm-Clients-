import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: true,
        channels: true,
        tasks: true,
        _count: { select: { members: true, tasks: true, channels: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Get teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerEmail, ownerName } = body;
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const team = await prisma.team.create({
      data: {
        name,
        members: ownerEmail
          ? {
              create: {
                email: ownerEmail,
                name: ownerName || null,
              },
            }
          : undefined,
        channels: {
          create: { name: "general" },
        },
      },
      include: { members: true, channels: true },
    });
    return NextResponse.json(team);
  } catch (error) {
    console.error("Create team:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
