
  import Link from 'next/link';
  import Image from 'next/image';
  import React, { useState, useEffect } from 'react';
  import ReactDOM from 'react-dom';
  import { signIn } from 'next-auth/react';
  import { useRouter } from 'next/router';

export default function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const megaRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [authTab, setAuthTab] = useState<'login'|'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string, email: string } | null>(null);
    // Leer usuario de localStorage al cargar
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('strapi_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.username) setUser({ username: parsed.username, email: parsed.email });
          } catch {}
        }
      }
    }, []);
  const [debugInfo, setDebugInfo] = useState('');

  const [mobileLeaguesOpenEurope, setMobileLeaguesOpenEurope] = useState(false);
  const [mobileLeaguesOpenAmerica, setMobileLeaguesOpenAmerica] = useState(false);
  const [mobileLeaguesOpenConmebol, setMobileLeaguesOpenConmebol] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!megaRef.current) return;
      const target = e.target as Node;
      if (megaRef.current && !megaRef.current.contains(target)) {
        setMegaOpen(false);
      }
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }
  }, []);

  // Mover handleLogout aquí para que esté definida antes del return
  function handleLogout() {
    localStorage.removeItem('strapi_jwt');
    localStorage.removeItem('strapi_user');
    setUser(null);
    setAuthTab('login');
    setShowAuthModal(false);
  }

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 800) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // debugInfo state kept for possible future use

  // mark client after mount so we don't try to portal during SSR
  useEffect(() => {
    setIsClient(true);
  }, []);

  // modal visibility tracked; no debug logs

  function handleUserBtnClick(_: React.MouseEvent) {
    setShowAuthModal(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthMessage(null);
    setLoadingAuth(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({identifier: loginEmail, password: loginPassword})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Error en login');
      if (data.jwt) localStorage.setItem('strapi_jwt', data.jwt);
      if (data.user) {
        localStorage.setItem('strapi_user', JSON.stringify(data.user));
        setUser({ username: data.user.username, email: data.user.email });
      }
      setAuthMessage('Login correcto');
      setTimeout(() => { setShowAuthModal(false); setAuthMessage(null); }, 700);
    } catch (err: any) {
      setAuthMessage(err.message || 'Error en login');
    } finally { setLoadingAuth(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthMessage(null);
    setLoadingAuth(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username: regUsername, email: regEmail, password: regPassword})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Error en registro');
      if (data.jwt) localStorage.setItem('strapi_jwt', data.jwt);
      if (data.user) {
        localStorage.setItem('strapi_user', JSON.stringify(data.user));
        setUser({ username: data.user.username, email: data.user.email });
      }
      setAuthMessage('Registro correcto');
      setTimeout(() => { setShowAuthModal(false); setAuthMessage(null); }, 900);
    } catch (err: any) {
      setAuthMessage(err.message || 'Error en registro');
    } finally { setLoadingAuth(false); }
  }

  const modal = (showAuthModal && isClient) ? (
    typeof window !== 'undefined' && document.body
      ? ReactDOM.createPortal(
          <>
            <div className="auth-modal" role="dialog" aria-modal="true">
              <div className="auth-backdrop" onClick={() => setShowAuthModal(false)} />
              <div className="auth-box">
                <button className="close" onClick={() => setShowAuthModal(false)} aria-label="Cerrar">✕</button>
                <div className="auth-card">
                  <div className="auth-header">
                      <Image className="auth-logo-img" src="/Logo_aeef.png" alt="asi es el futbol" width={180} height={36} style={{ maxWidth: 60 }} />
                    </div>

                  <div className="auth-body">
                    <h3>Iniciar Sesión</h3>

                    <div className="tabs" role="tablist">
                      <button onClick={() => setAuthTab('login')} aria-selected={authTab === 'login'} className={authTab === 'login' ? 'tab active' : 'tab'}>Login</button>
                      <button onClick={() => setAuthTab('register')} aria-selected={authTab === 'register'} className={authTab === 'register' ? 'tab active' : 'tab'}>Registro</button>
                    </div>

                    {authMessage && <div className="auth-msg">{authMessage}</div>}

                    {authTab === 'login' ? (
                      <form onSubmit={handleLogin}>
                        <label>Email</label>
                        <input type="email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
                        <label>Contraseña</label>
                        <input type="password" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} required />

                        <div className="actions-row">
                          <button type="submit" className="btn secondary" disabled={loadingAuth}>{loadingAuth ? 'Procesando...' : 'Entrar'}</button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleRegister}>
                        <label>Usuario</label>
                        <input value={regUsername} onChange={(e)=>setRegUsername(e.target.value)} required />
                        <label>Email</label>
                        <input type="email" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} required />
                        <label>Contraseña</label>
                        <input type="password" value={regPassword} onChange={(e)=>setRegPassword(e.target.value)} required />

                        <div className="actions-row" style={{justifyContent: 'flex-end'}}>
                          <button type="submit" className="btn secondary" disabled={loadingAuth}>{loadingAuth ? 'Procesando...' : 'Crear cuenta'}</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <style jsx global>{`
              .auth-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1400}
              .auth-backdrop{position:absolute;inset:0;background:rgba(2,6,23,0.6)}
              .auth-box{position:relative;min-width:320px;max-width:780px;width:calc(100% - 48px);border-radius:14px;overflow:visible}
              .auth-box .close{position:absolute;left:12px;top:-18px;background:#081027;color:#fff;border-radius:22px;width:40px;height:40px;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(2,6,23,0.45)}
              .auth-card{border-radius:10px;overflow:hidden;box-shadow:0 24px 60px rgba(2,6,23,0.6)}
              .auth-header{background:#0a0e26;padding:18px 20px;display:flex;align-items:center;justify-content:center}
              .auth-logo{font-weight:800;color:#00ffc8;letter-spacing:0.4px}
              .auth-body{background:rgba(10,14,39,0.98);padding:22px 26px 26px;color:#e6f7f0;border-top:1px solid rgba(255,255,255,0.02)}
              .auth-body h3{margin:0 0 8px 0;color:#00ffc8;font-size:1.15rem}
              .tabs{display:flex;gap:14px;margin:12px 0 18px}
              .tab{background:transparent;border:none;padding:8px 10px;border-bottom:2px solid transparent;cursor:pointer;color:#9aa3ac;font-weight:600}
              .tab.active{border-bottom-color:#00ffc8;color:#00ffc8}
              .auth-msg{color:#ffb4b4;margin-bottom:10px}
              .auth-body label{display:block;font-size:0.85rem;color:#bfc8cf;margin-bottom:6px}
              .auth-body input{width:100%;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;background:rgba(255,255,255,0.02);color:#fff; max-width:700px}
              .auth-body input::placeholder{color:rgba(255,255,255,0.45)}
              .auth-body .btn{padding:10px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
              .auth-body .btn.primary{background:#00ffc8;color:#07121b}
              .auth-body .btn.secondary{background:transparent;color:#cfd8df;border:1px solid rgba(255,255,255,0.06)}
              .auth-body .btn[disabled]{opacity:0.6;cursor:not-allowed}
              .actions-row{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}

              /* Mobile improvements: make modal fit the viewport, allow internal scrolling when keyboard opens, and improve input visibility */
              @media (max-width: 640px){
                .auth-modal{align-items:flex-start;padding-top:6vh}
                .auth-box{width:calc(100% - 24px);border-radius:12px;margin:0 12px}
                .auth-card{max-height:92vh;display:flex;flex-direction:column;overflow:hidden}
                .auth-header{padding:12px}
                .auth-body{padding:16px;overflow:auto;max-height:calc(92vh - 120px)}
                .auth-box .close{right:12px;left:auto;top:12px;width:36px;height:36px}
                .auth-logo-img{max-width:120px}
                .auth-body input{width:100%;max-width:325px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);color:#07121b}
                .auth-body input::placeholder{color:#6b7280}
                .tabs{gap:10px}
                .auth-body h3{font-size:1rem}
              }
            `}</style>
          </>
        , document.body)
      : null
  ) : null;

  return (
    <header className="site-header">
      <div className="inner">
        <div className="brand">
          <img src="/Logo_aeef.png" alt="Logo" className="logo" />
          <div className="brand-text">
            {/*
            <div className="brand-title">asi es el futbol</div>
            <div className="brand-sub">Noticias y Predicciones</div>
            */}
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">☰</button>

        <nav className="main-nav">
          <Link href="/">Inicio</Link>
          <Link href="/noticias">Noticias</Link>

          <div ref={megaRef} className={`has-dropdown ${megaOpen ? 'open' : ''}`} role="menu">
              <button
                className="dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={megaOpen}
                onClick={() => setMegaOpen(prev => !prev)}
              >Ligas & Copas ▾</button>
              <div className="dropdown" role="menu">
                <div className="dropdown-section">
                  <div className="dropdown-title">Ligas Europa</div>
                  <Link href="/matches/england/premier">Premier League</Link>
                  <Link href="/matches/italy/seriea">Serie A - Italia</Link>
                  <Link href="/matches/spain/la-liga">La Liga - Spain</Link>
                  <Link href="/matches/germany/bundesliga">Bundesliga - Germany</Link>
                  <Link href="/matches/france/ligue-1">Ligue 1 - France</Link>
                  <Link href="/matches/europe/champions-league">Champions League</Link>
                </div>
                <div className="dropdown-section">
                  <div className="dropdown-title">Ligas America</div>
                  <Link href="/matches/peru/primera">Peru Primera</Link>
                  <Link href="/matches/argentina/liga-profesional">Argentina Liga Profesional</Link>
                  <Link href="/matches/brasil/serie-a">Brasil Serie A</Link>
                  <Link href="/matches/colombia/liga-betplay">Colombia Liga BetPlay</Link>
                  <Link href="/matches/ecuador/liga-pro">Ecuador Liga Pro</Link>
                  <Link href="/matches/usa/mls">USA MLS</Link>
                  <Link href="/matches/mexico/liga-mx">Mexico Liga MX</Link>
                </div>
                <div className="dropdown-section">
                  <div className="dropdown-title">CONMEBOL</div>
                  <Link href="/matches/conmebol/copa-libertadores">Copa Libertadores</Link>
                  <Link href="/matches/conmebol/copa-sudamericana">Copa Sudamericana</Link>
                </div>
              </div>
          </div>

          {/*<Link href="/predicciones">Predicciones</Link>*/}

          <Link href="/calculadora">Calculadora</Link>
          <Link href="/nosotros">Nosotros</Link>
          <Link href="/contacto">Contacto</Link>
          <div className="social-icons">
            <a href="https://x.com/asieselfutbol_" className="x" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.505 11.24h-6.63l-5.19-6.79-5.94 6.79H1.76l7.73-8.84L1.3 2.25h6.8l4.7 6.2 5.44-6.2zm-1.16 17.5h1.83L7.42 4.13H5.46l11.62 15.62z" fill="#fff"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/asieselfutbol" className="facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38V12h2.44l-.39 2.9h-2.05v7A10 10 0 0022 12" fill="#fff"/></svg>
            </a>
            <a href="https://www.youtube.com/@asieselfutbol_tv" className="youtube" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M23.5 6.2s-.24-1.7-.98-2.45C21.76 3 20.88 3 20.4 2.92 17.72 2.6 12 2.6 12 2.6s-5.72 0-8.4.32c-.48.08-1.36.08-2.12 0C.74 4.5.5 6.2.5 6.2S.28 8 .28 9.8v2.4c0 1.8.22 3.6.22 3.6s.24 1.7.98 2.45c.74.76 1.72.72 2.18.8 1.58.2 8.02.32 8.02.32s5.72 0 8.4-.32c.48-.08 1.36-.08 2.12 0 .74.08 1.12-.04 1.86-.8.74-.74.98-2.45.98-2.45s.22-1.8.22-3.6v-2.4c0-1.8-.22-3.6-.22-3.6z" fill="#fff"/>
                <path d="M9.75 15.02V8.98l5.5 3.02-5.5 3.02z" fill="#FF0000"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/asieselfutbol/#" className="instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="4.8" y="4.8" width="14.4" height="14.4" rx="4.6" fill="none" stroke="#fff" strokeWidth="1.9"/>
                <circle cx="12" cy="12" r="4.1" fill="none" stroke="#fff" strokeWidth="1.9"/>
                <circle cx="16.4" cy="7.6" r="1.15" fill="#fff"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@asieselfutbol.com" className="tiktok" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M17.2 2.5h2.4c.2 1.8 1.4 3.3 3 3.7v2.5c-1.2.1-2.4-.3-3.4-1v6.2c0 3.6-2.9 6.6-6.6 6.6s-6.6-2.9-6.6-6.6 2.9-6.6 6.6-6.6c.6 0 1.1.1 1.6.2v2.7c-.5-.2-1-.3-1.6-.3-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8 3.8-1.7 3.8-3.8V2.5z" fill="#25F4EE" transform="translate(0.9,0.7)"/>
                <path d="M17.2 2.5h2.4c.2 1.8 1.4 3.3 3 3.7v2.5c-1.2.1-2.4-.3-3.4-1v6.2c0 3.6-2.9 6.6-6.6 6.6s-6.6-2.9-6.6-6.6 2.9-6.6 6.6-6.6c.6 0 1.1.1 1.6.2v2.7c-.5-.2-1-.3-1.6-.3-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8 3.8-1.7 3.8-3.8V2.5z" fill="#FE2C55" transform="translate(-0.7,-0.6)"/>
                <path d="M17.2 2.5h2.4c.2 1.8 1.4 3.3 3 3.7v2.5c-1.2.1-2.4-.3-3.4-1v6.2c0 3.6-2.9 6.6-6.6 6.6s-6.6-2.9-6.6-6.6 2.9-6.6 6.6-6.6c.6 0 1.1.1 1.6.2v2.7c-.5-.2-1-.3-1.6-.3-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8 3.8-1.7 3.8-3.8V2.5z" fill="#fff"/>
              </svg>
            </a>
          </div>
        </nav>

        <div className="actions">
          {user ? (
            <div className="user-info" style={{color:'#00ffc8',fontWeight:600,padding:'0 10px',display:'flex',alignItems:'center',gap:8}}>
              <span>👤 {user.username}</span>
              <button onClick={handleLogout} style={{marginLeft:8,background:'transparent',border:'none',color:'#fff',cursor:'pointer',fontSize:'1em',padding:'2px 8px',borderRadius:'6px',transition:'background 0.2s'}} title="Cerrar sesión">Salir</button>
            </div>
          ) : (
            <button onClick={handleUserBtnClick} className="user-btn" aria-label="Abrir opciones de usuario" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#fff" opacity="0.95"/>
                <path d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z" fill="#00ffc8" opacity="0.15"/>
              </svg>
            </button>
          )}
        </div>

        <div className="mobile-menu" style={{ display: mobileOpen ? 'flex' : 'none' }}>
          <a href="/">Inicio</a>
          <a href="/noticias">Noticias</a>
          {/*<a href="/predicciones">Predicciones</a>*/}

          <div className="mobile-leagues">
            <button className="mobile-leagues-toggle" onClick={() => setMobileLeaguesOpenEurope(prev => !prev)} aria-expanded={mobileLeaguesOpenEurope} type="button">Ligas Europa ▾</button>
            {mobileLeaguesOpenEurope && (
              <div className="mobile-submenu">
                <a href="/matches/england/premier">Premier League</a>
                <a href="/matches/italy/seriea">Serie A - Italia</a>
                <a href="/matches/spain/la-liga">La Liga - Spain</a>
                <a href="/matches/germany/bundesliga">Bundesliga - Germany</a>
                <a href="/matches/france/ligue-1">Ligue 1 - France</a>
                <a href="/matches/europe/champions-league">Champions League</a>
              </div>
            )}
          </div>

          <div className="mobile-leagues">
            <button className="mobile-leagues-toggle" onClick={() => setMobileLeaguesOpenAmerica(prev => !prev)} aria-expanded={mobileLeaguesOpenAmerica} type="button">Ligas América ▾</button>
            {mobileLeaguesOpenAmerica && (
              <div className="mobile-submenu">
                <a href="/matches/peru/primera">Peru Primera</a>
                <a href="/matches/argentina/liga-profesional">Argentina Liga Profesional</a>
                <a href="/matches/brasil/serie-a">Brasil Serie A</a>
                <a href="/matches/colombia/liga-betplay">Colombia Liga BetPlay</a>
                <a href="/matches/ecuador/liga-pro">Ecuador Liga Pro</a>
                <a href="/matches/usa/mls">USA MLS</a>
                <a href="/matches/mexico/liga-mx">Mexico Liga MX</a>
              </div>
            )}
          </div>

          <div className="mobile-leagues">
            <button className="mobile-leagues-toggle" onClick={() => setMobileLeaguesOpenConmebol(prev => !prev)} aria-expanded={mobileLeaguesOpenConmebol} type="button">CONMEBOL ▾</button>
            {mobileLeaguesOpenConmebol && (
              <div className="mobile-submenu">
                <a href="/matches/conmebol/copa-libertadores">Copa Libertadores</a>
                <a href="/matches/conmebol/copa-sudamericana">Copa Sudamericana</a>
              </div>
            )}
          </div>

          <a href="/calculadora">Calculadora</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
          <button onClick={() => setShowAuthModal(true)} className="mobile-user">Cuenta</button>
        </div>
      </div>

      {modal}

      {/* debug removed */}

      <style jsx>{`
        .site-header{background:rgba(10,14,39,0.95);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,255,200,0.06);padding:12px 0;position:sticky;top:0;z-index:1500;font-family:"Poppins","-apple-system","BlinkMacSystemFont","Segoe UI",sans-serif}
        :global(.promo-open) .site-header{z-index:0 !important}
        .inner{max-width:100%;padding:0 16px;display:flex;align-items:center;gap:12px;justify-content:space-between;position:relative}
        .brand{display:flex;align-items:center;gap:10px}
        .logo{width:64px;height:64px;border-radius:8px;object-fit:contain;padding:8px;box-shadow:0 8px 20px rgba(2,6,23,0.45)}
        .auth-header img, .auth-logo-img{background:#fff;padding:12px;border-radius:12px;box-shadow:0 14px 40px rgba(2,6,23,0.55);width:auto;max-width:200px;height:auto;object-fit:contain}
        .brand-title{color:#00ffc8;font-weight:700}
        .brand-sub{font-size:0.75rem;color:#aaa}

        .main-nav{display:flex;gap:18px;align-items:center;justify-content:center;flex:1;position:relative;z-index:1500}
        .social-icons{display:flex;gap:14px;margin-left:12px}
        .social-icons a{
          width:36px;
          height:36px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border-radius:50%;
          background:#fff;
          border:none;
          box-shadow:0 2px 8px rgba(0,0,0,0.07);
          transition:transform .12s, box-shadow .12s;
        }
        .social-icons a:hover{
          transform:translateY(-3px) scale(1.08);
          box-shadow:0 8px 24px rgba(0,0,0,0.18);
        }
        .social-icons a.x{background:#000;}
        .social-icons a.facebook{background:#1877F2;}
        .social-icons a.youtube{background:#FF0000;}
        .social-icons a.instagram{background:radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 8%, #fd5949 45%, #d6249f 62%, #285AEB 90%);}
        .social-icons a.threads{background:#fff;}
        .social-icons a.tiktok{background:#000;}
        .social-icons a svg{width:24px;height:24px;}
        .social-icons a.tiktok svg{transform:translateX(-0.6px);transform-origin:center;}
        .has-dropdown{position:relative}
        .has-mega{position:relative}
        .has-mega .mega{position:absolute;left:0;top:100%;z-index:1600;display:none;background:rgba(10,14,39,0.98);padding:16px;border-radius:12px;box-shadow:0 20px 60px rgba(2,6,23,0.6);min-width:420px;color:#fff}
        .has-mega:hover .mega{display:block}
        .has-mega.open .mega{display:block}
        .mega{display:flex;flex-direction:column;gap:12px}
        .mega-row{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
        .mega-col{display:flex;flex-direction:column;gap:8px;min-width:160px}
        .mega a{color:#fff;text-decoration:none}
        .mega-toggle{background:transparent;border:none;color:#fff;cursor:pointer;font-weight:600;padding:6px}
        @media (max-width:900px){
          .has-mega .mega{position:static;display:none;box-shadow:none;padding:12px;min-width:0}
          .has-mega.open .mega{display:flex;flex-direction:column}
          .mega{width:100%}
          .mega-row{flex-direction:row}
        }
        .has-dropdown .dropdown{position:absolute;left:0;top:100%;background:rgba(10,14,39,0.98);padding:14px;border-radius:10px;box-shadow:0 12px 28px rgba(2,6,23,0.6);display:none;z-index:1600;min-width:420px;flex-direction:row;gap:18px}
        .has-dropdown:hover .dropdown{display:flex}
        .has-dropdown.open .dropdown{display:flex}
        .dropdown-section{display:flex;flex-direction:column;gap:6px;min-width:200px}
        .dropdown-title{color:#00ffc8;font-weight:700;font-size:0.9rem;padding:6px 10px}
        .dropdown a{display:block;padding:10px 14px;color:#fff;text-decoration:none;border-radius:8px;line-height:1.2;white-space:nowrap}
        .dropdown a:hover{background:rgba(255,255,255,0.03);color:#00ffc8}
        .dropdown-toggle{background:transparent;border:none;color:#fff;font-weight:600;cursor:pointer;padding:6px 8px;border-radius:6px}
        .dropdown-toggle:focus{outline:2px solid rgba(0,255,200,0.12)}
        .main-nav a, .main-nav :global(a){color:#fff;text-decoration:none;font-size:0.95rem}
        .main-nav :global(a), .main-nav :global(a:link), .main-nav :global(a:visited), .main-nav :global(a:hover), .main-nav :global(a:active){color:#fff !important}

        .actions{display:flex;gap:12px;align-items:center;pointer-events:auto;z-index:1500}
        .admin-link{display:none}

        .user-btn{background:linear-gradient(135deg, rgba(0,255,200,0.03), rgba(255,255,255,0.02));border:1px solid rgba(0,255,200,0.14);padding:8px;border-radius:10px;display:inline-flex;align-items:center;cursor:pointer;z-index:200;position:relative;pointer-events:auto;box-shadow:0 6px 18px rgba(0,255,200,0.06);transition:transform .12s ease,box-shadow .12s ease}
        .user-btn svg{display:block}
        .user-btn svg path:first-child{fill:#ffffff !important}
        .user-btn svg path:last-child{fill:#00ffc8 !important;opacity:1 !important}
        .user-btn:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,255,200,0.16)}
        .mobile-user{background:transparent;border:none;color:#00ffc8;padding:6px 8px;cursor:pointer}

        /* Modal */
        .auth-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1400}
        .auth-backdrop{position:absolute;inset:0;background:rgba(2,6,23,0.6)}

        .auth-box{position:relative;min-width:320px;max-width:780px;width:calc(100% - 48px);border-radius:14px;overflow:visible}
        .auth-box .close{position:absolute;left:12px;top:-18px;background:#081027;color:#fff;border-radius:22px;width:40px;height:40px;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(2,6,23,0.45)}

        .auth-card{border-radius:10px;overflow:hidden;box-shadow:0 24px 60px rgba(2,6,23,0.6)}
        .auth-header{background:#0a0e26;padding:18px 20px;display:flex;align-items:center;justify-content:center}
        .auth-logo{font-weight:800;color:#00ffc8;letter-spacing:0.4px}

        .auth-body{background:rgba(10,14,39,0.98);padding:22px 26px 26px;color:#e6f7f0;border-top:1px solid rgba(255,255,255,0.02)}
        .auth-body h3{margin:0 0 8px 0;color:#00ffc8;font-size:1.15rem}
        .tabs{display:flex;gap:14px;margin:12px 0 18px}
        .tab{background:transparent;border:none;padding:8px 10px;border-bottom:2px solid transparent;cursor:pointer;color:#9aa3ac;font-weight:600}
        .tab.active{border-bottom-color:#00ffc8;color:#00ffc8}

        .auth-msg{color:#ffb4b4;margin-bottom:10px}
        .auth-body label{display:block;font-size:0.85rem;color:#bfc8cf;margin-bottom:6px}
        .auth-body input{width:100%;max-width:325px;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;background:rgba(255,255,255,0.02);color:#fff;max-width:700px}
        .auth-body input::placeholder{color:rgba(255,255,255,0.45)}

        .auth-body .btn{padding:10px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
        .auth-body .btn.primary{background:#00ffc8;color:#07121b}
        .auth-body .btn.secondary{background:transparent;color:#cfd8df;border:1px solid rgba(255,255,255,0.06)}
        .auth-body .btn[disabled]{opacity:0.6;cursor:not-allowed}

        .actions-row{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}

        @media (max-width: 640px){
          .auth-modal{align-items:flex-start;padding-top:6vh}
          .auth-box{width:calc(100% - 24px);max-width:720px;border-radius:12px;margin:0 12px}
          .auth-card{max-height:92vh;display:flex;flex-direction:column;overflow:hidden}
          .auth-header{padding:12px}
          .auth-body{padding:16px;overflow:auto;max-height:calc(92vh - 120px)}
          .auth-box .close{right:12px;left:auto;top:12px;width:36px;height:36px}
          .auth-logo-img{max-width:120px}
          .auth-body input{background:#ffffff;border:1px solid rgba(0,0,0,0.08);color:#07121b}
          .auth-body input::placeholder{color:#6b7280}
          .tabs{gap:10px}
          .auth-body h3{font-size:1rem}
        }

        .mobile-toggle{display:none;background:transparent;border:1px solid rgba(255,255,255,0.05);color:#00ffc8;padding:10px 12px;border-radius:8px;font-size:22px;z-index:1600}

        .mobile-menu{display:none;flex-direction:column;gap:12px;padding:16px 18px;position:absolute;left:0;right:0;top:100%;background:rgba(10,14,39,0.98);border-top:1px solid rgba(0,255,200,0.04);z-index:1300;max-height:calc(var(--vh,1vh) * 100 - 64px);overflow:auto}
        .mobile-menu a{color:#fff;text-decoration:none;padding:10px 0;font-size:1.05rem}
        .mobile-menu a:link, .mobile-menu a:visited, .mobile-menu a:hover, .mobile-menu a:active{color:#fff !important}

        .mobile-leagues {display:flex;flex-direction:column}
        .mobile-leagues-toggle{background:transparent;border:none;color:#fff;text-align:left;padding:10px 0;cursor:pointer;font-weight:700;font-size:1.05rem}
        .mobile-submenu{display:flex;flex-direction:column;gap:6px;padding-left:12px;margin:6px 0 8px;border-left:1px solid rgba(255,255,255,0.08)}
        .mobile-submenu a{padding:10px 0;color:#cfe;border-bottom:1px solid rgba(255,255,255,0.06);font-size:1rem}
        .mobile-submenu a:last-child{border-bottom:none}

        @media (max-width: 640px){
          .auth-modal{align-items:flex-start;padding-top:6vh}
          .auth-box{width:calc(100% - 24px);max-width:720px;border-radius:12px;margin:0 12px}
          .auth-card{max-height:calc(var(--vh,1vh) * 100 * 0.92);display:flex;flex-direction:column;overflow:hidden}
          .auth-header{padding:12px}
          .auth-body{padding:16px;overflow:auto;max-height:calc(var(--vh,1vh) * 100 - 120px)}
          .auth-box .close{right:12px;left:auto;top:12px;width:36px;height:36px}
          .auth-logo-img{max-width:120px}
          .auth-body input{background:#ffffff;border:1px solid rgba(0,0,0,0.08);color:#07121b}
          .auth-body input::placeholder{color:#6b7280}
          .tabs{gap:10px}
          .auth-body h3{font-size:1rem}
        }
        /* Show mobile toggle and hide desktop nav on smaller screens */
        @media (max-width: 900px) {
          .mobile-toggle{display:block;z-index:1700}
          .main-nav{display:none}
          .actions{display:flex;align-items:center;gap:8px}
          .social-icons{display:none}
          .actions .user-info{display:flex}
          .actions .user-btn{display:inline-flex}
          .inner{position:relative}
          .actions{position:absolute;right:65px;top:50%;transform:translateY(-50%);z-index:1700}
          .mobile-toggle{margin-left:8px}
        }
          .mobile-menu{position:absolute;left:0;right:0;top:100%;display:flex}
        }

        @media (max-width:420px){
          .logo{width:48px;height:48px}
          .inner{padding:0 10px}
          .brand{gap:8px}
        }
        /* debug styles removed */
      `}</style>
    </header>
  );
}

