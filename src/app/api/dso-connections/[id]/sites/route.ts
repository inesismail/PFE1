import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Forward auth headers from the incoming request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const response = await fetch(`${API_BASE_URL}/dso/connections/${id}/sites`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: { 'content-type': contentType },
    });
  } catch (error: any) {
    console.error('DSO sites proxy error:', error?.message);
    return NextResponse.json(
      { message: 'Failed to fetch DSO sites', error: error?.message },
      { status: 502 },
    );
  }
}
