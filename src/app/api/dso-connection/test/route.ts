import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl, token, tariffUrl, energyUrl } = body || {};

    if (!baseUrl || !token) {
      return NextResponse.json(
        { isValid: false, message: 'URL de connexion et token sont requis' },
        { status: 400 }
      );
    }

    // Delegate to backend dso-service (which handles both mock tokens and real DSO)
    const response = await fetch(`${BACKEND_URL}/api/dso/connections/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl, token, tariffUrl, energyUrl }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.isValid) {
      return NextResponse.json(
        { isValid: false, message: data?.message || 'Connexion invalide' },
        { status: response.ok ? 200 : response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    const reason =
      error?.cause?.code === 'ECONNREFUSED'
        ? 'Backend DSO injoignable'
        : error?.name === 'TimeoutError'
          ? 'Timeout — le backend ne répond pas'
          : error?.message || 'Erreur de connexion';
    return NextResponse.json(
      { isValid: false, message: reason },
      { status: 502 }
    );
  }
}
