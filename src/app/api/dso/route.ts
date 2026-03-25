// app/api/dso/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");
    const siteId = searchParams.get("site_id");
    const connectionId = searchParams.get("connection_id");

    if (!endpoint || !siteId || !connectionId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    if (!BACKEND_URL) {
      return NextResponse.json({ error: "Missing BACKEND_URL env var" }, { status: 500 });
    }

    // ─── JWT depuis Authorization header (envoyé par fetchWithAuth côté client) ──
    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!jwt) {
      return NextResponse.json({ error: "No JWT — Authorization header missing" }, { status: 401 });
    }

    // ─── Appel direct au DSO service (gère mock + réel en interne) ────────────
    const targetUrl = `${BACKEND_URL}/api/dso/connections/${encodeURIComponent(connectionId)}/${encodeURIComponent(endpoint)}?site_id=${encodeURIComponent(siteId)}`;

    const dsoRes = await fetch(targetUrl, {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    });

    const dsoText = await dsoRes.text().catch(() => "");

    let json: any = null;
    try { json = JSON.parse(dsoText); } catch { json = { raw: dsoText }; }

    return NextResponse.json(json, { status: dsoRes.status });

  } catch (e: any) {
    console.error("[DSO] 💥", e?.message);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}