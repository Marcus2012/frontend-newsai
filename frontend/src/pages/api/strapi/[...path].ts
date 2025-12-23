import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { path = [] } = req.query as { path: string[] }
    const targetBase = (process.env.STRAPI_INTERNAL_URL || '').replace(/\/$/, '')
    if (!targetBase) {
      res.status(500).json({ error: 'STRAPI_INTERNAL_URL not configured on server' })
      return
    }

    const pathPart = Array.isArray(path) ? path.join('/') : String(path)
    // Recreate query string
    const url = new URL(`${targetBase}/${pathPart}`)
    const originalUrl = req.url || ''
    const qIndex = originalUrl.indexOf('?')
    if (qIndex >= 0) {
      url.search = originalUrl.substring(qIndex + 1)
    }

    const headers: Record<string,string> = {}
    // Attach server-side token if configured
    if (process.env.STRAPI_TOKEN) headers['Authorization'] = `Bearer ${process.env.STRAPI_TOKEN}`

    // Forward GET only (safe for public endpoints). You can extend for POST if needed.
    const fetchRes = await fetch(url.toString(), { method: req.method, headers })

    const contentType = fetchRes.headers.get('content-type') || 'application/json'
    res.status(fetchRes.status)
    res.setHeader('content-type', contentType)

    const buffer = await fetchRes.arrayBuffer()
    const arr = Buffer.from(buffer)
    res.send(arr)
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Strapi proxy error', err)
    res.status(500).json({ error: err?.message || 'proxy error' })
  }
}
