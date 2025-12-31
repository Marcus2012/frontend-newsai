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

    // Configuración fija para EasyPromos
    const apiToken = process.env.EASYPROMOS_API_TOKEN || ''
    const autologinUrl = 'https://api.easypromosapp.com/v2/users/autologin/1005559'
    const promoBase = 'https://a.cstmapp.com/p/1005559'

    // Ensure external_id
    if (!data.external_id) data.external_id = String(Date.now())

    // No registrar en Strapi, solo EasyPromos
    let strapiResult: any = { success: false, note: 'NO_STRAPI_USED' }

    // Siempre enviar el payload completo para registro
    let respJson: any
    try {
      respJson = await _postAutologin(autologinUrl, apiToken, data)
    } catch (err: any) {
      return NextResponse.json({ register: false, lt: null, promo_url: null, raw: { error: err.message || err, status: err?.status, body: err?.body } }, { status: 502 })
    }

    const register = respJson?.registered ?? false
    const lt = respJson?.lt ?? null
    const promoUrl = lt ? `${promoBase}?lt=${encodeURIComponent(lt)}` : null

    return NextResponse.json({ strapi: strapiResult, easypromo: { register, lt, promo_url: promoUrl, raw: respJson } })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('easypromo register error', err)
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 })
  }
}
