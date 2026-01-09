
import Link from 'next/link';
import Header from '../components/Header';

export default function Nosotros() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      <Header />

      {/* Main Content */}
      <div style={{ maxWidth: '100%', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '1500px', width: '100%', padding: '40px' }}>
          <h1 style={{ color: '#00ffc8', fontSize: '2.3em', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', letterSpacing: '-1px' }}>Sobre asi es el futbol</h1>
          <p style={{ color: '#e6f7f3', fontSize: '1.22em', marginBottom: '40px', textAlign: 'center', lineHeight: 1.5 }}>
            Somos la plataforma líder en predicciones deportivas impulsadas por tecnología predictiva avanzada. Nuestra misión es democratizar el acceso a análisis deportivos de alto nivel y ayudar a los aficionados a tomar decisiones más informadas y seguras.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '50px', flexWrap: 'wrap', background: 'rgba(0,255,200,0.03)', borderRadius: 16, padding: '24px 0' }}>
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
          <h2 style={{ color: '#fff', fontWeight: 'bold', fontSize: '2em', margin: '40px 0 18px 0', textAlign: 'center', letterSpacing: '-1px' }}>¿Por Qué Elegirnos?</h2>
          <p style={{ color: '#cfe', fontSize: '1.13em', marginBottom: '40px', textAlign: 'center', lineHeight: 1.5 }}>
            Combinamos tecnología de vanguardia, análisis de datos y pasión por el deporte para ofrecerte la mejor experiencia de predicción.
          </p>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0,255,200,0.10)', borderRadius: '16px', padding: '32px 24px', minWidth: 260, maxWidth: 320, flex: 1, boxShadow: '0 4px 24px 0 rgba(0,255,200,0.07)' }}>
              <div style={{ fontSize: '2.2em', color: '#00ffc8', marginBottom: '12px' }}>📊</div>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Tecnología Predictiva Avanzada</div>
              <div style={{ color: '#bff0e6', fontSize: '1em' }}>
                Utilizamos modelos matemáticos y análisis de datos para identificar patrones y tendencias en el mundo deportivo.
              </div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.10)', borderRadius: '16px', padding: '32px 24px', minWidth: 260, maxWidth: 320, flex: 1, boxShadow: '0 4px 24px 0 rgba(0,255,200,0.07)' }}>
              <div style={{ fontSize: '2.2em', color: '#00ffc8', marginBottom: '12px' }}>🎯</div>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Predicciones Precisas</div>
              <div style={{ color: '#bff0e6', fontSize: '1em' }}>
                Nuestra plataforma ha alcanzado una precisión del 87% en predicciones de resultados deportivos a lo largo de múltiples temporadas.
              </div>
            </div>
            <div style={{ background: 'rgba(0,255,200,0.10)', borderRadius: '16px', padding: '32px 24px', minWidth: 260, maxWidth: 320, flex: 1, boxShadow: '0 4px 24px 0 rgba(0,255,200,0.07)' }}>
              <div style={{ fontSize: '2.2em', color: '#00ffc8', marginBottom: '12px' }}>⏱️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>Análisis en Tiempo Real</div>
              <div style={{ color: '#bff0e6', fontSize: '1em' }}>
                Monitoreamos estadísticas en vivo y ajustamos nuestras predicciones dinámicamente para ofrecerte la información más actualizada y relevante.
              </div>
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
