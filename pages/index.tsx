import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState([]);

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn');
    if (!loggedIn) {
      router.push('/login');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Erreur récupération données');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Erreur:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    router.push('/login');
  };

  const handlePrint = () => window.print();

  const exportPDF = async () => {
    const element = document.getElementById('table-data');
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().from(element).set({
      margin: 1,
      filename: 'rapport_inondation.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape' }
    }).save();
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rapport_inondation.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Dashboard Inondation</h1>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={handleLogout} style={{ marginRight: '10px' }}>
          Se déconnecter
        </button>
        <button onClick={handlePrint} style={{ marginRight: '10px' }}>
          🖨️ Imprimer
        </button>
        <button onClick={exportPDF} style={{ marginRight: '10px' }}>
          📄 Export PDF
        </button>
        <button onClick={exportCSV}>
          📤 Export CSV
        </button>
      </div>

      <div id="table-data">
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Niveau</th>
              <th>Rivière</th>
              <th>Adresse</th>
              <th>Distance</th>
              <th>Responsable</th>
              <th>Temps</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7}>Chargement des données...</td></tr>
            ) : (
              data.map((item, i) => (
                <tr key={i}>
                  <td>{item.timestamp}</td>
                  <td>{item.niveau}</td>
                  <td>{item.riviere}</td>
                  <td>{item.adresse}</td>
                  <td>{item.distance} m</td>
                  <td>{item.nom_resp} ({item.tel})</td>
                  <td>{item.elapsed_times?.join('s, ')}s</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
