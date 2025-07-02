import { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import dynamic from 'next/dynamic';

// Chargement du graphique dynamiquement
const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    if (!tableRef.current) return;
    const printWindow = window.open('', '', 'height=700,width=1000');
    printWindow?.document.write('<html><head><title>Impression</title></head><body>');
    printWindow?.document.write(tableRef.current.innerHTML);
    printWindow?.document.write('</body></html>');
    printWindow?.document.close();
    printWindow?.print();
  };

  const handlePDF = async () => {
    if (!tableRef.current) return;
    const element = tableRef.current;
    const pdf = html2pdf().from(element).set({
      margin: 1,
      filename: 'rapport_inondation.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    });
    pdf.save();
  };

  const handleLogin = () => {
    if (password === 'admin123') setIsLoggedIn(true);
    else alert('Mot de passe incorrect');
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 50 }}>
        <h2>Connexion administrateur</h2>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Connexion</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Inondation</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={handlePDF}>📥 Enregistrer en PDF</button>
        <button onClick={handlePrint} style={{ marginLeft: 10 }}>🖨️ Imprimer</button>
      </div>

      <div ref={tableRef} id="table-data">
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr>
              <th>Date</th><th>Niveau</th><th>Rivière</th><th>Adresse</th><th>Distance</th>
              <th>Responsable</th><th>Temps</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td>{item.timestamp}</td>
                <td>{item.niveau}</td>
                <td>{item.riviere}</td>
                <td>{item.adresse}</td>
                <td>{item.distance} m</td>
                <td>{item.nom_resp} ({item.tel})</td>
                <td>{item.elapsed_times?.join('s, ')}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>📊 Graphique de la montée d’eau</h2>
      <Chart data={data} />
    </div>
  );
}
