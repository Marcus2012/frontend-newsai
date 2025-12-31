
import React, { useState } from 'react'


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

  return (
    <div style={{ width: '320px', textAlign: 'center' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: '100%',
          background: 'linear-gradient(90deg,#ff7a00,#ffcf00)',
          color: '#000',
          padding: '12px 16px',
          borderRadius: 12,
          fontWeight: '700',
          boxShadow: '0 8px 30px rgba(255,124,0,0.18)'
        }}
      >
        {loading ? 'Registrando...' : 'Juega ahora — Gana premios'}
      </button>
      {error && <div style={{ marginTop: 8, color: '#ffb3b3', fontSize: 13 }}>{error}</div>}

      {/* Modal con iframe del juego */}
      {modalOpen && promoUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 0,
            minWidth: 350,
            maxWidth: '90vw',
            minHeight: 500,
            maxHeight: '90vh',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
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
              style={{
                width: '80vw',
                height: '80vh',
                minWidth: 350,
                minHeight: 500,
                border: 'none',
                borderRadius: 12,
                marginTop: 0
              }}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
