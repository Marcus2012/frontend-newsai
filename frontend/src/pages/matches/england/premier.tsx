import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { getStrapiBase } from '../../../lib/strapiBase';
import { formatTeamName, formatTeamLogo } from '../../../lib/teamUtils';
import MatchesCalendar from '../../../components/MatchesCalendar';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function PremierLeague() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [tableMeta, setTableMeta] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'news'|'table'|'calendar'>('news');
  const [news, setNews] = useState<any[] | null>(null);
  const [preds, setPreds] = useState<Record<string, any>>({});
  const [upcomingMatches, setUpcomingMatches] = useState<any[] | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/premier/standings`);
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
      const res = await fetch(`${API_BASE}/football/public/premier/info`);
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
      const res = await fetch(`${API_BASE}/football/public/premier/fixtures?next=20`);
      if (!res.ok) {
        await fetchSummary();
        return;
      }
      const json = await res.json();

      // Robust extraction: recursively find first array that looks like matches
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

        // check common keys first
        for (const key of ["data","matches","fixtures","items","response"]) {
          const v = payload[key];
          if (Array.isArray(v) && looksLikeMatchesArray(v)) return v;
          if (v && typeof v === 'object') {
            // some APIs wrap results inside object with results/paging
            if (Array.isArray(v.results) && looksLikeMatchesArray(v.results)) return v.results;
          }
        }

        // deep search: find any nested array that looks like matches
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

        // last resort: check response[0].league.fixtures
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

  async function fetchNews() {
    setError(null);
    setLoading(true);
    try {
      const STRAPI = getStrapiBase() || process.env.NEXT_PUBLIC_API_ENDPOINT || '';
      const res = await fetch(`${STRAPI}/api/articles?publicationState=live&populate=*&sort[0]=publishedAt:desc&filters[category][$eq]=Champions%20League`);
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
          slug: attrs.slug ?? null,
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
      <div className="container-max main-layout" style={{ gridTemplateColumns: '1fr', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
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
          </div>

          <h1 style={{ color: '#00ffc8', marginTop: 12 }}>Premier League — Inglaterra</h1>

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
                    // Adaptación para Sportmonks: standings es un array de objetos con participant_id, points, position, etc.
                    const position = row.position ?? idx + 1;
                    // Sportmonks standings: row.participant es el objeto del equipo
                    const participant = row.participant || {};
                    const name = participant.name || row.name || `ID ${participant.id || row.participant_id}`;
                    const logo = participant.image_path || '/logo_placeholder.png';
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
                          <img src={logo} alt={name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} onError={(e: any)=>{ if(e.currentTarget.src !== '/logo_placeholder.png') e.currentTarget.src = '/logo_placeholder.png'; }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{name}</span>
                            <span style={{ color: '#9aa', fontSize: '0.85em' }}>{participant.short_code ?? ''}</span>
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
            <MatchesCalendar
              title="Calendario — Partidos HOY"
              matches={upcomingMatches}
              loading={loading}
            />
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
                      <Link href={`/articles/${a.slug || a.id}`} style={{ color:'#00ffc8' }}>Leer más →</Link>
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

      </div>

      <style jsx global>{`
        .main-layout{ display:flex; gap:20px; align-items:flex-start; justify-content:center; }
        .main-layout > div{ width:100%; max-width:980px; margin-left:auto; margin-right:auto; }
        .table-wrap{ background: rgba(10,14,39,0.7); padding:12px; border-radius:8px; overflow-x:auto }
        .league-table{ width:100%; color:#fff; border-collapse:collapse; min-width:0 }
        .league-table th, .league-table td{ padding:10px 8px; white-space:nowrap }
        .logos-row{ display:flex; gap:10px; align-items:center; justify-content:center; padding:8px 0; overflow-x:auto }
        .logo-item img{ width:44px; height:44px; object-fit:contain; display:block }
        .news-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:16px }

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
        .top-scorers-list{ display:flex; flex-direction:column; gap:8px; margin-top:8px }
        .player-row{ display:grid; grid-template-columns: 36px 1fr 1fr 56px; gap:12px; align-items:center; padding:8px 10px; background: rgba(0,0,0,0.15); border-radius:8px }
        .player-pos{ font-weight:800; color:#00ffc8 }
        .player-name{ font-weight:700 }
        .player-team{ color:#9aa; font-size:0.95em }
        .player-goals{ font-weight:900; text-align:right }
        .top-scorers-wrap{ margin-top:8px }
        .top-scorers-table{ width:100%; border-collapse:collapse; background: rgba(255,255,255,0.02); border-radius:8px; overflow:hidden }
        .top-scorers-table thead th{ text-align:left; padding:10px 12px; color:#9aa; font-size:0.85em; border-bottom:1px solid rgba(255,255,255,0.04) }
        .top-scorers-table tbody td{ padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.02); color:#fff }

        @media (max-width: 900px){
          .main-layout{ flex-direction:column; }
          .logos-row{ justify-content:flex-start; padding-left:8px }
          .logo-item img{ width:40px; height:40px }
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
