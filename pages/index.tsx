'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';

const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    if (password === 'bf2025') setAuthenticated(true);
    else alert('Mot de passe incorrect');
  };

  const addRow = () => {
    const niveau = Math.floor(Math.random() * 3) + 1;
    const newRow = {
      date: new Date().toLocaleString(),
      niveauEau: Math.floor(Math.random() * 100),
      niveau,
    };
    const newData = [...data, newRow];
    setData(newData);
    localStorage.setItem('eau-data', JSON.stringify(newData));
  };

  const handleExportPDF = async () => {
    const element = tableRef.current;
    if (!element) return;
    html2pdf()
      .from(element)
      .set({
        margin: 1,
        filename: 'rapport_inondation.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape' },
      })
      .save();
  };

  const handleExportCSV = () => {
    const headers = ['Date', "Niveau d'eau (cm)", 'Niveau'];
    const rows = data.map((d) => [d.date, d.niveauEau, d.niveau]);
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
    const savedData = localStorage.getItem('eau-data');
    if (savedData) setData(JSON.parse(savedData));
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
        <br />
        <br />
        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={() => setPassword('')}>Déconnecter</button>
        <button onClick={() => setDarkMode(!darkMode)}>Mode {darkMode ? 'Jour' : 'Sombre'}</button>
        <p>
          <a href="#">Mot de passe oublié ?</a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/logo-gauche.png" alt="Logo Gauche" style={{ height: 50 }} />
        <h1>Système de suivi d'inondation</h1>
        <img src="/logo-droit.png" alt="Logo Droit" style={{ height: 50 }} />
      </div>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={addRow}>Ajouter données</button>
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
                    entry.niveau === 3 ? '#ffcccc' : entry.niveau === 2 ? '#fff3cd' : '#d1ecf1',
                }}
              >
                <td>{entry.date}</td>
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
