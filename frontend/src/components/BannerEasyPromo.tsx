
import React, { useState, useEffect } from 'react'


export default function BannerEasyPromo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [promoUrl, setPromoUrl] = useState<string | null>(null)

  // Leer usuario de localStorage
  function getUserFromStorage() {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('strapi_user')
      if (!stored) return null
      const parsed = JSON.parse(stored)
      if (parsed && parsed.username && parsed.email) return parsed
      return null
    } catch { return null }
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = getUserFromStorage()
      if (!user) {
        setError('Debes iniciar sesión para jugar y participar en la promo.')
        setLoading(false)
        return
      }

      // Si el usuario tiene email y username, intentamos registro completo
      let payload: any = {
        external_id: user.id || user._id || user.email || user.username
      }
      if (user.email && user.username) {
        payload = {
          external_id: user.id || user._id || user.email || user.username,
          first_name: 'Asiesel',
          last_name: 'futbol',
          nickname: user.username,
          email: user.email,
          phone: user.phone || '',
          country: 'ES'
        }
      }

      const res = await fetch('/api/easypromo/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      // El endpoint devuelve { easypromo: { lt }, ... }
      const lt = json?.easypromo?.lt || json?.lt
      const urlPromoBase = 'https://a.cstmapp.com/p/1005559'
      const promo = lt ? `${urlPromoBase}?lt=${encodeURIComponent(lt)}` : null
      if (!res.ok) throw new Error(json?.error || json?.easypromo?.raw?.error || 'register failed')

      if (promo) {
        setPromoUrl(promo)
        setModalOpen(true)
      } else {
        setError('No se pudo obtener la URL del juego')
      }
    } catch (err: any) {
      setError(err?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  // Toggle body class when modal is open so header can react (z-index changes)
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (modalOpen) {
      document.body.classList.add('promo-open')
    } else {
      document.body.classList.remove('promo-open')
    }
    return () => { document.body.classList.remove('promo-open') }
  }, [modalOpen])

  return (
    <div className="easy-promo">
      <button onClick={handleClick} disabled={loading} className="play-btn">
        {loading ? 'Registrando...' : 'Juega ahora — Gana premios'}
      </button>
      {error && <div className="error-txt">{error}</div>}

      {/* Modal con iframe del juego */}
      {modalOpen && promoUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: 'calc(var(--vh,1vh) * 100)',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="promo-modal-inner">
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#fff',
                border: '1px solid #ff7a00',
                color: '#ff7a00',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                zIndex: 2
              }}
            >
              Cerrar
            </button>
            <iframe
              src={promoUrl}
              title="Juego Easypromos"
              className="promo-iframe"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}
      <style jsx>{`
        .easy-promo{width:100%;max-width:420px;margin:0 auto;text-align:center;padding:0 8px;display:flex;justify-content:center;align-items:center}
        .play-btn{width:100%;background:linear-gradient(90deg,#ff7a00,#ffcf00);color:#000;padding:12px 16px;border-radius:12px;font-weight:700;box-shadow:0 8px 30px rgba(255,124,0,0.18);font-size:1rem;border:none;cursor:pointer}
        .play-btn[disabled]{opacity:0.7;cursor:not-allowed}
        .error-txt{margin-top:8px;color:#ffb3b3;font-size:13px}

        .promo-modal-inner{background:#fff;border-radius:12px;padding:0;width:100%;max-width:98vw;min-width:320px;min-height:600px;height:95vh;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.18);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:relative;margin:0 auto}
        .promo-modal-inner button{position:absolute;top:12px;right:12px;z-index:2}
        .promo-iframe{width:100%;height:calc(95vh - 48px);min-height:540px;border:none;border-radius:12px;margin-top:0}

        @media (max-width:640px){
          .easy-promo{max-width:325px;padding:0 8px;display:flex;justify-content:center;align-items:center;margin:0 auto}
          .play-btn{padding:10px 14px;border-radius:10px;font-size:0.95rem}
          .promo-modal-inner{min-width:260px;min-height:220px;border-radius:10px;max-height:calc(var(--vh,1vh) * 100 - 16px);height:auto}
          .promo-iframe{height:calc(var(--vh,1vh) * 100 - 140px);min-height:300px}
        }

        @media (min-width:641px){
          .easy-promo{max-width:420px}
        }
      `}</style>
    </div>
  )
}
