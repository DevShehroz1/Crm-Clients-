import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = await prisma.client.findUnique({
      where: { slug },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            comments: { orderBy: { createdAt: "asc" } },
            voiceNotes: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error("Get client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}
