import React, { useState } from 'react'


export default function BannerEasyPromo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const payload = {
        external_id: user.id || user._id || user.email || user.username,
        first_name: 'Asi es',
        last_name: 'El Futbol',
        nickname: user.username,
        email: user.email,
        phone: '',
        country: 'ES'
      }

      const res = await fetch('/api/easypromo/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      // El endpoint ahora devuelve { easypromo: { promo_url }, ... }
      const promo = json?.easypromo?.promo_url || json?.promo_url
      if (!res.ok) throw new Error(json?.error || json?.easypromo?.raw?.error || 'register failed')

      if (promo) {
        window.open(promo, '_blank', 'noopener')
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
    </div>
  )
}
