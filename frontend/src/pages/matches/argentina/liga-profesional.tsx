import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { formatTeamName } from '../../../lib/teamUtils';
import MatchesCalendar from '../../../components/MatchesCalendar';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function ArgentinaLigaProfesional() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [tableMeta, setTableMeta] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'table'|'calendar'>('table');
  const [preds, setPreds] = useState<Record<string, any>>({});
  const [upcomingMatches, setUpcomingMatches] = useState<any[] | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/argentina-liga-profesional/standings`);
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
      const res = await fetch(`${API_BASE}/football/public/argentina-liga-profesional/info`);
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
      const res = await fetch(`${API_BASE}/football/public/argentina-liga-profesional/fixtures?next=20`);
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

  useEffect(() => {
    fetchSummary();
    fetchTable();
    setActiveTab('table');
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
  const filteredStandings = (standings || []).filter((row: any) => {
    const rowSummary = row.summary || row.season?.summary || null;
    const points = rowSummary?.points ?? row.points ?? row.Pts ?? 0;
    return Number(points) > 0;
  });

  const groupAStandings = filteredStandings.filter((row: any) => {
    const groupId = row.group_id ?? row.group?.id ?? row.group?.group_id;
    return Number(groupId) === 253454;
  });

  const groupBStandings = filteredStandings.filter((row: any) => {
    const groupId = row.group_id ?? row.group?.id ?? row.group?.group_id;
    return Number(groupId) === 253455;
  });

  const showGroupedTables = groupAStandings.length > 0 || groupBStandings.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#071026', color: '#fff' }}>
      <Header />
      <div className="container-max main-layout" style={{ gridTemplateColumns: '1fr', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="logos-row">
            {filteredStandings.slice(0, 20).map((row: any, i: number) => {
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
            <button className={`tab-btn ${activeTab==='table' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('table'); if(!standings) await fetchTable(); }} disabled={loading}>Tabla</button>
            <button className={`tab-btn ${activeTab==='calendar' ? 'active' : ''}`} onClick={async ()=>{ setActiveTab('calendar'); if(!upcomingMatches || upcomingMatches.length===0) await fetchCalendar(); }} disabled={loading}>Calendario</button>
          </div>

          <h1 style={{ color: '#00ffc8', marginTop: 12 }}>Argentina — Liga Profesional</h1>

          {loading && <p style={{ color: '#aaa', marginTop: 18 }}>Cargando...</p>}
          {error && <p style={{ color: '#ff8b8b', marginTop: 18 }}>{error}</p>}

          {activeTab === 'table' && standings && (
            <div className="table-wrap" style={{ marginTop: 20 }}>
              <h3 style={{ color: '#00ffc8' }}>Tabla — {tableMeta?.season || ''}</h3>
              {showGroupedTables ? (
                <>
                  {groupAStandings.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ color: '#9fb8b0', marginBottom: 8 }}>Grupo A</h4>
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
                          {groupAStandings.map((row: any, idx: number) => {
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
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {groupBStandings.length > 0 && (
                    <div>
                      <h4 style={{ color: '#9fb8b0', marginBottom: 8 }}>Grupo B</h4>
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
                          {groupBStandings.map((row: any, idx: number) => {
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
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
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
                    {filteredStandings.length ? filteredStandings.map((row: any, idx: number) => {
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
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <MatchesCalendar
              title="Calendario — Proximos"
              matches={upcomingMatches}
              loading={loading}
              preds={preds}
              onPredict={fetchPrediction}
            />
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

        @media (max-width: 900px){
          .main-layout{ flex-direction:column; }
          .logos-row{ justify-content:flex-start; padding-left:8px }
          .logo-item img{ width:40px; height:40px }
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
        }
      `}</style>
    </div>
  );
}
