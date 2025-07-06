'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';

const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

let html2pdf: any = null;
if (typeof window !== 'undefined') {
  html2pdf = require('html2pdf.js');
}

interface DonneeInondation {
  date: string;
  riviere: string;
  adresse: string;
  nom_resp: string;
  estimation: number;
  niveauEau: number;
  niveau: number;
}

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<DonneeInondation[]>([]);
  const [paused, setPaused] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchData = async () => {
    if (paused) return;

    try {
      const res = await fetch('https://b-finondation.vercel.app/api/data');
      const json = await res.json();

      if (Array.isArray(json)) {
        const formatted = json.map((item: any) => {
          const estimation = item.estimation ?? 0;
          const niveau = estimation >= 80 ? 3 : estimation >= 50 ? 2 : 1;

          if (niveau === 3 || estimation > 70) {
            playAlert(); // Alerte si estimation élevée
          }

          return {
            date: new Date(item.timestamp || item.receivedAt).toLocaleString(),
            riviere: item.riviere || 'N/A',
            adresse: item.adresse || 'N/A',
            nom_resp: item.nom_resp || 'N/A',
            estimation,
            niveauEau: item.niveauEau ?? estimation, // estimation = niveau eau
            niveau,
          };
        });

        setData(formatted);
        localStorage.setItem('eau-data', JSON.stringify(formatted));
      }
    } catch (error) {
      const saved = localStorage.getItem('eau-data');
      if (saved) setData(JSON.parse(saved));
    }
  };

  const playAlert = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleExportPDF = () => {
    if (html2pdf && tableRef.current) {
      html2pdf()
        .from(tableRef.current)
        .set({
          margin: 1,
          filename: 'rapport_inondation.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'landscape' },
        })
        .save();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Rivière', 'Adresse', 'Responsable', 'Estimation', "Niveau d'eau (cm)", 'Niveau'];
    const rows = data.map((item) => [
      item.date,
      item.riviere,
      item.adresse,
      item.nom_resp,
      item.estimation,
      item.niveauEau,
      item.niveau,
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'donnees_inondation.csv');
  };

  const handlePrint = () => {
    const printContent = tableRef.current?.innerHTML;
    const win = window.open('', '', 'width=900,height=700');
    if (win && printContent) {
      win.document.write('<html><head><title>Impression</title></head><body>');
      win.document.write(printContent);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  useEffect(() => {
    fetchData(); // 1ère fois
    const interval = setInterval(fetchData, 1000); // toutes les 1s
    return () => clearInterval(interval);
  }, [paused]);

  if (!authenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <img src="../IMG/Logo_bf.png" alt="User Logo" style={{ width: 80 }} />
        <h2>Authentification</h2>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={() => setAuthenticated(password === 'bf2025')}>Se connecter</button>
        <button onClick={() => setPassword('')}>Effacer</button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        background: darkMode ? '#222' : '#fff',
        color: darkMode ? '#fff' : '#000',
      }}
    >
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-gauche.png" alt="Logo Gauche" style={{ height: 50 }} />
        <h1>Système de suivi d'inondation</h1>
        <img src="/logo-droit.png" alt="Logo Droit" style={{ height: 50 }} />
      </div>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={handleExportPDF}>Exporter PDF</button>
        <button onClick={handleExportCSV}>Exporter CSV</button>
        <button onClick={handlePrint}>Imprimer</button>
        <button onClick={() => setDarkMode(!darkMode)}>Mode {darkMode ? 'Jour' : 'Sombre'}</button>
        <button onClick={() => setPaused(!paused)} style={{ background: paused ? 'red' : 'green', color: '#fff' }}>
          {paused ? 'Reprendre' : 'Pause'}
        </button>
      </div>

      <div ref={tableRef}>
        <table border={1} cellPadding={6} cellSpacing={0} style={{ width: '100%', background: '#f8f9fa' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Rivière</th>
              <th>Adresse</th>
              <th>Responsable</th>
              <th>Estimation</th>
              <th>Niveau d'eau (cm)</th>
              <th>Niveau</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr
                key={idx}
                style={{
                  background:
                    entry.niveau === 3
                      ? '#ff0000'
                      : entry.niveau === 2
                      ? '#fff3cd'
                      : '#d1ecf1',
                  color: entry.niveau === 3 ? '#fff' : undefined,
                  animation: entry.niveau === 3 ? 'flash 1s infinite' : undefined,
                }}
              >
                <td>{entry.date}</td>
                <td>{entry.riviere}</td>
                <td>{entry.adresse}</td>
                <td>{entry.nom_resp}</td>
                <td>{entry.estimation}</td>
                <td>{entry.niveauEau}</td>
                <td>{entry.niveau}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Graphique de l'évolution</h2>
      <Chart data={data} />

      <style>{`
        @keyframes flash {
          0% { background-color: #ff0000; }
          50% { background-color: #cc0000; }
          100% { background-color: #ff0000; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
