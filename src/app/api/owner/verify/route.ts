import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const secret = process.env.FLUX_OWNER_KEY;

  if (!secret) {
    return NextResponse.json({ ok: true }); // No secret set = allow access (dev mode)
  }
  if (key === secret) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 403 });
}
