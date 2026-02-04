import React, { useEffect, useState } from 'react'

export default function SampleAdBanner() {
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    setTimestamp(Date.now().toString());
  }, []);

  if (!timestamp) return null; // Solo renderiza en el cliente

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
      <div style={{ width: '100%', maxWidth: 1200, padding: '0 20px' }}>
        <div className="sample-ad">
          {/*<div className="leaderboard">Leaderboard (728x90) — Banner de ejemplo — NO PRODUCCIÓN</div>*/}
          <div className="banner-img">
            <img
              src={`https://storage.googleapis.com/asieselfutbol/production-statics/TA_BANNER_REGISTRO-GENERICO_1913X419-1024x224.jpg?v=${timestamp}`}
              alt="banner"
              style={{
                display: 'block',
                margin: '0 auto',
                maxWidth: 728,
                width: '100%',
                height: 'auto',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                background: '#181f34',
                padding: 0
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .sample-ad { width: 100%; }
        .leaderboard { background: linear-gradient(90deg,#2b3346,#0f1724); color: #fff; height: 92px; display:flex; align-items:center; justify-content:center; border-radius:8px; box-shadow:0 6px 24px rgba(0,0,0,0.3); font-weight:700; margin-bottom: 16px; }
        .banner-img {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 12px 0;
          border-radius: 16px;
        }
        @media (max-width: 900px) {
          .leaderboard { display: none }
        }
      `}</style>
    </div>
  )
}
