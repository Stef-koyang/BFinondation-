'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [data, setData] = useState<any[]>([]);
  const tableRef = useRef(null);

  // Auth simple
  const handleLogin = () => {
    if (password === 'bf2025') setAuthenticated(true);
    else alert('Mot de passe incorrect');
  };

  // Ajout d'une ligne (exemple)
  const addRow = () => {
    const newRow = {
      date: new Date().toLocaleString(),
      niveauEau: Math.floor(Math.random() * 100),
    };
    const newData = [...data, newRow];
    setData(newData);
    localStorage.setItem('eau-data', JSON.stringify(newData));
  };

  // Export PDF
  const handleExportPDF = async () => {
    const element = tableRef.current;
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().from(element).set({
      margin: 1,
      filename: 'rapport_inondation.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape' },
    }).save();
  };

  // Impression
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
        <h2>Authentification</h2>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={handleLogin}>Se connecter</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Système de suivi d'inondation</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={addRow}>Ajouter données</button>
        <button onClick={handleExportPDF}>Exporter PDF</button>
        <button onClick={handlePrint}>Imprimer</button>
      </div>

      <div ref={tableRef}>
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Niveau d'eau (cm)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.date}</td>
                <td>{entry.niveauEau}</td>
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
