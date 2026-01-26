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
  const [upcomingMatches, setUpcomingMatches] = useState<any[] | null>(null);
  const [topScorers, setTopScorers] = useState<any[] | null>(null);
  const [topScorersLoading, setTopScorersLoading] = useState(false);
  const [topScorersError, setTopScorersError] = useState<string | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/seriea/standings`);
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
      const res = await fetch(`${API_BASE}/football/public/seriea/info`);
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
      const res = await fetch(`${API_BASE}/football/public/seriea/fixtures?next=20`);
      if (!res.ok) {
        await fetchSummary();
        return;
      }
      const json = await res.json();

      const looksLikeMatchesArray = (arr: any[]) => {
        if (!Array.isArray(arr) || arr.length === 0) return false;
        const sample = arr[0];
        if (typeof sample !== 'object' || sample === null) return false;
        const keys = Object.keys(sample).map(k => k.toLowerCase());
        const indicators = ['teams','home','away','fixture','match','utcdate','match_date','date','score','status','participants','starting_at'];
        return indicators.some(ind => keys.some(k => k.includes(ind)));
      };

      const extractMatches = (payload: any): any[] => {
        if (!payload) return [];
        if (Array.isArray(payload) && looksLikeMatchesArray(payload)) return payload;

        for (const key of ['data','matches','fixtures','items','response']) {
          const v = payload[key];
          if (Array.isArray(v) && looksLikeMatchesArray(v)) return v;
          if (v && typeof v === 'object') {
            if (Array.isArray(v.results) && looksLikeMatchesArray(v.results)) return v.results;
          }
        }

        const seen = new Set<any>();
        const stack = [payload];
        while (stack.length) {
          const node = stack.pop();
          if (!node || typeof node !== 'object' || seen.has(node)) continue;
          seen.add(node);
          if (Array.isArray(node) && looksLikeMatchesArray(node)) return node;
          for (const k of Object.keys(node)) {
            const v = node[k];
            if (Array.isArray(v)) {
              if (looksLikeMatchesArray(v)) return v;
            } else if (v && typeof v === 'object') {
              stack.push(v);
            }
          }
        }

        if (payload.response && Array.isArray(payload.response) && payload.response[0]?.league?.fixtures && Array.isArray(payload.response[0].league.fixtures)) {
          return payload.response[0].league.fixtures;
        }

        return [];
      };

      const matches = extractMatches(json || {});
      setUpcomingMatches(matches.slice(0, 20));
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
      const res = await fetch(`${STRAPI}/api/articles?publicationState=live&populate=*&sort[0]=publishedAt:desc&pagination[limit]=6&filters[category][$in][0]=Serie%20A%20-%20Italia&filters[category][$in][1]=Todos`);
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
            <button className={`tab-btn ${activeTab==='calendar' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('calendar'); if(!upcomingMatches || upcomingMatches.length===0) await fetchCalendar(); }} disabled={loading}>Calendario</button>
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
                    const position = row.position ?? idx + 1;
                    const participant = row.participant || {};
                    const name = participant.name || row.name || `ID ${participant.id || row.participant_id}`;
                    const logo = participant.image_path || row.logo || '/logo_placeholder.png';
                    const rowSummary = row.summary || row.season?.summary || null;
                    const played = rowSummary?.played ?? row.played ?? row.games_played ?? row.matches_played ?? row.PJ ?? 0;
                    const win = rowSummary?.won ?? row.win ?? row.wins ?? row.PG ?? 0;
                    const draw = rowSummary?.draw ?? row.draw ?? row.draws ?? row.PE ?? 0;
                    const lose = rowSummary?.lost ?? row.lose ?? row.losses ?? row.PP ?? 0;
                    const goalsFor = rowSummary?.goals_for ?? row.goals_for ?? row.goalsfor ?? row.GF ?? 0;
                    const goalsAgainst = rowSummary?.goals_against ?? row.goals_against ?? row.goalsagainst ?? row.GC ?? 0;
                    const points = rowSummary?.points ?? row.points ?? row.Pts ?? 0;
                    const diff = (typeof rowSummary?.goal_difference !== 'undefined')
                      ? rowSummary?.goal_difference
                      : (typeof row.goal_difference !== 'undefined')
                        ? row.goal_difference
                        : (goalsFor - goalsAgainst);
                    const dgColor = diff > 0 ? '#7ee787' : diff < 0 ? '#ff8b8b' : '#cfe';
                    const rowBorder = position <= 4 ? '4px solid rgba(0,255,200,0.12)' : '1px solid rgba(255,255,255,0.03)';

                    return (
                      <tr key={idx} style={{ borderTop: rowBorder }} className={position <= 4 ? 'league-pos-top3' : ''}>
                        <td className="league-pos">{position}</td>
                        <td className="league-team-cell">
                          <img src={logo || '/logo_placeholder.png'} alt={name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} onError={(e: any)=>{ if(e.currentTarget.src !== '/logo_placeholder.png') e.currentTarget.src = '/logo_placeholder.png'; }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{formatTeamName(name)}</span>
                            <span style={{ color: '#9aa', fontSize: '0.85em' }}>{participant.short_code ?? row.shortName ?? ''}</span>
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

          {activeTab === 'calendar' && (
            <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
              <h3 style={{ color: '#00ffc8' }}>Calendario — Partidos HOY</h3>
              {loading && <div style={{ color:'#9aa' }}>Cargando partidos...</div>}
              {!loading && upcomingMatches && upcomingMatches.length ? (
                <div className="matches-grid">
                  {upcomingMatches.map((f: any, i: number) => {
                    const participants = f.participants ?? f.fixture?.participants ?? [];
                    const getByLocation = (loc: string) => {
                      if (!Array.isArray(participants)) return null;
                      return participants.find((p: any) => {
                        const meta = p.meta || p.participant?.meta || {};
                        const location = meta.location || meta.side || meta.position || meta.place || '';
                        return String(location).toLowerCase() === loc;
                      }) || null;
                    };
                    const homeP = getByLocation('home');
                    const awayP = getByLocation('away');

                    const home = homeP?.name ?? homeP?.participant?.name ?? f.teams?.home?.name ?? f.home?.name ?? f.home ?? f.home_team ?? (f.home_team_name || '');
                    const away = awayP?.name ?? awayP?.participant?.name ?? f.teams?.away?.name ?? f.away?.name ?? f.away ?? f.away_team ?? (f.away_team_name || '');
                    const homeLogo = homeP?.image_path ?? homeP?.participant?.image_path ?? f.teams?.home?.logo ?? f.home?.logo ?? f.home_logo ?? null;
                    const awayLogo = awayP?.image_path ?? awayP?.participant?.image_path ?? f.teams?.away?.logo ?? f.away?.logo ?? f.away_logo ?? null;
                    const date = f.starting_at ?? f.fixture?.date ?? f.date ?? f.match_date ?? f.utcDate ?? f.iso_date ?? null;
                    const dt = date ? new Date(date) : null;
                    const formattedDate = dt ? dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'numeric', year: 'numeric' }) : null;
                    const formattedTime = dt ? dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : null;

                    return (
                      <div key={i} className="match-card">
                        <div className="match-card-inner">
                          <div className="match-date-top">{formattedDate || ''}</div>
                          <div className="match-main">
                            <div className="team team-home centered">
                              <img src={formatTeamLogo(home, homeLogo)} alt={home} onError={(e:any)=>{ if(e.currentTarget.src.indexOf('/logo_placeholder')===-1) e.currentTarget.src = '/logo_placeholder.png'; }} />
                              <div className="team-name">{formatTeamName(home)}</div>
                            </div>

                            <div className="center-time">
                              <div className="match-time">{formattedTime || ''}</div>
                            </div>

                            <div className="team team-away centered">
                              <div className="team-name">{formatTeamName(away)}</div>
                              <img src={formatTeamLogo(away, awayLogo)} alt={away} onError={(e:any)=>{ if(e.currentTarget.src.indexOf('/logo_placeholder')===-1) e.currentTarget.src = '/logo_placeholder.png'; }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: '#aaa' }}>No hay partidos en el calendario</div>
              )}
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
        .matches-grid{ display:flex; flex-direction:column; gap:14px }
        .match-card{ background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02)); padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.04); transition: transform .12s ease, box-shadow .12s ease }
        .match-card:hover{ transform: translateY(-6px); box-shadow: 0 12px 30px rgba(2,6,23,0.6) }
        .match-card-inner{ position:relative }
        .match-date-top{ position:absolute; right:16px; top:12px; color:#9aa; font-size:0.85em }
        .match-main{ display:grid; grid-template-columns: 1fr 120px 1fr; align-items:center; gap:24px; padding:10px 22px }
        .team.centered{ display:flex; align-items:center; gap:12px; flex-direction:row; min-width:0; justify-content:flex-start }
        .team.centered img{ width:36px; height:36px; object-fit:contain; border-radius:6px; flex-shrink:0 }
        .team.centered .team-name{ font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px }
        .team-away.centered{ flex-direction:row-reverse; justify-content:flex-end }
        .team-away.centered .team-name{ text-align:right }
        .center-time{ display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:0 }
        .match-time{ font-weight:900; color:#00ffc8; font-size:1.08em; letter-spacing:0.2px }
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
          .match-main{ gap:10px; padding:8px 10px; flex-wrap:wrap }
          .team.centered{ min-width:120px }
          .team.centered .team-name{ max-width:140px }
        }
        @media (max-width: 420px){
          .tabs-row{display:flex;gap:8px;overflow-x:auto;padding:8px 0}
          .tab-btn{flex:0 0 auto;padding:8px 10px;font-size:0.95rem}
          .logos-row{gap:8px;padding-left:6px}
          .logo-item img{width:32px;height:32px}
          .match-card{padding:10px;border-radius:10px}
          .match-main{gap:10px;padding:8px 10px;flex-direction:column;align-items:stretch}
          .team.centered{min-width:0;gap:8px;justify-content:center}
          .team-away.centered{flex-direction:row;justify-content:center}
          .team.centered .team-name{max-width:160px;font-size:0.95rem;text-align:center}
          .center-time{min-width:0}
          .match-time{font-size:1rem}
          .match-date-top{position:static;padding:6px 0;color:#9aa;font-size:0.85em;text-align:center}
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
