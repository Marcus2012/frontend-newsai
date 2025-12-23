import React from 'react';

type Props = {
  position?: 'top' | 'between' | 'sidebar' | 'footer' | 'affiliate'
}

export default function BannerSlots({ position = 'top' }: Props) {
  return (
    <div className={`banner-slot banner-${position}`}>
      {position === 'top' && (
        <>
          <div className="leaderboard">Leaderboard (728x90) - Espacio publicitario</div>
          <div className="affiliate-row">
            <div className="aff">BetOne</div>
            <div className="aff">Betano</div>
            <div className="aff">Partner</div>
          </div>
        </>
      )}

      {position === 'between' && (
        <div className="medium">Banner Mediano (300x250) - Venta / Afiliado</div>
      )}

      {position === 'sidebar' && (
        <div className="sidebar">Sidebar Banner (300x600) - Afiliado</div>
      )}

      {position === 'footer' && (
        <div className="footer">Footer Banner (970x90) - Espacio publicitario</div>
      )}

      <style jsx>{`
        .banner-slot{width:100%;display:block;margin:18px 0}
        .leaderboard{height:92px;background:linear-gradient(90deg,#1b223e,#0d1124);border:1px dashed rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border-radius:8px}
        .affiliate-row{display:flex;gap:12px;justify-content:center;margin-top:10px}
        .aff{background:rgba(255,255,255,0.06);padding:8px 14px;border-radius:8px;color:#fff;font-weight:600}
        .medium{height:260px;background:linear-gradient(180deg,#0f1530,#151931);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:1px dashed rgba(255,255,255,0.05)}
        .sidebar{height:600px;background:linear-gradient(180deg,#091124,#0f1630);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:1px dashed rgba(255,255,255,0.05)}
        .footer{height:90px;background:linear-gradient(90deg,#0b122b,#10142b);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;border:1px dashed rgba(255,255,255,0.05)}

        @media (max-width:900px){
          .leaderboard{height:80px}
          .medium{height:140px}
          .sidebar{height:180px}
          .aff{padding:6px 10px;font-size:0.9rem}
        }
      `}</style>
    </div>
  );
}
