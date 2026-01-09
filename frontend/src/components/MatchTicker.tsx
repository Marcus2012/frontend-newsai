import React from 'react';

type Match = { league: string; home: string; away: string; score?: string; time?: string };

const demo: Match[] = [
  { league: 'Liga Peruana', home: 'Alianza Lima', away: 'Universitario', score: '1 - 0', time: '03:15 P.M.' },
  { league: 'Liga Peruana', home: 'Sporting Cristal', away: 'Melgar', score: '2 - 1', time: '12:30 P.M.' },
  { league: 'Liga Peruana', home: 'César Vallejo', away: 'Cusco FC', score: '0 - 0', time: '01:15 P.M.' },
];

export default function MatchTicker({ matches = demo }: { matches?: Match[] }) {
  return (
    <div className="match-ticker">
      <div className="ticker-inner">
        {matches.map((m, i) => (
          <div className="match" key={i}>
            <div className="league">{m.league}</div>
            <div className="teams">
              <div className="team-left">{m.home}</div>
              <div className="score">{m.score ?? '-'}</div>
              <div className="team-right">{m.away}</div>
            </div>
            <div className="time">{m.time}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .match-ticker{background:linear-gradient(90deg,#0f1630,#0a0e27);border-radius:10px;padding:12px;margin:20px 0;border:1px solid rgba(0,255,200,0.04)}
        .ticker-inner{display:flex;gap:14px;overflow:auto;padding-bottom:4px}
        .match{min-width:260px;background:rgba(255,255,255,0.02);padding:10px;border-radius:8px;border:1px solid rgba(0,255,200,0.03);display:flex;flex-direction:column;gap:6px}
        .league{font-size:0.8rem;color:#00ffc8;font-weight:700}
        .teams{display:flex;align-items:center;justify-content:space-between;font-weight:700;color:#fff}
        .score{background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:6px}
        .time{font-size:0.8rem;color:#aaa}

        @media (max-width:900px){
          .match{min-width:200px}
        }
      `}</style>
    </div>
  );
}
