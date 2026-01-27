import React from 'react';

type Match = { league: string; home: string; away: string; score?: string; time?: string };

const demo: Match[] = [
  { league: 'Liga Peruana', home: 'Alianza Lima', away: 'Inter Miami', score: '3 - 0', time: '' },
  { league: 'Liga Peruana', home: 'Universitario', away: 'U. de Chile', score: '3 - 0', time: '' },
  { league: 'Liga Peruana', home: 'Sporting Cristal', away: 'U. Cátolica', score: '3 - 1', time: '' },
  { league: 'Liga Peruana', home: 'Sport Boys', away: 'Everton', score: '2 - 3', time: '' },
  { league: 'Liga Peruana', home: 'Melgar', away: 'Macará', score: '2 - 1', time: '' },
  { league: 'Liga Peruana', home: 'Cienciano', away: 'Bolívar', score: '1 - 1', time: '' },
];

export default function MatchTicker({ matches = demo }: { matches?: Match[] }) {
  const loopMatches = [...matches, ...matches];

  return (
    <div className="match-ticker" aria-label="Marcadores en carrusel">
      <div className="ticker-viewport">
        <div className="ticker-track">
          {loopMatches.map((m, i) => (
            <div className="match" key={`${m.home}-${m.away}-${i}`}>
            <div className="league">{m.league}</div>
            <div className="teams">
              <div className="team-left">{m.home}</div>
              <div className="score">{m.score ?? '-'}</div>
              <div className="team-right">{m.away}</div>
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
        .match{min-width:260px;background:rgba(255,255,255,0.02);padding:10px;border-radius:8px;border:1px solid rgba(0,255,200,0.03);display:flex;flex-direction:column;gap:6px}
        .league{font-size:0.8rem;color:#00ffc8;font-weight:700}
        .teams{display:flex;align-items:center;justify-content:space-between;font-weight:700;color:#fff}
        .score{background:rgba(255,255,255,0.06);padding:4px 8px;border-radius:6px}
        .score-top{display:none}
        .team-left,.team-right{line-height:1.1}
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
          .ticker-track{gap:10px;animation-duration:22s}
          .match{min-width:170px;padding:8px;gap:4px}
          .league{font-size:0.72rem}
          .teams{font-size:0.85rem;gap:4px;flex-direction:column;align-items:flex-start}
          .score{display:none}
          .score-top{display:inline-flex;align-self:flex-start;background:rgba(255,255,255,0.08);padding:3px 6px;border-radius:5px;font-size:0.78rem;font-weight:800;color:#fff}
          .team-left,.team-right{max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .time{font-size:0.7rem}
        }
        @media (max-width:380px){
          .match{min-width:155px}
          .team-left,.team-right{max-width:110px}
        }
      `}</style>
    </div>
  );
}
