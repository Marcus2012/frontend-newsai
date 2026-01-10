
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BannerSlots from '../components/BannerSlots';
import SampleAdBanner from '../components/SampleAdBanner';
import BannerEasyPromo from '../components/BannerEasyPromo';
import React, { useState } from 'react';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setEnviado(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, copia: 'contacto@asieselfutbol.com' }),
      });
      if (!res.ok) throw new Error('Error al enviar el mensaje');
      setEnviado(true);
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (err: any) {
      setError(err.message || 'Error al enviar');
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      <Header />
      <div style={{ maxWidth: '100%', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '1500px', width: '100%', padding: '40px' }}>
          <h1 style={{ color: '#00ffc8', fontSize: '2em', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Contáctanos</h1>
          <p style={{ color: '#cfe', fontSize: '1.15em', marginBottom: '32px', textAlign: 'center' }}>
            ¿Tienes alguna pregunta o sugerencia? Escríbenos y te responderemos lo antes posible.
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            <div style={{ borderRadius: '14px', padding: '16px 0px', minWidth: 220, flex: 1, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,255,200,0.07)' }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>✉️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Email</div>
              <div style={{ color: '#00ffc8', fontSize: '1em', marginBottom: '4px' }}>contacto@asieselfutbol.com</div>
            </div>
            <div style={{ borderRadius: '14px', padding: '16px 0px', minWidth: 220, flex: 1, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,255,200,0.07)' }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>📍</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Oficina</div>
              <div style={{ color: '#00ffc8', fontSize: '1em', marginBottom: '4px' }}>Lima, Perú</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
            <form onSubmit={handleSubmit} style={{ borderRadius: '14px', padding: '32px 24px', maxWidth: 420, width: '100%', boxShadow: '0 2px 12px rgba(0,255,200,0.07)' }}>
              <h3 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '18px', textAlign: 'center' }}>Envíanos un Mensaje</h3>
              <label style={{ color: '#ccc', fontSize: '1em', fontWeight: 600 }}>Nombre</label>
              <input type="text" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre" style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: 'none', background: '#222', color: '#fff', fontSize: '1em' }} />
              <label style={{ color: '#ccc', fontSize: '1em', fontWeight: 600 }}>Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: 'none', background: '#222', color: '#fff', fontSize: '1em' }} />
              <label style={{ color: '#ccc', fontSize: '1em', fontWeight: 600 }}>Mensaje</label>
              <textarea required value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Escribe tu mensaje..." style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: 'none', background: '#222', color: '#fff', minHeight: '90px', fontSize: '1em' }} />
              <button type="submit" style={{ background: '#00ffc8', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', padding: '12px 0', cursor: 'pointer', marginTop: '10px', width: '100%', fontSize: '1.1em' }}>Enviar</button>
              {enviado && <div style={{ color: '#00ffc8', marginTop: 14, textAlign: 'center', fontWeight: 700 }}>¡Mensaje enviado correctamente!</div>}
              {error && <div style={{ color: '#ff8b8b', marginTop: 14, textAlign: 'center' }}>{error}</div>}
            </form>
            {/* Banner a la derecha solo en desktop */}
            <div className="contact-banner-desktop" style={{ display: 'none' }}>
              <a href="https://www.mundodeportivo.com/us/apuestas-latam/ir-betano-pe" target="_blank" rel="prefetch noreferrer noopener" style={{ width: 320, display: 'block' }}>
                <img
                  src="https://www.mundodeportivo.com/us/apuestas-latam/thumbor/IqTBUbo8B6ts0mowThRlyTbj8rY=/394x674/smart/filters:format(webp)/https%3A%2F%2Fwww.mundodeportivo.com%2Fus%2Fapuestas-latam%2Fapp%2Fuploads%2F2025%2F11%2Fgirosgratis-betano-peru-min.webp"
                  alt="bono betano giros gratis"
                  style={{ width: 320, borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
                />
              </a>
            </div>
          </div>
      <style jsx>{`
        @media (min-width: 900px) {
          .contact-banner-desktop {
            display: block !important;
            min-width: 320px;
            max-width: 340px;
          }
        }
      `}</style>

          {/* Mobile banner below content (visible only on small screens) */}
          {/*
          <div className="mobile-banner-bottom">
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: 340 }}>
                <BannerEasyPromo />
              </div>
              
              <a href="https://www.mundodeportivo.com/us/apuestas-latam/ir-betano-pe" target="_blank" rel="prefetch noreferrer noopener" style={{ width: '100%', maxWidth: 340 }}>
                <img
                  src="https://www.mundodeportivo.com/us/apuestas-latam/thumbor/IqTBUbo8B6ts0mowThRlyTbj8rY=/394x674/smart/filters:format(webp)/https%3A%2F%2Fwww.mundodeportivo.com%2Fus%2Fapuestas-latam%2Fapp%2Fuploads%2F2025%2F11%2Fgirosgratis-betano-peru-min.webp"
                  alt="bono betano giros gratis"
                  style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
                />
              </a>
            </div>
          </div>
          */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
