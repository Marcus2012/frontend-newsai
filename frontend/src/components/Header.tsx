import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 800) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="site-header">
      <div className="inner">
        <div className="brand">
          <img src="https://ipetcead.com/new/asieselfutbol.png" alt="Logo" className="logo" />
          <div className="brand-text">
            <div className="brand-title">asi es el futbol</div>
            <div className="brand-sub">Noticias y Predicciones</div>
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">☰</button>

        <nav className="main-nav">
          <Link href="/">Inicio</Link>
          <Link href="/noticias">Noticias</Link>

          <div className="has-mega">
            <a href="#">Predicciones ▾</a>
            <div className="mega-content" aria-hidden>
              <div className="mega-grid">
                <div>
                  <h4>Tipos</h4>
                  <ul>
                    <li><a href="#">1X2</a></li>
                    <li><a href="#">Hándicap</a></li>
                    <li><a href="#">Over/Under</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Temporadas</h4>
                  <ul>
                    <li><a href="#">Primera</a></li>
                    <li><a href="#">Segunda</a></li>
                    <li><a href="#">Copa</a></li>
                  </ul>
                </div>
                <div>
                  <h4>Herramientas</h4>
                  <ul>
                    <li><a href="#">Simulador</a></li>
                    <li><a href="#">Estadísticas</a></li>
                    <li><a href="#">Comparador</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <a href="#">Calculadora</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
        </nav>

        <div className="actions" aria-hidden>
          {/* Admin removed from header for public view */}
        </div>

        <div className="mobile-menu" style={{ display: mobileOpen ? 'flex' : 'none' }}>
          <a href="/">Inicio</a>
          <a href="/noticias">Noticias</a>
          <a href="#">Predicciones</a>
          <a href="#">Calculadora</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
        </div>
      </div>

      <style jsx>{`
        .site-header{background:rgba(10,14,39,0.95);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,255,200,0.06);padding:12px 0;position:sticky;top:0;z-index:120;font-family:"Poppins","-apple-system","BlinkMacSystemFont","Segoe UI",sans-serif}
        .inner{max-width:100%;padding:0 16px;display:flex;align-items:center;gap:12px;justify-content:space-between;position:relative}
        .brand{display:flex;align-items:center;gap:10px}
        .logo{width:64px;height:64px;border-radius:8px;background:#fff;object-fit:cover}
        .brand-title{color:#00ffc8;font-weight:700}
        .brand-sub{font-size:0.75rem;color:#aaa}

        .main-nav{display:flex;gap:18px;align-items:center;justify-content:center;flex:1}
        .main-nav a, .main-nav :global(a){color:#fff;text-decoration:none;font-size:0.95rem}
        .main-nav :global(a), .main-nav :global(a:link), .main-nav :global(a:visited), .main-nav :global(a:hover), .main-nav :global(a:active){color:#fff !important}

        .has-mega{position:relative}
        .mega-content{position:absolute;left:0;top:calc(100% + 10px);background:rgba(10,14,39,0.98);padding:18px;border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,0.5);display:none;min-width:360px;border:1px solid rgba(0,255,200,0.06)}
        .has-mega:hover .mega-content{display:block}
        .mega-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .mega-grid h4{color:#00ffc8;margin:0 0 8px 0}
        .mega-grid ul{list-style:none;padding:0;margin:0}
        .mega-grid li{margin:6px 0}
        .mega-grid a{color:#fff;text-decoration:none}
        .mega-grid a:link, .mega-grid a:visited, .mega-grid a:hover, .mega-grid a:active{color:#fff !important}

        .actions{display:flex;gap:12px;align-items:center}
        .admin-link{display:none}

        .mobile-toggle{display:none;background:transparent;border:1px solid rgba(255,255,255,0.05);color:#00ffc8;padding:8px;border-radius:6px;font-size:18px}

        .mobile-menu{display:none;flex-direction:column;gap:10px;padding:12px 16px;position:absolute;left:0;right:0;top:100%;background:rgba(10,14,39,0.98);border-top:1px solid rgba(0,255,200,0.04)}
        .mobile-menu a{color:#fff;text-decoration:none;padding:8px 0}
        .mobile-menu a:link, .mobile-menu a:visited, .mobile-menu a:hover, .mobile-menu a:active{color:#fff !important}

        @media (max-width: 900px){
          .main-nav{display:none}
          .mobile-toggle{display:block}
          .brand-title{font-size:0.95rem}
          .brand-sub{display:none}
          .inner{flex-direction:row;align-items:center}
          .mobile-menu{position:absolute;left:0;right:0;top:100%;display:flex}
        }

        @media (max-width:420px){
          .logo{width:56px;height:56px}
          .inner{padding:0 10px}
          .brand{gap:8px}
        }
      `}</style>
    </header>
  );
}
