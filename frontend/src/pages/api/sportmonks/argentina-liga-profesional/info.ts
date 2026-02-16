import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiRes = await fetch(`${process.env.FASTAPI_URL}/football/public/argentina-liga-profesional/info`);
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener info de Argentina Liga Profesional' });
  }
}
