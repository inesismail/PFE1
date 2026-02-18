import { NextResponse } from 'next/server';

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

    let baseUrlObj: URL;
    try {
      baseUrlObj = new URL(baseUrl);
    } catch {
      return NextResponse.json(
        { isValid: false, message: 'URL de connexion invalide' },
        { status: 400 }
      );
    }

    const headers = { 'X-API-TOKEN': token };

    // 1. Test la connexion de base
    let baseResponse: Response;
    try {
      baseResponse = await fetch(baseUrlObj.toString(), {
        headers,
        signal: AbortSignal.timeout(10000),
      });
    } catch (fetchErr: any) {
      const reason =
        fetchErr?.cause?.code === 'ECONNREFUSED'
          ? 'Serveur DSO injoignable (connexion refusée)'
          : fetchErr?.name === 'TimeoutError'
            ? 'Timeout — le serveur DSO ne répond pas'
            : `Impossible de joindre le serveur: ${fetchErr?.message || 'erreur réseau'}`;
      return NextResponse.json(
        { isValid: false, message: reason },
        { status: 502 }
      );
    }

    if (!baseResponse.ok) {
      return NextResponse.json(
        { isValid: false, message: `Authentification échouée (HTTP ${baseResponse.status})` },
        { status: 401 }
      );
    }

    let data: any = {};
    try {
      data = await baseResponse.json();
    } catch {
      // La réponse n'est pas du JSON — ce n'est pas bloquant
    }

    const testedUrls: string[] = [];
    const failedUrls: string[] = [];

    // 2. Récupère la liste des sites pour tester tariff/energy avec un site_id valide
    let sitesData: any[] = [];
    try {
      const sitesUrl = new URL('/sites', baseUrlObj).toString();
      const sitesResponse = await fetch(sitesUrl, { headers });
      if (sitesResponse.ok) {
        const sitesJson = await sitesResponse.json();
        sitesData = sitesJson?.sites || [];
        testedUrls.push('sites');
      }
    } catch (err) {
      // Sites endpoint est optionnel
    }

    // 3. Test tariff avec le premier site disponible
    if (tariffUrl && tariffUrl.trim() && sitesData.length > 0) {
      try {
        const siteId = sitesData[0].id;
        const tariffUrlWithParam = `${tariffUrl}?site_id=${siteId}`;
        const tariffResponse = await fetch(tariffUrlWithParam, { headers });
        if (tariffResponse.ok) {
          testedUrls.push('tarifs');
        } else {
          failedUrls.push('tarifs');
        }
      } catch (err) {
        failedUrls.push('tarifs');
      }
    }

    // 4. Test energy avec le premier site disponible
    if (energyUrl && energyUrl.trim() && sitesData.length > 0) {
      try {
        const siteId = sitesData[0].id;
        const energyUrlWithParam = `${energyUrl}?site_id=${siteId}`;
        const energyResponse = await fetch(energyUrlWithParam, { headers });
        if (energyResponse.ok) {
          testedUrls.push('énergie');
        } else {
          failedUrls.push('énergie');
        }
      } catch (err) {
        failedUrls.push('énergie');
      }
    }

    return NextResponse.json({
      isValid: true,
      message: data?.message || 'Connexion valide',
      testedUrls,
      failedUrls,
      sites: sitesData,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isValid: false, message: error?.message || 'Erreur de connexion' },
      { status: 500 }
    );
  }
}
