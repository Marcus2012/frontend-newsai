import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { season_id } = req.query;
    const url = new URL(`${process.env.FASTAPI_URL}/football/public/argentina-liga-profesional/standings`);
    if (season_id) url.searchParams.append('season_id', String(season_id));
    const apiRes = await fetch(url.toString());
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener standings de Argentina Liga Profesional' });
  }
}
