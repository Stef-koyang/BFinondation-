// pages/api/data.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'database.json');

// Créer dossier data si inexistant
if (!fs.existsSync(path.dirname(dataFile))) {
  fs.mkdirSync(path.dirname(dataFile));
}

// Lire les données stockées
function readData() {
  if (fs.existsSync(dataFile)) {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

// Sauvegarder les données
function saveData(data: any[]) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const existing = readData();
    const newEntry = { ...req.body, timestamp: new Date().toISOString() };
    existing.push(newEntry);
    saveData(existing);
    return res.status(200).json({ message: 'Enregistrement effectué' });
  } else if (req.method === 'GET') {
    const entries = readData();
    return res.status(200).json(entries);
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
