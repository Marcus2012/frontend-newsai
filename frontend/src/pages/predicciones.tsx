import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Link from 'next/link';

type Match = {
  id?: string | number;
  date?: string;
  league?: string;
  home: string;
  away: string;
  logoHome?: string;
  logoAway?: string;
};

// Matches will be loaded from the API `/peru/summary` (fallback to empty array)

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function PrediccionesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [preds, setPreds] = useState<Record<string, any>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [teams, setTeams] = useState<any[] | null>(null);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadTable() {
      setTeamsError(null);
      try {
        const res = await fetch(`${API_BASE.replace(/\/$/, '')}/football/peru/table`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        const arr = json.standings || json.standing || json.table || [];
        if (mounted) setTeams(arr);
      } catch (err: any) {
        if (mounted) setTeamsError(err.message || 'Error cargando equipos');
      }
    }
    loadTable();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadMatches() {
      try {
        const res = await fetch(`${API_BASE.replace(/\/$/, '')}/peru/summary`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        const arr = json.next_fixtures || json.last_fixtures || json.fixtures || [];
        const mapped: Match[] = (Array.isArray(arr) ? arr : []).map((f:any, i:number) => {
          const home = f.teams?.home?.name || f.home || f.home_name || (f.teams?.home) || 'Home';
          const away = f.teams?.away?.name || f.away || f.away_name || (f.teams?.away) || 'Away';
          const date = f.fixture?.date || f.date || '';
          return {
            id: f.id ?? f.fixture?.id ?? i,
            date: date,
            league: f.league?.name || json.league?.name || 'Liga Perú - Primera División',
            home: typeof home === 'string' ? home : (home?.name || 'Home'),
            away: typeof away === 'string' ? away : (away?.name || 'Away'),
            logoHome: f.teams?.home?.logo || f.teams?.home?.crest || null,
            logoAway: f.teams?.away?.logo || f.teams?.away?.crest || null,
          };
        });
        if (mounted && mapped.length) setMatches(mapped);
      } catch (err) {
        // keep fallback sampleMatches
        console.warn('failed to load matches summary', err);
      }
    }
    loadMatches();
    return () => { mounted = false; };
  }, []);

  async function generatePrediction(m: Match) {
    const key = String(m.id ?? `${m.home}-${m.away}`);
    setLoadingIds(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
      const json = await res.json();
      setPreds(prev => ({ ...prev, [key]: json }));
    } catch (err: any) {
      setPreds(prev => ({ ...prev, [key]: { error: String(err) } }));
    } finally {
      setLoadingIds(prev => ({ ...prev, [key]: false }));
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#071026', color: '#fff' }}>
      <Header />
      <div className="container-max" style={{ padding: '28px 16px' }}>
        <h1 style={{ color: '#00ffc8', marginBottom: 8 }}>Pronósticos Fútbol</h1>
        <p style={{ color: '#9aa', marginTop: 0 }}>Predicciones generadas por IA o ejemplos estáticos. Haz click en "Generar predicción" para solicitar una.</p>

          <section style={{ marginTop: 20 }}>
            <h2 style={{ color: '#cfe', marginBottom: 8 }}>Equipos — Liga Perú / Primera División</h2>
            {teamsError && <div style={{ color: '#ff8b8b' }}>{teamsError}</div>}
            {teams ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
                {teams.map((t:any, i:number) => {
                  const team = t.team || t;
                  const name = team?.name || team?.club_name || team?.title || team;
                  const logo = team?.logo || team?.crest || team?.logo_path || null;
                  return (
                    <div key={i} style={{ background:'#071826', padding:10, borderRadius:8, display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(255,255,255,0.03)'}}>
                      <img src={logo || '/Logo_aeef.png'} alt={name} style={{ width:40, height:40, objectFit:'contain', borderRadius:6 }} onError={(e:any)=>{ if(e.currentTarget.src !== '/Logo_aeef.png') e.currentTarget.src = '/Logo_aeef.png'; }} />
                      <div style={{ color:'#fff', fontWeight:700 }}>{name}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color:'#9aa' }}>Cargando equipos...</div>
            )}
          </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16, marginTop: 18 }}>
          {matches.map((m) => {
            const key = String(m.id ?? `${m.home}-${m.away}`);
            const p = preds[key];
            const loading = !!loadingIds[key];
            return (
              <div key={key} style={{ background: '#0b1722', borderRadius: 10, padding: 14, border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: '0.9em', color: '#9aa' }}>{m.date}</div>
                  <div style={{ fontSize: '0.85em', color: '#9aa' }}>{m.league}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{m.home} <span style={{ color: '#9aa', fontWeight: 600 }}> - </span> {m.away}</div>
                    <div style={{ color: '#cfe', marginTop: 8 }}>{p?.scoreline ? `${p.winner === 'home' ? m.home : p.winner === 'away' ? m.away : 'Empate'} — ${p.scoreline} (${p.confidence}%)` : 'Sin predicción'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                  <button onClick={() => generatePrediction(m)} style={{ background: 'linear-gradient(90deg,#063349,#08385a)', border: '1px solid rgba(0,255,200,0.08)', color: '#fff', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }} disabled={loading}>{loading ? 'Generando...' : 'Generar predicción'}</button>
                  <Link href="/noticias" style={{ color: '#00ffc8', marginLeft: 8, fontSize: '0.9em' }}>En detalles ›</Link>
                </div>

                {p && p.error && <div style={{ marginTop: 10, color: '#ff8b8b' }}>{String(p.error)}</div>}
                {p && p.reasons && (
                  <ul style={{ marginTop: 10, color: '#cfe' }}>
                    {p.reasons.slice(0,3).map((r: string, i: number) => <li key={i} style={{ fontSize: '0.9em' }}>{r}</li>)}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
