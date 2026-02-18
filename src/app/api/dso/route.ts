import { NextResponse } from 'next/server';

const DSO_PUBLIC_API_BASE = 'http://localhost:9999';
const FALLBACK_TOKEN = 'xCeF9FfYok22BLI844lHtyLDloxGHOsrAPHyjLjFSCOAgGCdq2D070iK1rmUkwlF';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const siteId = searchParams.get('site_id');

  if (!endpoint || !siteId) {
    return NextResponse.json({ error: 'endpoint et site_id requis' }, { status: 400 });
  }

  if (endpoint !== 'energy' && endpoint !== 'tariff') {
    return NextResponse.json({ error: 'endpoint invalide' }, { status: 400 });
  }

  const token = process.env.DSO_API_TOKEN || FALLBACK_TOKEN;
  const url = new URL(endpoint, DSO_PUBLIC_API_BASE);
  url.searchParams.set('site_id', siteId);

  const res = await fetch(url.toString(), {
    headers: {
      'X-API-TOKEN': token,
    },
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type') || 'application/json';
  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      'content-type': contentType,
    },
  });
}
