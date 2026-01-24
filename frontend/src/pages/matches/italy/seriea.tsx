import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { getStrapiBase } from '../../../lib/strapiBase';
import { formatTeamName, formatTeamLogo } from '../../../lib/teamUtils';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function SerieA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [tableMeta, setTableMeta] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'news'|'table'|'calendar'|'topscorers'>('news');
  const [news, setNews] = useState<any[] | null>(null);
  const [preds, setPreds] = useState<Record<string, any>>({});
  const [topScorers, setTopScorers] = useState<any[] | null>(null);
  const [topScorersLoading, setTopScorersLoading] = useState(false);
  const [topScorersError, setTopScorersError] = useState<string | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/seriea/standings`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const s = json?.response?.[0]?.league?.standings?.[0] || json?.standings || json?.response || json?.data || [];
      setStandings(Array.isArray(s) ? s : []);
      setTableMeta({ season: json?.season || json?.response?.[0]?.league?.season || null });
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  async function fetchSummary() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/seriea/info`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setSummary(json || {});
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  async function fetchCalendar() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/seriea/fixtures?next=10`);
      if (!res.ok) {
        await fetchSummary();
        return;
      }
      const json = await res.json();
      setSummary(json || {});
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  async function fetchTopScorers(season?: number) {
    setTopScorersError(null);
    setTopScorersLoading(true);
    try {
      const url = `${API_BASE}/public/seriea/top-scorers${season ? `?season=${season}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const candidates = json?.response || json?.scorers || json?.data || json;
      let arr: any[] = [];
      if (Array.isArray(candidates)) arr = candidates;
      else if (candidates && Array.isArray(candidates.results)) arr = candidates.results;
      else if (candidates && Array.isArray(candidates.items)) arr = candidates.items;
      if (!arr.length && json?.response && Array.isArray(json.response) && json.response[0]?.league?.top_scorers) {
        arr = json.response[0].league.top_scorers;
      }
      setTopScorers(arr.slice(0, 40));
    } catch (err: any) {
      setTopScorersError(err.message || 'Error');
    } finally {
      setTopScorersLoading(false);
    }
  }

  async function fetchNews() {
    setError(null);
    setLoading(true);
    try {
      const STRAPI = getStrapiBase() || process.env.NEXT_PUBLIC_API_ENDPOINT || '';
      const res = await fetch(`${STRAPI}/api/articles?publicationState=live&populate=*&sort[0]=publishedAt:desc&pagination[limit]=4`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data || []);
      const items = arr.map((item: any) => {
        const attrs = item.attributes || item;
        const rawImage = attrs.image?.data?.attributes?.url ?? attrs.image?.url ?? null;
        const image_url = rawImage
          ? (rawImage.startsWith('http') ? rawImage : `${STRAPI?.replace(/\/$/, '')}${rawImage}`)
          : null;
        return {
          id: String(item.id),
          title: attrs.title ?? null,
          created_at: attrs.publishedAt ?? attrs.createdAt ?? attrs.created_at ?? null,
          image_url,
          description: attrs.excerpt ?? null
        };
      });
      setNews(items);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    fetchNews();
    fetchSummary();
    setActiveTab('news');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPrediction(f: any, i: number) {
    const key = f.id ?? f.fixture?.id ?? `${i}-${String(f.home||f.home_name||f.teams?.home?.name||'h')}-${String(f.away||f.away_name||f.teams?.away?.name||'a')}`;
    setPreds(prev => ({ ...prev, [key]: { loading: true } }));
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const json = await res.json();
      setPreds(prev => ({ ...prev, [key]: json }));
    } catch (err: any) {
      setPreds(prev => ({ ...prev, [key]: { error: String(err) } }));
    }
  }

  const leagueObj = summary?.response?.[0]?.league || summary?.league || summary || null;

  return (
    <div style={{ minHeight: '100vh', background: '#071026', color: '#fff' }}>
      <Header />
      <div className="container-max main-layout">
        <div>
          <div className="logos-row">
            {standings && standings.slice(0, 20).map((row: any, i: number) => {
              const participant = row.participant || {};
              const teamName = participant.name || row.name || `ID ${participant.id || row.participant_id}`;
              const logo = participant.image_path || '/logo_placeholder.png';
              return (
                <div key={i} className="logo-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={logo} alt={teamName} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, marginBottom: 4 }} onError={(e: any) => { if (e.currentTarget.src !== '/logo_placeholder.png') e.currentTarget.src = '/logo_placeholder.png'; }} />
                  <span style={{ color: '#cfe', fontSize: '0.85em', textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamName}</span>
                </div>
              );
            })}
          </div>

          <div className="tabs-row">
            <button className={`tab-btn ${activeTab==='news' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('news'); if(!news) await fetchNews(); }} disabled={loading}>Noticias</button>
            <button className={`tab-btn ${activeTab==='table' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('table'); if(!standings) await fetchTable(); }} disabled={loading}>Tabla</button>
            <button className={`tab-btn ${activeTab==='calendar' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('calendar'); if(!summary) await fetchCalendar(); }} disabled={loading}>Calendario</button>
            <button className={`tab-btn ${activeTab==='topscorers' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('topscorers'); if(!topScorers || topScorers.length===0) await fetchTopScorers(); }} disabled={topScorersLoading}>Goleadores</button>
          </div>

          <h1 style={{ color: '#00ffc8', marginTop: 12 }}>Serie A — Italy</h1>

          {loading && <p style={{ color: '#aaa', marginTop: 18 }}>Cargando...</p>}
          {error && <p style={{ color: '#ff8b8b', marginTop: 18 }}>{error}</p>}

          {activeTab === 'table' && standings && (
            <div className="table-wrap" style={{ marginTop: 20 }}>
              <h3 style={{ color: '#00ffc8' }}>Tabla — {tableMeta?.season || ''}</h3>
              <table className="league-table">
                <thead>
                  <tr style={{ textAlign: 'left', color: '#9fb8b0', borderBottom: '2px solid rgba(255,255,255,0.04)' }}>
                    <th style={{ width: 40 }}>Pos</th>
                    <th style={{ width: 360 }}>Equipo</th>
                    <th style={{ width: 40 }}>PJ</th>
                    <th style={{ width: 40 }}>PG</th>
                    <th style={{ width: 40 }}>PE</th>
                    <th style={{ width: 40 }}>PP</th>
                    <th style={{ width: 50 }}>GF</th>
                    <th style={{ width: 50 }}>GC</th>
                    <th style={{ width: 60 }}>DG</th>
                    <th style={{ width: 60 }}>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings && standings.length ? standings.map((row: any, idx: number) => {
                    const position = idx + 1;
                    const nameRaw = row.team?.name ?? row.name ?? row.team ?? '—';
                    const name = formatTeamName(nameRaw);
                    const logo = formatTeamLogo(row.team?.name ?? row.name ?? '', row.team?.logo || row.team?.logo_path || row.logo || row.crest || null);
                    const played = row.played ?? row.all?.played ?? row.J ?? 0;
                    const win = row.win ?? row.all?.win ?? row.G ?? 0;
                    const draw = row.draw ?? row.all?.draw ?? row.E ?? 0;
                    const lose = row.lose ?? row.all?.lose ?? row.P ?? 0;
                    const goalsFor = row.goalsFor ?? row.all?.goals?.for ?? row.GF ?? row.gf ?? 0;
                    const goalsAgainst = row.goalsAgainst ?? row.all?.goals?.against ?? row.GC ?? row.ga ?? 0;
                    const points = row.points ?? row.Pts ?? row.points ?? 0;
                    const diff = (typeof row.goalDifference !== 'undefined') ? row.goalDifference : (goalsFor - goalsAgainst);
                    const dgColor = diff > 0 ? '#7ee787' : diff < 0 ? '#ff8b8b' : '#cfe';
                    const rowBorder = position <= 4 ? '4px solid rgba(0,255,200,0.12)' : '1px solid rgba(255,255,255,0.03)';

                    return (
                      <tr key={idx} style={{ borderTop: rowBorder }} className={position <= 4 ? 'league-pos-top3' : ''}>
                        <td className="league-pos">{position}</td>
                        <td className="league-team-cell">
                          <img src={logo || '/logo_placeholder.png'} alt={name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} onError={(e: any)=>{ if(e.currentTarget.src !== '/logo_placeholder.png') e.currentTarget.src = '/logo_placeholder.png'; }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{name}</span>
                            <span style={{ color: '#9aa', fontSize: '0.85em' }}>{row.team?.shortName ?? row.shortName ?? ''}</span>
                          </div>
                        </td>
                        <td>{played}</td>
                        <td>{win}</td>
                        <td>{draw}</td>
                        <td>{lose}</td>
                        <td>{goalsFor}</td>
                        <td>{goalsAgainst}</td>
                        <td className="league-dg" style={{ color: dgColor }}>{diff > 0 ? `+${diff}` : diff}</td>
                        <td style={{ fontWeight: 900 }}>{points}</td>
                      </tr>
                    );
                  }) : <tr><td colSpan={10} style={{ padding: 12, color: '#aaa' }}>Sin datos</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calendar' && summary && (
            <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
              <h3 style={{ color: '#00ffc8' }}>Calendario — Próximos</h3>
              {(summary.response && summary.response.length) ? (
                <ul>
                  {summary.response.map((f: any, i: number) => (
                    <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <strong>{formatTeamName(f.teams?.home?.name ?? f.home?.name ?? f.home)}</strong> — <strong>{formatTeamName(f.teams?.away?.name ?? f.away?.name ?? f.away)}</strong>
                      <div style={{ color: '#9aa', fontSize: '0.9em' }}>{new Date(f.fixture?.date || f.date || Date.now()).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              ) : <div style={{ color: '#aaa' }}>No hay partidos en el calendario</div>}
            </div>
          )}

          {activeTab === 'topscorers' && (
            <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
              <h3 style={{ color: '#00ffc8' }}>Goleadores — Serie A</h3>
              {topScorersLoading && <div style={{ color:'#9aa' }}>Cargando goleadores...</div>}
              {topScorersError && <div style={{ color:'#ff8b8b' }}>{topScorersError}</div>}
              {!topScorersLoading && topScorers && topScorers.length ? (
                <div className="top-scorers-wrap">
                  <table className="top-scorers-table">
                    <thead>
                      <tr>
                        <th style={{ width: 44 }}>POS</th>
                        <th>NOMBRE</th>
                        <th style={{ width: 44, textAlign: 'center' }}>G</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topScorers.map((p:any, idx:number)=>{
                        const pos = idx + 1;
                        const rawPlayer = p.player ?? p.player_name ?? p.name ?? p.player?.name ?? p?.player_name ?? null;
                        const player = (typeof rawPlayer === 'string')
                          ? rawPlayer
                          : (rawPlayer?.name ?? rawPlayer?.fullname ?? rawPlayer?.firstname ?? rawPlayer?.firstName ?? '');

                        const rawTeam = p.team ?? p.team_name ?? p.club ?? p.team?.name ?? p?.team_name ?? null;
                        const team = (typeof rawTeam === 'string')
                          ? rawTeam
                          : (rawTeam?.name ?? rawTeam?.title ?? '');

                        const played = p.appearances ?? p.matches ?? p.games ?? p.played ?? p.p ?? p.matches_played ?? p.games_played ?? p.statistics?.[0]?.games?.appearances ?? null;
                        const goals = (p.goals ?? p.total ?? p.scored ?? p.goals_scored ?? p?.goals ?? p.statistics?.[0]?.goals?.total ?? p.statistics?.goals?.total ?? 0) as number;

                        return (
                          <tr key={idx}>
                            <td style={{ textAlign:'center', fontWeight:800, color: '#00ffc8' }}>{pos}</td>
                            <td style={{ fontWeight:700 }}>{player || '—'}</td>
                            <td style={{ textAlign:'center', fontWeight:800 }}>{`${goals}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (!topScorersLoading && <div style={{ color:'#aaa' }}>No hay datos de goleadores</div>)}
            </div>
          )}

          {activeTab === 'news' && (
            <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
              <h3 style={{ color: '#00ffc8' }}>Noticias recientes</h3>
              {news && news.length ? (
                <div className="news-grid">
                  {news.map((a:any, i:number) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8 }}>
                      {a.image_url && (<img src={a.image_url} alt={a.title} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:6 }} />)}
                      <h4 style={{ color:'#fff', marginTop:8 }}>{a.title}</h4>
                      {a.description && <p style={{ color:'#cfe' }}>{a.description.substring(0,160)}...</p>}
                      <Link href={`/articles/${a.id}`} style={{ color:'#00ffc8' }}>Leer más →</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color:'#aaa' }}>
                  No hay noticias cargadas. Ver todas en <Link href="/noticias">Noticias</Link>
                </div>
              )}
            </div>
          )}

        </div>

        <aside className="sidebar-aside">
          <div style={{ background:'#0b1722', padding:12, borderRadius:8 }}>
            <h4 style={{ color:'#00ffc8', marginBottom:8 }}>Serie A</h4>
            <div style={{ color:'#9aa', fontSize:'0.9em', marginBottom:8 }}>{summary?.date || '—'}</div>
            {summary && (summary.last_fixtures && summary.last_fixtures.length) ? (
              <div>
                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                      {summary.last_fixtures.slice(0,5).map((f:any,i:number)=> {
                      const pk = f.id ?? f.fixture?.id ?? `${i}-${String(f.home||f.home_name||f.teams?.home?.name||'h')}-${String(f.away||f.away_name||f.teams?.away?.name||'a')}`;
                      const p = preds[pk];
                      const homeName = formatTeamName(f.teams?.home?.name ?? f.home?.name ?? f.home ?? 'Home');
                      const awayName = formatTeamName(f.teams?.away?.name ?? f.away?.name ?? f.away ?? 'Away');
                      const homeScore = (f.goals?.home ?? f.score?.home ?? f.goals_home) ?? (f.result?.home ?? '');
                      const awayScore = (f.goals?.away ?? f.score?.away ?? f.goals_away) ?? (f.result?.away ?? '');
                      return (
                        <li key={i} style={{ display:'flex', flexDirection: 'column', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ color:'#cfe' }}>{homeName} <span style={{ color:'#9aa', margin: '0 6px' }}>-</span> {awayName}</span>
                            <span style={{ color:'#fff', fontWeight:700 }}>{homeScore} - {awayScore}</span>
                          </div>
                          <div style={{ marginTop:6, display:'flex', gap:8, alignItems:'center' }}>
                            <button style={{...buttonStyle, padding:'6px 10px', fontSize:'0.9em'}} onClick={()=>fetchPrediction(f,i)}>Predecir</button>
                            {p && p.loading && <span style={{ color:'#9aa' }}>Generando...</span>}
                            {p && p.error && <span style={{ color:'#ff8b8b' }}>{p.error}</span>}
                            {p && p.winner && (
                              <div style={{ color:'#cfe', fontSize:'0.9em' }}>
                                Predicción: <strong style={{ color:'#00ffc8' }}>{p.winner}</strong> — {p.scoreline} ({p.confidence}%)
                              </div>
                            )}
                          </div>
                        </li>
                      );
                  })}
                </ul>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.03)', marginTop:10, paddingTop:10 }}>
                  <h5 style={{ color:'#00ffc8', margin:0, fontSize:'0.95em' }}>Resumen de liga</h5>
                  <pre style={{ color:'#9aa', fontSize:'0.8em', maxHeight:120, overflow:'auto' }}>{JSON.stringify(leagueObj || {}, null, 2)}</pre>
                  <div style={{ marginTop:8 }}><Link href="/noticias" style={{ color:'#00ffc8' }}>Ver más noticias</Link></div>
                </div>
              </div>
            ) : (
              <div style={{ color:'#aaa' }}>No hay resumen disponible</div>
            )}
            <div style={{ marginTop:12 }}>
              <button style={{...buttonStyle, width:'100%'}} onClick={()=>{ setActiveTab('table'); window.scrollTo({top:0, behavior:'smooth'}); }}>Ver Tabla</button>
            </div>
          </div>
        </aside>

      </div>

      <style jsx global>{`
        .main-layout{ display:flex; gap:20px; align-items:flex-start; }
        .table-wrap{ background: rgba(10,14,39,0.7); padding:12px; border-radius:8px; overflow-x:auto }
        .league-table{ width:100%; color:#fff; border-collapse:collapse; min-width:0 }
        .league-table th, .league-table td{ padding:10px 8px; white-space:nowrap }
        .logos-row{ display:flex; gap:10px; align-items:center; justify-content:center; padding:8px 0; overflow-x:auto }
        .logo-item img{ width:44px; height:44px; object-fit:contain; display:block }
        .news-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:16px }
        .sidebar-aside{ width:320px }
        .top-scorers-wrap{ margin-top:8px }
        .top-scorers-table{ width:100%; color:#fff; border-collapse:collapse }
        .top-scorers-table th, .top-scorers-table td{ padding:10px 8px; border-bottom:1px solid rgba(255,255,255,0.03); white-space:nowrap }
        .top-scorers-table th{ text-align:left; color:#9fb8b0 }
        .player-pos{ font-weight:800; color:#00ffc8 }
        .player-name{ font-weight:700 }
        .player-team{ color:#9aa; font-size:0.95em }
        .player-goals{ font-weight:900; text-align:right }

        @media (max-width: 900px){
          .main-layout{ flex-direction:column; }
          .logos-row{ justify-content:flex-start; padding-left:8px }
          .logo-item img{ width:40px; height:40px }
          .sidebar-aside{ width:100% }
          .news-grid{ grid-template-columns: 1fr }
        }

        @media (max-width: 520px){
          h1{ font-size:1.4rem }
          .league-table th:nth-child(4), .league-table th:nth-child(5), .league-table th:nth-child(6), .league-table th:nth-child(7), .league-table th:nth-child(8){ display:none }
          .league-table td:nth-child(4), .league-table td:nth-child(5), .league-table td:nth-child(6), .league-table td:nth-child(7), .league-table td:nth-child(8){ display:none }
          .league-table thead{ display:table-header-group }
          .league-team-cell img{ width:26px; height:26px }
          .logo-item img{ width:36px; height:36px }
        }
        @media (max-width: 420px){
          .tabs-row{display:flex;gap:8px;overflow-x:auto;padding:8px 0}
          .tab-btn{flex:0 0 auto;padding:8px 10px;font-size:0.95rem}
          .logos-row{gap:8px;padding-left:6px}
          .logo-item img{width:32px;height:32px}
          .match-card{padding:10px;border-radius:10px}
          .match-main{gap:12px;padding:8px 12px}
          .team.centered{min-width:0;gap:8px}
          .team.centered .team-name{max-width:110px;font-size:0.95rem}
          .center-time{min-width:60px}
          .match-date-top{position:static;padding:6px 0;color:#9aa;font-size:0.85em}
          .matches-grid{gap:10px}
          .sidebar-aside{display:block;width:100%}
        }
      `}</style>

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
