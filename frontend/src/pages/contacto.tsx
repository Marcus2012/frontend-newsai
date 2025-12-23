
import Link from 'next/link';
import Header from '../components/Header';

export default function Contacto() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      <Header />

      {/* Main Content */}
      <div style={{ maxWidth: '100%', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '1100px', width: '100%', background: 'rgba(26, 31, 66, 0.7)', borderRadius: '12px', padding: '40px', boxShadow: '0 0 30px rgba(0,255,200,0.05)' }}>
          <h1 style={{ color: '#00ffc8', fontSize: '2em', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Contáctanos</h1>
          <p style={{ color: '#ccc', fontSize: '1.15em', marginBottom: '40px', textAlign: 'center' }}>
            ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible.
          </p>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '24px 18px', minWidth: 200, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>✉️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Email</div>
              <div style={{ color: '#00ffc8', fontSize: '1em', marginBottom: '4px' }}>contacto@aisportspredictor.com</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>Respuesta en 24 horas</div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '24px 18px', minWidth: 200, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>📞</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Teléfono</div>
              <div style={{ color: '#00ffc8', fontSize: '1em', marginBottom: '4px' }}>+1 (555) 123-4567</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>Lun - Vie, 9:00 - 18:00</div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '24px 18px', minWidth: 200, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>📍</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Oficina</div>
              <div style={{ color: '#00ffc8', fontSize: '1em', marginBottom: '4px' }}>123 Tech Street, Silicon Valley</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>California, USA</div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '24px 18px', minWidth: 200, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>💬</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Soporte</div>
              <div style={{ color: '#00ffc8', fontSize: '1em', marginBottom: '4px' }}>soporte@aisportspredictor.com</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>Asistencia técnica 24/7</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
            <form style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '30px 24px', minWidth: 320, maxWidth: 400, flex: 1, textAlign: 'left' }}>
              <h3 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '18px' }}>Envíanos un Mensaje</h3>
              <label style={{ color: '#ccc', fontSize: '1em' }}>Nombre</label>
              <input type="text" placeholder="Tu nombre" style={{ width: '100%', marginBottom: '14px', padding: '8px', borderRadius: '6px', border: 'none', background: '#222', color: '#fff' }} />
              <label style={{ color: '#ccc', fontSize: '1em' }}>Email</label>
              <input type="email" placeholder="tu@email.com" style={{ width: '100%', marginBottom: '14px', padding: '8px', borderRadius: '6px', border: 'none', background: '#222', color: '#fff' }} />
              <label style={{ color: '#ccc', fontSize: '1em' }}>Mensaje</label>
              <textarea placeholder="Escribe tu mensaje..." style={{ width: '100%', marginBottom: '14px', padding: '8px', borderRadius: '6px', border: 'none', background: '#222', color: '#fff', minHeight: '80px' }} />
              <button type="submit" style={{ background: '#00ffc8', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', padding: '10px 24px', cursor: 'pointer', marginTop: '10px' }}>Enviar</button>
            </form>
            <div style={{ flex: 1, minWidth: 320, maxWidth: 400, background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '30px 24px', textAlign: 'left' }}>
              <h3 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '18px' }}>¿Por Qué Contactarnos?</h3>
              <ul style={{ color: '#00ffc8', fontSize: '1.1em', marginBottom: '18px', paddingLeft: '18px' }}>
                <li><b>Soporte Técnico</b><br /><span style={{ color: '#aaa', fontSize: '0.98em' }}>Ayuda con problemas técnicos o dudas sobre la plataforma</span></li>
                <li style={{ marginTop: '12px' }}><b>Colaboraciones</b><br /><span style={{ color: '#aaa', fontSize: '0.98em' }}>Propuestas de negocios y asociaciones estratégicas</span></li>
                <li style={{ marginTop: '12px' }}><b>Sugerencias</b><br /><span style={{ color: '#aaa', fontSize: '0.98em' }}>Ideas para mejorar la funcionalidad de la plataforma</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em' }}>
        <p>© 2025 asi es el futbol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
