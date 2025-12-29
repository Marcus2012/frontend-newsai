import React, { useState } from 'react';
import Header from '../../../../src/components/Header';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function PeruPrimera() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [tableMeta, setTableMeta] = useState<any | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/peru/table`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      // json shape: { phase, round, standings }
      setTableMeta({ phase: json.phase, round: json.round });
      setStandings(json.standings || []);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  async function fetchSummary() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/peru/summary`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setSummary(json || {});
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#071026', color: '#fff' }}>
      <Header />
      <div style={{ maxWidth: 1100, margin: '36px auto', padding: '0 18px' }}>
        <Link href="/matches">← Volver a Partidos</Link>
        <h1 style={{ color: '#00ffc8', marginTop: 12 }}>Liga Perú — Primera División</h1>

        <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
          <button onClick={fetchTable} style={buttonStyle} disabled={loading}>Tabla de posiciones</button>
          <button onClick={fetchSummary} style={buttonStyle} disabled={loading}>Resultados / Resumen</button>
          <button onClick={fetchSummary} style={buttonStyle} disabled={loading}>Calendario — Hoy y Próximos</button>
        </div>

        {loading && <p style={{ color: '#aaa', marginTop: 18 }}>Cargando...</p>}
        {error && <p style={{ color: '#ff8b8b', marginTop: 18 }}>{error}</p>}

        {standings && (
          <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
            <h3 style={{ color: '#00ffc8' }}>Tabla — {tableMeta?.phase || ''}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#9fb8b0' }}>
                  <th>#</th><th>Equipo</th><th>J</th><th>G</th><th>E</th><th>P</th><th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings && standings.length ? standings.map((row: any, idx: number) => (
                  <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '8px 6px' }}>{idx+1}</td>
                    <td style={{ padding: '8px 6px' }}>{row.team?.name ?? row.name ?? row.team}</td>
                    <td style={{ padding: '8px 6px' }}>{row.played ?? row.all?.played ?? row.J}</td>
                    <td style={{ padding: '8px 6px' }}>{row.win ?? row.all?.win ?? row.G}</td>
                    <td style={{ padding: '8px 6px' }}>{row.draw ?? row.all?.draw ?? row.E}</td>
                    <td style={{ padding: '8px 6px' }}>{row.lose ?? row.all?.lose ?? row.P}</td>
                    <td style={{ padding: '8px 6px' }}>{row.points ?? row.Pts ?? row.points}</td>
                  </tr>
                )) : <tr><td colSpan={7} style={{ padding: 12, color: '#aaa' }}>Sin datos</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {summary && (
          <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
            <h3 style={{ color: '#00ffc8' }}>Resumen — Últimos partidos</h3>
            {(summary.last_fixtures || summary.last_fixtures === 0) && (summary.last_fixtures.length ? (
              <ul>
                {summary.last_fixtures.map((f: any, i: number) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong>{f.teams?.home?.name ?? f.home?.name ?? f.home}</strong> — <strong>{f.teams?.away?.name ?? f.away?.name ?? f.away}</strong>
                    <div style={{ color: '#9aa', fontSize: '0.9em' }}>{new Date(f.fixture?.date || f.date || Date.now()).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            ) : <div style={{ color: '#aaa' }}>No hay partidos recientes</div>)}

            <h4 style={{ color: '#00ffc8', marginTop: 12 }}>Información de liga</h4>
            <pre style={{ color: '#cfe', fontSize: '0.9em', overflowX: 'auto' }}>{JSON.stringify(summary.league_info || summary.league || summary, null, 2)}</pre>
          </div>
        )}

      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg,#063349,#08385a)',
  border: '1px solid rgba(0,255,200,0.08)',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 700
};
