import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const match = body.match || body;
    const PREDICT_API = process.env.PREDICT_API_BASE || process.env.NEXT_PUBLIC_PREDICT_API;

    if (PREDICT_API) {
      // Enviar como { match: ... } por compatibilidad con FastAPI que recibe un dict
      const upstreamUrl = `${PREDICT_API.replace(/\/$/, '')}/predict`;
      try {
        const res = await fetch(upstreamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ match }),
        });
        const text = await res.text();
        let payload: any = null;
        try { payload = JSON.parse(text); } catch (_e) { payload = text; }
        if (!res.ok) {
          console.error('[predict proxy] upstream error', { url: upstreamUrl, status: res.status, body: text });
          return NextResponse.json({ error: 'Upstream error', status: res.status, body: payload }, { status: 502 });
        }
        return NextResponse.json(payload, { status: 200 });
      } catch (err: any) {
        console.error('[predict proxy] request failed', { url: upstreamUrl, err: String(err) });
        return NextResponse.json({ error: String(err) }, { status: 500 });
      }
    }

    // Fallback simple if no external predict API configured
    const home = match.home_name || match.homeTeam || match.home || 'Home';
    const away = match.away_name || match.awayTeam || match.away || 'Away';
    const prediction = {
      winner: 'draw',
      scoreline: '1-1',
      confidence: 50,
      reasons: ['Predicción básica por falta de servicio IA', 'Datos insuficientes para ajuste'],
      summary: `Pronóstico reservado para ${home} vs ${away}`,
    };
    return NextResponse.json(prediction);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
