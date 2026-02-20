import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { getStrapiBase } from '../../../lib/strapiBase';
import { formatTeamName, formatTeamLogo } from '../../../lib/teamUtils';
import MatchesCalendar from '../../../components/MatchesCalendar';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function PeruPrimera() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [tableMeta, setTableMeta] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'news'|'table'|'calendar'>('news');
  const [news, setNews] = useState<any[] | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/peru-primera/standings`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const extractStandings = (payload: any) => {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload.standings)) return payload.standings;
        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.response)) return payload.response;
        if (payload.response?.[0]?.league?.standings?.[0]) return payload.response[0].league.standings[0];
        return [];
      };
      const standingsData = extractStandings(json);
      // json shape: { phase, round, standings }
      setTableMeta({ phase: json.phase, round: json.round });
      setStandings(Array.isArray(standingsData) ? standingsData : []);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  async function fetchSummary() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/peru-primera/info`);
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
      const res = await fetch(`${API_BASE}/football/public/peru-primera/fixtures?next=20`);
      if (!res.ok) {
        // fallback to summary if calendar endpoint not available
        await fetchSummary();
        return;
      }
      const json = await res.json();
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
      const baseUrl = `${STRAPI}/api/articles?publicationState=live&populate=*&sort[0]=publishedAt:desc&pagination[limit]=4`;
      const parseItems = (json: any) => {
        const arr = Array.isArray(json) ? json : (json.data || []);
        return arr.map((item: any) => {
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
      };

      const primaryRes = await fetch(`${baseUrl}&filters[category][$containsi]=Liga%201%20-%20Peru`);
      if (!primaryRes.ok) throw new Error(`${primaryRes.status} ${primaryRes.statusText}`);
      const primaryJson = await primaryRes.json();
      let items = parseItems(primaryJson);

      if (!items.length) {
        const fallbackRes = await fetch(`${baseUrl}&filters[category][$containsi]=Liga%201`);
        if (fallbackRes.ok) {
          const fallbackJson = await fallbackRes.json();
          items = parseItems(fallbackJson);
        }
      }

      setNews(items);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    // mostrar noticias al entrar y precargar resumen para el sidebar
    fetchNews();
    fetchSummary();
    fetchTable();
    setActiveTab('news');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  // derive season 2025 info from summary for sidebar
  const leagueObj = summary?.league_info || summary?.league || summary || null;
  const season2025 = leagueObj && Array.isArray(leagueObj.seasons)
    ? leagueObj.seasons.find((s:any) => String(s.year) === '2025' || (s.start && s.start.startsWith('2025')))
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#071026', color: '#fff' }}>
      <Header />
      <div className="container-max main-layout" style={{ gridTemplateColumns: '1fr', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Logos centrados debajo del header */}
          <div className="logos-row">
            {standings && standings.slice(0,19).map((s:any, i:number)=>{
              const participant = s.participant || s.team || {};
              const rawName = participant.name ?? s.name ?? '';
              const teamName = formatTeamName(rawName);
              const logo = formatTeamLogo(rawName, participant.image_path || participant.logo || s.logo || s.crest || '/Logo_aeef.png');
              return (
                <div key={i} className="logo-item">
                  <img src={logo} alt={teamName} onError={(e:any)=>{ if(e.currentTarget.src !== '/Logo_aeef.png') e.currentTarget.src = '/Logo_aeef.png'; }} />
                </div>
              );
            })}
          </div>

          <div className="tabs-row">
            <button
              className={`tab-btn ${activeTab==='news' ? 'active' : ''}`}
              onClick={async ()=>{ setActiveTab('news'); if(!news) await fetchNews(); }}
              disabled={loading}
            >Noticias</button>

            <button
              className={`tab-btn ${activeTab==='table' ? 'active' : ''}`}
              onClick={async ()=>{ setActiveTab('table'); if(!standings) await fetchTable(); }}
              disabled={loading}
            >Tabla</button>

            <button
              className={`tab-btn ${activeTab==='calendar' ? 'active' : ''}`}
              onClick={async ()=>{ setActiveTab('calendar'); if(!summary) await fetchCalendar(); }}
              disabled={loading}
            >Calendario</button>

          </div>

          <h1 style={{ color: '#00ffc8', marginTop: 12 }}>Liga Perú — Primera División</h1>

        {loading && <p style={{ color: '#aaa', marginTop: 18 }}>Cargando...</p>}
        {error && <p style={{ color: '#ff8b8b', marginTop: 18 }}>{error}</p>}

        {activeTab === 'table' && standings && (
          <div className="table-wrap" style={{ marginTop: 20 }}>
            <h3 style={{ color: '#00ffc8' }}>Tabla — {tableMeta?.phase || ''}</h3>
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
                  const participant = row.participant || row.team || {};
                  const nameRaw = participant.name ?? row.name ?? row.team ?? '—';
                  const name = formatTeamName(nameRaw);
                  const logo = formatTeamLogo(nameRaw, participant.image_path || participant.logo || row.logo || row.crest || null);
                  const summary = row.summary || row.all || {};
                  const table = row.table || {};
                  const played = table.pj ?? summary.played ?? row.played ?? row.J ?? 0;
                  const win = table.pg ?? summary.won ?? row.win ?? row.G ?? 0;
                  const draw = table.pe ?? summary.draw ?? row.draw ?? row.E ?? 0;
                  const lose = table.pp ?? summary.lost ?? row.lose ?? row.P ?? 0;
                  const goalsFor = table.gf ?? summary.goals_for ?? row.goalsFor ?? row.GF ?? row.gf ?? 0;
                  const goalsAgainst = table.gc ?? summary.goals_against ?? row.goalsAgainst ?? row.GC ?? row.ga ?? 0;
                  const points = table.pts ?? summary.points ?? row.points ?? row.Pts ?? 0;
                  const diff = (typeof summary.goal_difference !== 'undefined')
                    ? summary.goal_difference
                    : (typeof table.dg !== 'undefined')
                      ? table.dg
                      : (goalsFor - goalsAgainst);
                  const dgColor = diff > 0 ? '#7ee787' : diff < 0 ? '#ff8b8b' : '#cfe';
                  const rowBorder = position <= 3 ? '4px solid rgba(0,255,200,0.12)' : '1px solid rgba(255,255,255,0.03)';

                  return (
                    <tr key={idx} style={{ borderTop: rowBorder }} className={position <= 3 ? 'league-pos-top3' : ''}>
                      <td className="league-pos">{position}</td>
                      <td className="league-team-cell">
                          <img src={logo || '/Logo_aeef.png'} alt={name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} onError={(e: any)=>{ if(e.currentTarget.src !== '/Logo_aeef.png') e.currentTarget.src = '/Logo_aeef.png'; }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{name}</span>
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

        

        {activeTab === 'calendar' && summary && (
          <MatchesCalendar
            title="Calendario — Hoy y Proximos"
            matches={summary?.next_fixtures}
          />
        )}

        {activeTab === 'news' && (
          <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
            <h3 style={{ color: '#00ffc8' }}>Noticias recientes — Liga 1</h3>
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
        .top-scorers-wrap{ margin-top:8px }
        .top-scorers-table{ width:100%; color:#fff; border-collapse:collapse }
        .top-scorers-table th, .top-scorers-table td{ padding:10px 8px; border-bottom:1px solid rgba(255,255,255,0.03); white-space:nowrap }
        .top-scorers-table th{ text-align:left; color:#9fb8b0 }

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

const activeTabStyle: React.CSSProperties = {
  boxShadow: 'inset 0 -3px 0 rgba(0,255,200,0.06)',
  border: '1px solid rgba(0,255,200,0.16)'
};
