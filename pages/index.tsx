'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { saveAs } from 'file-saver';
import TableauDonnées from '../components/TableauDonnées';

// Charger Chart dynamiquement
const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

let html2pdf: any = null;
if (typeof window !== 'undefined') {
  html2pdf = require('html2pdf.js');
}

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
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
    fetch('/api/data')
      .then(res => res.json())
      .then((json) => {
        const headers = ['Date', 'Rivière', 'Adresse', 'Responsable', 'Estimation', "Niveau d'eau (cm)", 'Niveau'];
        const rows = json.map((item: any) => [
          new Date(item.timestamp || item.receivedAt).toLocaleString(),
          item.riviere || 'N/A',
          item.adresse || 'N/A',
          item.nom_resp || 'N/A',
          item.estimation ?? 0,
          item.niveauEau ?? 0,
          item.niveau ?? 1,
        ]);
        const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'donnees_inondation.csv');
      });
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
    <div style={{
      padding: '2rem',
      background: darkMode ? '#222' : '#fff',
      color: darkMode ? '#fff' : '#000',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
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
        <TableauDonnées />
      </div>

      <h2 style={{ marginTop: '2rem' }}>Graphique de l'évolution</h2>
      <Chart data={[]} />
    </div>
  );
};

export default Dashboard;
