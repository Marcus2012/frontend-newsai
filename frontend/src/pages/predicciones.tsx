import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import { formatTeamName, formatTeamLogo } from '../lib/teamUtils';

type Match = {
  id?: string | number;
  date?: string;
  league?: string;
  home: string;
  away: string;
  logoHome?: string | null;
  logoAway?: string | null;
};

// Matches will be loaded from the API `/peru/summary` (fallback to empty array)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';



function formatDateTime(d?: string) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return dt.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return d;
  }
}

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
            date,
            league: f.league?.name || json.league?.name || 'Liga Perú - Primera División',
            home: typeof home === 'string' ? home : (home?.name || 'Home'),
            away: typeof away === 'string' ? away : (away?.name || 'Away'),
            logoHome: f.teams?.home?.logo || f.teams?.home?.crest || null,
            logoAway: f.teams?.away?.logo || f.teams?.away?.crest || null,
          };
        });
        if (mounted) setMatches(mapped);
      } catch (err) {
        console.warn('failed to load matches summary', err);
      }
    }
    loadMatches();
    return () => { mounted = false; };
  }, []);

  const upcomingTeams = Array.from(new Set(matches.flatMap(m => [m.home, m.away]).filter(Boolean))) as string[];

  async function generatePrediction(m: Match) {
    const key = String(m.id ?? `${m.home}-${m.away}`);
    setLoadingIds(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      });
      if (!res) throw new Error('No response from /api/predict');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText} ${text}`);
      }
      const json = await res.json();
      const normalized = json?.prediction ?? (json?.fixture?.match ? json.fixture.match : json);
      setPreds(prev => ({ ...prev, [key]: normalized }));
    } catch (err: any) {
      console.error('Prediction error', err);
      setPreds(prev => ({ ...prev, [key]: { error: String(err), debug: err?.message || err, attempted: [] } }));
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
                const rawName = team?.name || team?.club_name || team?.title || team;
                const name = formatTeamName(typeof rawName === 'string' ? rawName : (rawName?.name || String(rawName)));
                const rawLogo = team?.logo || team?.crest || team?.logo_path || null;
                const isLosChankas = String(name).toLowerCase().includes('los chankas');
                const logo = isLosChankas
                  ? formatTeamLogo(name, '/Logo_aeef.png')
                  : (rawLogo
                      ? (typeof rawLogo === 'string' && (rawLogo.startsWith('http') || rawLogo.startsWith('//')) ? rawLogo : `${API_BASE.replace(/\/$/, '')}${rawLogo}`)
                      : formatTeamLogo(name, '/Logo_aeef.png'));
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

        <div style={{ marginTop: 12 }}>
          <h2 style={{ color: '#cfe', marginBottom: 8 }}>Próximos equipos</h2>
          {upcomingTeams.length ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {upcomingTeams.slice(0, 24).map((t, i) => (
                <div key={i} style={{ background: '#071826', padding: '6px 10px', borderRadius: 8, color: '#fff', fontWeight: 700 }}>{formatTeamName(t)}</div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#9aa', marginBottom: 10 }}>No hay equipos próximos</div>
          )}

          <div style={{ marginTop: 6 }}>
            {matches.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                {matches.map((m) => {
                  const key = String(m.id ?? `${m.home}-${m.away}`);
                  const p = preds[key] || {} as any;
                  const loading = !!loadingIds[key];
                  const home = p?.prob_home ?? 25;
                  const away = p?.prob_away ?? 52;
                  const draw = p?.prob_draw ?? Math.max(0, 100 - home - away);
                  return (
                    <div key={key} style={{ background: 'linear-gradient(180deg,#24111a,#0b1722)', borderRadius: 10, padding: 18, border: '1px solid rgba(255,60,100,0.12)', boxShadow: '0 2px 0 rgba(0,0,0,0.3)', color: '#e6f7f3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        {/* Logo local */}
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#071826', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={m.logoHome || '/Logo_aeef.png'} alt={m.home} style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e:any)=>{ if(e.currentTarget.src !== '/Logo_aeef.png') e.currentTarget.src = '/Logo_aeef.png'; }} />
                        </div>
                        {/* Centro: liga, fecha y nombres */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ color: '#9aa', fontSize: '0.82em', marginBottom: 2 }}>{m.league} • {formatDateTime(m.date)}</div>
                          <div style={{ fontWeight: 900, fontSize: '1.08rem', marginTop: 6, lineHeight: '1.05', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ display: 'inline-block', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatTeamName(m.home)}</span>
                            <span style={{ color: '#9aa', fontWeight: 600 }}>vs</span>
                            <span style={{ display: 'inline-block', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatTeamName(m.away)}</span>
                          </div>
                        </div>
                        {/* Logo visitante */}
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#071826', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={m.logoAway || '/Logo_aeef.png'} alt={m.away} style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e:any)=>{ if(e.currentTarget.src !== '/Logo_aeef.png') e.currentTarget.src = '/Logo_aeef.png'; }} />
                        </div>
                      </div>

                      {/* Prediction headline */}
                      <div style={{ color: '#1ee0c4', fontWeight: 800, marginBottom: 8 }}>{p?.headline ?? 'Gana Local (L) (2-0)'}</div>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#9aa', fontSize: '0.85em' }}>
                            <div>L: {home}%</div>
                            <div>E: {draw}%</div>
                            <div>V: {away}%</div>
                          </div>

                          <div style={{ height: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${home}%`, background: '#2bb673' }} />
                            <div style={{ width: `${draw}%`, background: '#9a5f2b' }} />
                            <div style={{ width: `${away}%`, background: '#17e0c4' }} />
                          </div>

                          <div style={{ background: '#0d5136', color: '#e6f7f3', padding: '12px 14px', borderRadius: 8, marginTop: 12, fontWeight: 800 }}>
                            <div>Resultado Final: {p?.scoreline ?? '—'}</div>
                            <div style={{ color: '#ffd96b', fontWeight: 800, marginTop: 8 }}>🏆 {p?.fans ?? 54} fans ganaron</div>
                          </div>
                        </div>

                        <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <button onClick={() => generatePrediction(m)} style={{ background: 'linear-gradient(90deg,#06424a,#0b3650)', border: '1px solid rgba(0,255,200,0.06)', color: '#fff', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }} disabled={loading}>{loading ? 'Generando...' : 'Generar predicción'}</button>
                          <Link href="/noticias" style={{ color: '#00ffc8', fontSize: '0.95em' }}>En detalles ›</Link>
                        </div>
                      </div>
                      {/*
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ background: '#073c1f', color: '#bff0c9', padding: '6px 10px', borderRadius: 8, fontWeight: 800 }}>🏆 {p?.fans ?? 54} fans</div>
                          <div style={{ background: '#3b1d22', color: '#ffd2d2', padding: '6px 8px', borderRadius: 6, fontWeight: 800 }}>PERÚ</div>
                        </div>
                        <div style={{ color: '#ff6b6b', fontWeight: 800 }}>🔥 {p?.precision ?? (p?.confidence ?? '—')}%</div>
                      </div>
                      */}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#9aa' }}>No hay próximos partidos.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
