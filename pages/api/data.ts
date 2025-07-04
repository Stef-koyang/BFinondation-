import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'database.json');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(path.dirname(dataFile))) {
  fs.mkdirSync(path.dirname(dataFile));
}

// Lire les données existantes
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
    try {
      const {
        riviere,
        adresse,
        distance,
        nom_resp,
        tel,
        temps12,
        temps23,
        estimation,
        timestamp,
      } = req.body;

      // Validation minimale
      if (
        !riviere || !adresse || !nom_resp || !tel ||
        typeof distance !== 'number' ||
        typeof temps12 !== 'number' ||
        typeof temps23 !== 'number' ||
        typeof estimation !== 'number'
      ) {
        return res.status(400).json({ error: 'Champs manquants ou invalides' });
      }

      const existing = readData();

      const newEntry = {
        riviere,
        adresse,
        distance,
        nom_resp,
        tel,
        temps12,
        temps23,
        estimation,
        timestamp: timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString()
      };

      existing.push(newEntry);
      saveData(existing);

      return res.status(200).json({ message: 'Données enregistrées avec succès', data: newEntry });

    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur', details: error });
    }
  } else if (req.method === 'GET') {
    const entries = readData();
    return res.status(200).json(entries);
  } else {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}
