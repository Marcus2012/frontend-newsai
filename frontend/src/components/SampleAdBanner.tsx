import React from 'react'

export default function SampleAdBanner() {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
      <div style={{ width: '100%', maxWidth: 1200, padding: '0 20px' }}>
        <div className="sample-ad">
          <div className="leaderboard">Leaderboard (728x90) — Banner de ejemplo — NO PRODUCCIÓN</div>
          <div className="mobile-banner">
            <img src="https://via.placeholder.com/320x100.png?text=Banner+movil+ejemplo" alt="banner movil" style={{ width: '100%', borderRadius: 8 }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .sample-ad { width: 100%; }
        .leaderboard { background: linear-gradient(90deg,#2b3346,#0f1724); color: #fff; height: 92px; display:flex; align-items:center; justify-content:center; border-radius:8px; box-shadow:0 6px 24px rgba(0,0,0,0.3); font-weight:700 }
        .mobile-banner { display: none }
        @media (max-width: 900px) {
          .leaderboard { display: none }
          .mobile-banner { display: block }
        }
      `}</style>
    </div>
  )
}
