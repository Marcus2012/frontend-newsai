import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { formatTeamName, formatTeamLogo } from '../../../lib/teamUtils';
import Link from 'next/link';
import MatchesCalendar from '../../../components/MatchesCalendar';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function CopaSudamericana() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [tableMeta, setTableMeta] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'table'|'calendar'>('table');
  const [groups, setGroups] = useState<any[] | null>(null);
  const [preds, setPreds] = useState<Record<string, any>>({});
  const [upcomingMatches, setUpcomingMatches] = useState<any[] | null>(null);

  async function fetchTable() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/copa-sudamericana/standings`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      const s = json?.response?.[0]?.league?.standings?.[0] || json?.standings || json?.response || json?.data || [];
      const rows = Array.isArray(s) ? s : [];
      setStandings(rows);

      // Build groups from group_id if present and no top-level groups provided
      if (json?.groups && Array.isArray(json.groups) && json.groups.length > 0) {
        setGroups(json.groups);
      } else {
        const groupIds = Array.from(new Set(rows.map((r: any) => r.group_id).filter(Boolean)));
        if (groupIds.length > 1) {
          const sorted = (groupIds as number[]).sort((a, b) => a - b);
          const built = sorted.map((gid, idx) => ({
            group_id: gid,
            group_name: `Grupo ${String.fromCharCode(65 + idx)}`,
            standings: rows
              .filter((r: any) => r.group_id === gid)
              .sort((a: any, b: any) => (a.position ?? 99) - (b.position ?? 99)),
          }));
          setGroups(built);
        } else {
          setGroups(null);
        }
      }

      setTableMeta({ season: json?.season || json?.response?.[0]?.league?.season || null });
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally { setLoading(false); }
  }

  async function fetchSummary() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/football/public/copa-sudamericana/info`);
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
      const today = new Date();
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);
      // use RAW (no season filtering) endpoint to avoid missing fixtures
      const res = await fetch(`${API_BASE}/football/public/copa-sudamericana/fixtures/between/raw?start=${startStr}&end=${endStr}&max_pages=8`);
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

      const getCompText = (m: any) => {
        const vals = [m?.league?.name, m?.league_name, m?.competition?.name, m?.tournament, m?.tournament_name, m?.competition_name];
        return vals.filter(Boolean).join(' ').toLowerCase();
      };

      const todayLocal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const filtered = matches.filter((m: any) => {
        if (m.league_id !== 1116 || m.season_id !== 26783) return false;
        const d = m.starting_at || m.fixture?.date || m.date || m.match_date || m.utcDate || m.iso_date || '';
        const dt = new Date(d);
        const adjusted = new Date(dt.getTime() - 5 * 60 * 60 * 1000);
        const localDate = `${adjusted.getFullYear()}-${String(adjusted.getMonth()+1).padStart(2,'0')}-${String(adjusted.getDate()).padStart(2,'0')}`;
        return localDate >= todayLocal;
      });

      setUpcomingMatches(filtered.slice(0, 20));
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

  function renderStandingsTable(rows: any[]) {
    return (
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
          {rows && rows.length ? rows.map((row: any, idx: number) => {
            const position = row.position ?? idx + 1;
            const participant = row.participant || {};
            const name = participant.name || row.name || `ID ${participant.id || row.participant_id}`;
            const logo = participant.image_path || row.logo || '/logo_placeholder.png';
            const t = row.table || {};
            const rowSummary = row.summary || row.season?.summary || null;
            const played = t.pj ?? rowSummary?.played ?? row.played ?? row.games_played ?? row.matches_played ?? row.PJ ?? 0;
            const win = t.pg ?? rowSummary?.won ?? row.win ?? row.wins ?? row.PG ?? 0;
            const draw = t.pe ?? rowSummary?.draw ?? row.draw ?? row.draws ?? row.PE ?? 0;
            const lose = t.pp ?? rowSummary?.lost ?? row.lose ?? row.losses ?? row.PP ?? 0;
            const goalsFor = t.gf ?? rowSummary?.goals_for ?? row.goals_for ?? row.goalsfor ?? row.GF ?? 0;
            const goalsAgainst = t.gc ?? rowSummary?.goals_against ?? row.goals_against ?? row.goalsagainst ?? row.GC ?? 0;
            const points = t.pts ?? rowSummary?.points ?? row.points ?? row.Pts ?? 0;
            const diff = t.dg ?? (typeof rowSummary?.goal_difference !== 'undefined'
              ? rowSummary?.goal_difference
              : (typeof row.goal_difference !== 'undefined')
                ? row.goal_difference
                : (goalsFor - goalsAgainst));
            const dgColor = diff > 0 ? '#7ee787' : diff < 0 ? '#ff8b8b' : '#cfe';
            const topN = (rows.length <= 6) ? 2 : 4;
            const rowBorder = position <= topN ? '4px solid rgba(0,255,200,0.12)' : '1px solid rgba(255,255,255,0.03)';

            return (
              <tr key={idx} style={{ borderTop: rowBorder }} className={position <= topN ? 'league-pos-top3' : ''}>
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
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#071026', color: '#fff' }}>
      <Header />
      <div className="container-max main-layout" style={{ gridTemplateColumns: '1fr', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="logos-row">
            {(groups && groups.length > 0
              ? groups.flatMap((g: any) => (g.standings || []).slice(0, 4))
              : (standings || []).slice(0, 20)
            ).map((row: any, i: number) => {
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

          <h1 style={{ color: '#00ffc8', marginTop: 12 }}>Copa Sudamericana — CONMEBOL</h1>

          {loading && <p style={{ color: '#aaa', marginTop: 18 }}>Cargando...</p>}
          {error && <p style={{ color: '#ff8b8b', marginTop: 18 }}>{error}</p>}

          {activeTab === 'table' && standings && (
            <div className="table-wrap" style={{ marginTop: 20 }}>
              <h3 style={{ color: '#00ffc8' }}>Tabla — {tableMeta?.season || ''}</h3>
              {groups && groups.length > 0 ? (
                groups.map((group: any) => (
                  <div key={group.group_id} style={{ marginBottom: 32 }}>
                    <h4 style={{ color: '#00ffc8', margin: '18px 0 8px' }}>{group.group_name}</h4>
                    {renderStandingsTable(group.standings || [])}
                  </div>
                ))
              ) : (
                renderStandingsTable(standings)
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <MatchesCalendar
              title="Calendario — Partidos"
              matches={upcomingMatches}
              loading={loading}
              preds={preds}
              onPredict={fetchPrediction}
            />
          )}
        </div>

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
