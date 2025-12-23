import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params?.id
  const STRAPI_INTERNAL = process.env.STRAPI_INTERNAL_URL || ''
  const STRAPI_TOKEN = process.env.STRAPI_TOKEN || ''

  if (!STRAPI_INTERNAL) {
    return NextResponse.json({ error: 'STRAPI_INTERNAL_URL not configured on server' }, { status: 500 })
  }

  try {
    const url = `${STRAPI_INTERNAL.replace(/\/$/, '')}/api/articles/${encodeURIComponent(id)}?populate=*`

    const headers: Record<string, string> = {}
    if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`

    const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' })

    const contentType = res.headers.get('content-type') || 'application/json'
    const body = await res.text()

    return new NextResponse(body, {
      status: res.status,
      headers: { 'content-type': contentType }
    })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Server proxy error fetching article:', err)
    return NextResponse.json({ error: err?.message || 'proxy error' }, { status: 500 })
  }
}
