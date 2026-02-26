import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        tasks: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Get clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company } = body;
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    let slug = generateSlug();
    while (await prisma.client.findUnique({ where: { slug } })) {
      slug = generateSlug();
    }
    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        company: company || null,
        slug,
      },
    });
    return NextResponse.json(client);
  } catch (error) {
    console.error("Create client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
