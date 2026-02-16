import React from 'react';
import { formatTeamName, formatTeamLogo } from '../lib/teamUtils';

type MatchesCalendarProps = {
  title?: string;
  matches?: any[] | null;
  loading?: boolean;
  preds?: Record<string, any>;
  onPredict?: (match: any, index: number) => void;
};

export default function MatchesCalendar({
  title = 'Calendario',
  matches,
  loading,
  preds = {},
  onPredict,
}: MatchesCalendarProps) {
  const safeMatches = Array.isArray(matches) ? matches : [];

  const getParticipants = (f: any) => f?.participants ?? f?.fixture?.participants ?? [];
  const getByLocation = (participants: any[], loc: string) => {
    if (!Array.isArray(participants)) return null;
    return participants.find((p: any) => {
      const meta = p.meta || p.participant?.meta || {};
      const location = meta.location || meta.side || meta.position || meta.place || '';
      return String(location).toLowerCase() === loc;
    }) || null;
  };

  return (
    <div style={{ marginTop: 20, background: 'rgba(10,14,39,0.7)', padding: 12, borderRadius: 8 }}>
      <h3 style={{ color: '#00ffc8' }}>{title}</h3>
      {loading && <div style={{ color: '#9aa' }}>Cargando partidos...</div>}
      {!loading && safeMatches.length ? (
        <div className="matches-grid">
          {safeMatches.map((f: any, i: number) => {
            const participants = getParticipants(f);
            const homeP = getByLocation(participants, 'home');
            const awayP = getByLocation(participants, 'away');

            const home = homeP?.name ?? homeP?.participant?.name ?? f.teams?.home?.name ?? f.home?.name ?? f.home ?? f.home_team ?? (f.home_team_name || '');
            const away = awayP?.name ?? awayP?.participant?.name ?? f.teams?.away?.name ?? f.away?.name ?? f.away ?? f.away_team ?? (f.away_team_name || '');
            const homeLogo = homeP?.image_path ?? homeP?.participant?.image_path ?? f.teams?.home?.logo ?? f.home?.logo ?? f.home_logo ?? null;
            const awayLogo = awayP?.image_path ?? awayP?.participant?.image_path ?? f.teams?.away?.logo ?? f.away?.logo ?? f.away_logo ?? null;

            const date = f.starting_at ?? f.fixture?.date ?? f.date ?? f.match_date ?? f.utcDate ?? f.iso_date ?? null;
            const dt = date ? new Date(date) : null;
            const formattedDate = dt ? dt.toLocaleDateString('es-PE', { day: '2-digit', month: 'numeric', year: 'numeric' }) : '';
            const formattedTime = dt ? dt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div key={i} className="match-card">
                <div className="match-card-inner">
                  <div className="match-date-top">{formattedDate}</div>
                  <div className="match-main">
                    <div className="team team-home centered">
                      <img src={formatTeamLogo(home, homeLogo)} alt={home} onError={(e: any) => { if (e.currentTarget.src.indexOf('/logo_placeholder') === -1) e.currentTarget.src = '/logo_placeholder.png'; }} />
                      <div className="team-name">{formatTeamName(home)}</div>
                    </div>

                    <div className="center-time">
                      <div className="match-time">{formattedTime}</div>
                    </div>

                    <div className="team team-away centered">
                      <div className="team-name">{formatTeamName(away)}</div>
                      <img src={formatTeamLogo(away, awayLogo)} alt={away} onError={(e: any) => { if (e.currentTarget.src.indexOf('/logo_placeholder') === -1) e.currentTarget.src = '/logo_placeholder.png'; }} />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (!loading && <div style={{ color: '#aaa' }}>No hay partidos en el calendario</div>)}

      <style jsx global>{`
        .matches-grid{ display:flex; flex-direction:column; gap:14px }
        .match-card{ background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02)); padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.04); transition: transform .12s ease, box-shadow .12s ease }
        .match-card:hover{ transform: translateY(-4px); box-shadow: 0 12px 30px rgba(2,6,23,0.6) }
        .match-card-inner{ position:relative }
        .match-date-top{ position:absolute; right:16px; top:10px; color:#9aa; font-size:0.85em }
        .match-main{ display:grid; grid-template-columns: 1fr 120px 1fr; align-items:center; gap:20px; padding:8px 12px }
        .team.centered{ display:flex; align-items:center; gap:10px; flex-direction:row; min-width:0; justify-content:flex-start }
        .team.centered img{ width:34px; height:34px; object-fit:contain; border-radius:6px; flex-shrink:0 }
        .team.centered .team-name{ font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px }
        .team-away.centered{ flex-direction:row-reverse; justify-content:flex-end }
        .team-away.centered .team-name{ text-align:right }
        .center-time{ display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:0 }
        .match-time{ font-weight:900; color:#00ffc8; font-size:1.05em; letter-spacing:0.2px }
        @media (max-width: 700px){
          .match-main{ grid-template-columns: 1fr; gap:10px; padding:10px }
          .match-date-top{ position:static; text-align:center; padding-bottom:6px }
          .team.centered{ justify-content:center }
          .team-away.centered{ flex-direction:row; justify-content:center }
          .team.centered .team-name{ max-width:160px }
        }
      `}</style>
    </div>
  );
}
