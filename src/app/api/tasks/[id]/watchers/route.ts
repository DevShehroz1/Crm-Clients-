import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const watchers = await prisma.watcher.findMany({
      where: { taskId },
    });
    return NextResponse.json(watchers);
  } catch (error) {
    console.error("List watchers:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { memberId } = body;
    if (!memberId) {
      return NextResponse.json({ error: "memberId required" }, { status: 400 });
    }
    const existing = await prisma.watcher.findFirst({
      where: { taskId, memberId },
    });
    if (existing) {
      await prisma.watcher.delete({ where: { id: existing.id } });
      return NextResponse.json({ watching: false });
    }
    const watcher = await prisma.watcher.create({
      data: { taskId, memberId },
    });
    return NextResponse.json({ ...watcher, watching: true });
  } catch (error) {
    console.error("Toggle watcher:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
