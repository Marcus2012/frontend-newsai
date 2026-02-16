import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { date } = req.query;
    const url = new URL(`${process.env.FASTAPI_URL}/football/public/brasil-serie-a/fixtures`);
    if (date) url.searchParams.append('date', String(date));
    const apiRes = await fetch(url.toString());
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener fixtures de Brasil Serie A' });
  }
}
