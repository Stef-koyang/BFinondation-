
import type { NextApiRequest, NextApiResponse } from 'next';

let database: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const entry = { ...req.body, timestamp: new Date().toISOString() };
    database.push(entry);
    return res.status(200).json({ message: 'ok' });
  } else if (req.method === 'GET') {
    return res.status(200).json(database);
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
