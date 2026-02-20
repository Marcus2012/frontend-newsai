import React, { useEffect, useState } from 'react';

type Match = { league: string; home: string; away: string; score?: string; time?: string; day?: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function MatchTicker({ matches }: { matches?: Match[] }) {
  const [fixtureMatches, setFixtureMatches] = useState<Match[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth <= 640);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    let cancelled = false;

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

    const getMatchDate = (f: any) => (
      f?.starting_at ?? f?.fixture?.date ?? f?.date ?? f?.match_date ?? f?.utcDate ?? f?.iso_date ?? null
    );

    const toMatch = (f: any): Match => {
      const participants = f?.participants ?? f?.fixture?.participants ?? [];
      const byLoc = (loc: string) => Array.isArray(participants)
        ? participants.find((p: any) => {
            const meta = p.meta || p.participant?.meta || {};
            const location = meta.location || meta.side || meta.position || meta.place || '';
            return String(location).toLowerCase() === loc;
          })
        : null;

      const homeP = byLoc('home');
      const awayP = byLoc('away');

      const home = homeP?.name ?? homeP?.participant?.name ?? f.teams?.home?.name ?? f.home?.name ?? f.home ?? f.home_team ?? (f.home_team_name || '');
      const away = awayP?.name ?? awayP?.participant?.name ?? f.teams?.away?.name ?? f.away?.name ?? f.away ?? f.away_team ?? (f.away_team_name || '');
      const date = getMatchDate(f);
      const dt = date ? new Date(date) : null;
      const time = dt ? dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
      const day = dt ? dt.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' }) : '';

      const homeScore = (f.result?.home ?? f.score?.home ?? f.goals?.home ?? f.goals_home ?? null);
      const awayScore = (f.result?.away ?? f.score?.away ?? f.goals?.away ?? f.goals_away ?? null);
      const score = (homeScore !== null && awayScore !== null) ? `${homeScore} - ${awayScore}` : '-';

      return {
        league: 'Liga Peruana',
        home: String(home || '').trim() || 'Local',
        away: String(away || '').trim() || 'Visita',
        score,
        time,
        day,
      };
    };

    const fetchFixtures = async () => {
      const today = new Date();
      const dateRange = Array.from({ length: 8 }, (_, idx) => {
        const d = new Date(today);
        d.setDate(d.getDate() + idx);
        return d.toISOString().slice(0, 10);
      });

      const results = await Promise.all(
        dateRange.map(async (date) => {
          const res = await fetch(`${API_BASE}/football/public/peru-primera/fixtures?date=${date}`);
          if (!res.ok) return [];
          const json = await res.json();
          return extractMatches(json || {});
        })
      );

      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);

      const filtered = results.flat().filter((f: any) => {
        const rawDate = getMatchDate(f);
        if (!rawDate) return false;
        const dt = new Date(rawDate);
        return dt >= start && dt <= end;
      });

      filtered.sort((a: any, b: any) => {
        const ad = new Date(getMatchDate(a) || 0).getTime();
        const bd = new Date(getMatchDate(b) || 0).getTime();
        return ad - bd;
      });

      const mapped = filtered.map(toMatch).filter((m: Match) => m.home && m.away);
      if (!cancelled) setFixtureMatches(mapped.length ? mapped : null);
    };

    fetchFixtures().catch(() => {
      if (!cancelled) setFixtureMatches(null);
    });

    return () => { cancelled = true; };
  }, []);

  const effectiveMatches = (fixtureMatches && fixtureMatches.length)
    ? fixtureMatches
    : (Array.isArray(matches) ? matches : []);
  const loopMatches = isMobile ? effectiveMatches : [...effectiveMatches, ...effectiveMatches];

  return (
    <div className="match-ticker" aria-label="Marcadores en carrusel">
      <div className="ticker-viewport">
        <div className="ticker-track">
          {loopMatches.map((m, i) => (
            <div className="match" key={`${m.home}-${m.away}-${i}`}>
              <div className="match-top">
                <div className="league">{m.league}</div>
                <div className="day">{m.day}</div>
              </div>
              <div className="teams">
                <div className="team-left" title={m.home}>{m.home}</div>
                <div className="score">{m.score ?? '-'}</div>
                <div className="team-right" title={m.away}>{m.away}</div>
              </div>
              <div className="score-top">{m.score ?? '-'}</div>
              <div className="time">{m.time}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .match-ticker{background:linear-gradient(90deg,#0f1630,#0a0e27);border-radius:10px;padding:12px;margin:20px 0;border:1px solid rgba(0,255,200,0.04)}
        .ticker-viewport{overflow:hidden}
        .ticker-track{display:flex;gap:14px;animation:ticker-scroll 28s linear infinite;will-change:transform}
        .ticker-viewport:hover .ticker-track{animation-play-state:paused}
        .match{min-width:260px;background:linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01));padding:12px;border-radius:10px;border:1px solid rgba(0,255,200,0.08);display:flex;flex-direction:column;gap:8px;box-shadow:0 10px 24px rgba(0,0,0,0.18)}
        .match-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .league{font-size:0.82rem;color:#00ffc8;font-weight:800;text-transform:uppercase;letter-spacing:0.02em}
        .day{font-size:0.78rem;color:#d8e0ff;background:rgba(255,255,255,0.06);padding:3px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.08)}
        .teams{display:flex;align-items:center;justify-content:space-between;font-weight:800;color:#fff;gap:10px;min-width:0}
        .score{background:rgba(255,255,255,0.08);padding:4px 10px;border-radius:7px}
        .score-top{display:none}
        .team-left,.team-right{line-height:1.1;flex:1 1 0;min-width:0;max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .time{font-size:0.8rem;color:#aaa}

        @keyframes ticker-scroll{
          0%{transform:translateX(0)}
          100%{transform:translateX(-50%)}
        }

        @media (max-width:900px){
          .match{min-width:200px}
        }
        @media (max-width:640px){
          .match-ticker{padding:10px}
          .ticker-viewport{overflow:visible}
          .ticker-track{gap:10px;animation:none;flex-direction:column}
          .match{min-width:0;width:100%;padding:10px;gap:6px}
          .league{font-size:0.78rem}
          .day{font-size:0.74rem}
          .teams{font-size:0.95rem;gap:6px;flex-direction:column;align-items:flex-start}
          .score{display:none}
          .score-top{display:inline-flex;align-self:flex-start;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:5px;font-size:0.78rem;font-weight:800;color:#fff}
          .team-left,.team-right{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .time{font-size:0.75rem}
        }
        @media (max-width:380px){
          .match{min-width:155px}
          .team-left,.team-right{max-width:110px}
        }
      `}</style>
    </div>
  );
}
