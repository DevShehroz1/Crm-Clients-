import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email, name } = body;
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const member = await prisma.teamMember.create({
      data: {
        teamId: id,
        email: email.trim(),
        name: name?.trim() || null,
      },
    });
    return NextResponse.json(member);
  } catch (error) {
    console.error("Add member:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
