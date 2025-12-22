
import Link from 'next/link';

export default function Nosotros() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(10, 14, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 255, 200, 0.1)',
        padding: '15px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: '"Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif'
      }}>
        <div style={{ maxWidth: '100%', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://ipetcead.com/new/asieselfutbol.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', objectFit: 'cover' }} />
            <div style={{ fontSize: '0.9em' }}>
              <div style={{ color: '#00ffc8', fontWeight: 'bold' }}>AI Sports</div>
              <div style={{ fontSize: '0.75em', color: '#aaa' }}>Predictor</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '30px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Inicio</Link>
            <Link href="/noticias" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Noticias</Link>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Predicciones</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Calculadora</a>
            <Link href="/nosotros" style={{ color: '#00ffc8', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', fontWeight: 'bold', transition: 'color 0.3s' }}>Nosotros</Link>
            <Link href="/contacto" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Contacto</Link>
          </nav>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link href="/admin" style={{ background: '#00ffc8', color: '#000', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85em', cursor: 'pointer' }}>
              ADMIN
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '100%', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '900px', width: '100%', background: 'rgba(26, 31, 66, 0.7)', borderRadius: '12px', padding: '40px', boxShadow: '0 0 30px rgba(0,255,200,0.05)' }}>
          <h1 style={{ color: '#00ffc8', fontSize: '2em', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Sobre AI Sports Predictor</h1>
          <p style={{ color: '#ccc', fontSize: '1.2em', marginBottom: '40px', textAlign: 'center' }}>
            Somos la plataforma líder en predicciones deportivas impulsadas por inteligencia artificial. Nuestra misión es democratizar el acceso a análisis deportivos avanzados y ayudar a los aficionados a tomar decisiones más informadas.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '50px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ffc8', fontSize: '2.2em', fontWeight: 'bold' }}>87%</div>
              <div style={{ color: '#ccc', fontSize: '1em' }}>Precisión Promedio</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ffc8', fontSize: '2.2em', fontWeight: 'bold' }}>10K+</div>
              <div style={{ color: '#ccc', fontSize: '1em' }}>Predicciones Realizadas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ffc8', fontSize: '2.2em', fontWeight: 'bold' }}>50+</div>
              <div style={{ color: '#ccc', fontSize: '1em' }}>Ligas Analizadas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ffc8', fontSize: '2.2em', fontWeight: 'bold' }}>24/7</div>
              <div style={{ color: '#ccc', fontSize: '1em' }}>Disponibilidad</div>
            </div>
          </div>
          <h2 style={{ color: '#fff', fontWeight: 'bold', fontSize: '2em', margin: '40px 0 18px 0', textAlign: 'center' }}>¿Por Qué Elegirnos?</h2>
          <p style={{ color: '#ccc', fontSize: '1.1em', marginBottom: '40px', textAlign: 'center' }}>
            Combinamos tecnología de punta con pasión por los deportes para ofrecerte la mejor experiencia.
          </p>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '28px 22px', minWidth: 260, maxWidth: 320, flex: 1 }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>⚙️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Inteligencia Artificial Avanzada</div>
              <div style={{ color: '#aaa', fontSize: '0.98em' }}>
                Utilizamos algoritmos de aprendizaje automático de última generación para analizar miles de datos y patrones.
              </div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '28px 22px', minWidth: 260, maxWidth: 320, flex: 1 }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>🎯</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Predicciones Precisas</div>
              <div style={{ color: '#aaa', fontSize: '0.98em' }}>
                Nuestro modelo ha alcanzado una precisión del 87% en predicciones de resultados deportivos a lo largo de múltiples temporadas.
              </div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.07)', borderRadius: '14px', padding: '28px 22px', minWidth: 260, maxWidth: 320, flex: 1 }}>
              <div style={{ fontSize: '2em', color: '#00ffc8', marginBottom: '10px' }}>📈</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Análisis en Tiempo Real</div>
              <div style={{ color: '#aaa', fontSize: '0.98em' }}>
                Monitoreamos estadísticas en vivo y ajustamos nuestras predicciones dinámicamente para ofrecerte la información más actualizada.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em' }}>
        <p>© 2025 AI Sports Predictor. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
