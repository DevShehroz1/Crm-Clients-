import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, teamId, priority, dueDate, assignee } = body;
    if (!title || !teamId) {
      return NextResponse.json(
        { error: "Title and teamId are required" },
        { status: 400 }
      );
    }
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        teamId,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee: assignee || null,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
