'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';

// Graphique (chargement dynamique)
const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

// PDF (chargé uniquement côté client)
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
  const tableRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    if (password === 'bf2025') setAuthenticated(true);
    else alert('Mot de passe incorrect');
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

  const fetchData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          const formatted = json.map((item: any) => ({
            date: new Date(item.timestamp || item.receivedAt).toLocaleString(),
            riviere: item.riviere || 'N/A',
            adresse: item.adresse || 'N/A',
            nom_resp: item.nom_resp || 'N/A',
            estimation: item.estimation ?? 0,
            niveauEau: item.niveauEau ?? 0,
            niveau: item.niveau ?? 1,
          }));
          setData(formatted);
          localStorage.setItem('eau-data', JSON.stringify(formatted));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('eau-data');
        if (saved) setData(JSON.parse(saved));
      });
  };

  // Mise à jour automatique du tableau
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300); // 0.3 seconde
    return () => clearInterval(interval);
  }, []);

  if (!authenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <img src="/logo-user.png" alt="User Logo" style={{ width: 80 }} />
        <h2>Authentification</h2>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={() => setPassword('')}>Effacer</button>
        <button onClick={() => setDarkMode(!darkMode)}>Mode {darkMode ? 'Jour' : 'Sombre'}</button>
        <p><a href="#">Mot de passe oublié ?</a></p>
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
              <th>Niveau (capteur)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr
                key={idx}
                style={{
                  background:
                    entry.niveau === 3
                      ? '#ffcccc'
                      : entry.niveau === 2
                      ? '#fff3cd'
                      : '#d1ecf1',
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
    </div>
  );
};

export default Dashboard;
