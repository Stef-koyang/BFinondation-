import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const isVercel = !!process.env.VERCEL;

let memoryStore: any[] = [];

const dataFile = path.join(process.cwd(), 'data', 'database.json');

// Créer le dossier data localement s’il n’existe pas
if (!isVercel && !fs.existsSync(path.dirname(dataFile))) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
}

// Lire les données
function readData(): any[] {
  if (isVercel) {
    return memoryStore;
  }

  if (fs.existsSync(dataFile)) {
    const raw = fs.readFileSync(dataFile, 'utf8');
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
  if (isVercel) {
    memoryStore = data;
  } else {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  }
}

// Fonction pour valider et convertir un champ en nombre
function parseNumber(value: any): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && !isNaN(Number(value))) return Number(value);
  return null;
}

// Handler principal
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

      console.log('Reçu riviere:', riviere);

      // Validation et conversion des nombres
      const distanceNum = parseNumber(distance);
      const temps12Num = parseNumber(temps12);
      const temps23Num = parseNumber(temps23);
      const estimationNum = parseNumber(estimation);

      if (
        !riviere ||
        !adresse ||
        !nom_resp ||
        !tel ||
        distanceNum === null ||
        temps12Num === null ||
        temps23Num === null ||
        estimationNum === null
      ) {
        return res.status(400).json({ error: 'Champs manquants ou invalides' });
      }

      const existing = readData();

      const newEntry = {
        riviere,
        adresse,
        distance: distanceNum,
        nom_resp,
        tel,
        temps12: temps12Num,
        temps23: temps23Num,
        estimation: estimationNum,
        timestamp: timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
      };

      existing.push(newEntry);
      saveData(existing);

      return res.status(200).json({ message: 'Données enregistrées avec succès', data: newEntry });

    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur', details: (error as Error).message });
    }
  }

  if (req.method === 'GET') {
    try {
      const entries = readData();
      return res.status(200).json(entries);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur de lecture', details: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
