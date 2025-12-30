import { NextResponse } from 'next/server'

async function _postAutologin(url: string, apiToken: string, body: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    // no-cache behavior for registration
    cache: 'no-store'
  })

  if (!res.ok) {
    const text = await res.text()
    const err: any = new Error('EasyPromos request failed')
    err.status = res.status
    err.body = text
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  const txt = await res.text()
  try { return JSON.parse(txt) } catch { return { raw: txt } }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const campaignId = process.env.EASYPROMOS_CAMPAIGN_ID || ''
    const apiToken = process.env.EASYPROMOS_API_TOKEN || ''
    const apiAutologin = process.env.EASYPROMOS_API_AUTLOGIN || ''
    const promoBase = process.env.EASYPROMOS_PROMO_BASE || ''

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || '').replace(/\/$/, '')

    if (!apiAutologin || !promoBase) {
      return NextResponse.json({ error: 'EASYPROMOS_API_AUTLOGIN or EASYPROMOS_PROMO_BASE not configured' }, { status: 500 })
    }

    if (!campaignId || !apiToken) {
      return NextResponse.json({ error: 'EASYPROMOS_CAMPAIGN_ID or EASYPROMOS_API_TOKEN not configured' }, { status: 500 })
    }

    // Ensure external_id
    if (!data.external_id) data.external_id = String(Date.now())

    const autologinUrl = apiAutologin.replace('{campaign_id}', encodeURIComponent(campaignId))

    // Intentar registrar en Strapi primero (si tenemos URL y email)
    let strapiResult: any = { success: false }
    if (strapiBase && data.email) {
      try {
        const username = data.nickname || (String(data.email).split('@')[0]) || `user_${Date.now()}`
        const password = `auto_${Math.random().toString(36).slice(2,10)}_${Date.now()}`
        const res = await fetch(`${strapiBase}/api/auth/local/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email: data.email, password })
        })
        const body = await res.json().catch(() => null)
        if (res.ok) {
          strapiResult = { success: true, data: body }
        } else {
          strapiResult = { success: false, status: res.status, error: body }
        }
      } catch (err: any) {
        strapiResult = { success: false, error: err?.message || String(err) }
      }
    } else {
      strapiResult = { success: false, note: 'NO_STRAPI_OR_EMAIL' }
    }

    // Paso 1: intento de auth/autologin en EasyPromos (no crítico)
    try {
      await _postAutologin(autologinUrl, apiToken, { external_id: data.external_id })
    } catch (err) {
      // ignore initial autologin failure
    }

    // Paso 2: register / autologin con datos completos
    let respJson: any
    try {
      respJson = await _postAutologin(autologinUrl, apiToken, data)
    } catch (err: any) {
      return NextResponse.json({ register: false, lt: null, promo_url: null, raw: { error: err.message || err, status: err?.status, body: err?.body } }, { status: 502 })
    }

    const register = respJson?.register ?? false
    const lt = respJson?.lt ?? null
    const promoUrl = lt ? `${promoBase.replace('{campaign_id}', encodeURIComponent(campaignId))}?lt=${encodeURIComponent(lt)}` : null

    return NextResponse.json({ strapi: strapiResult, easypromo: { register, lt, promo_url: promoUrl, raw: respJson } })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('easypromo register error', err)
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 })
  }
}
