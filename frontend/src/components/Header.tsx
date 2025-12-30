
  import Link from 'next/link';
  import Image from 'next/image';
  import React, { useState, useEffect } from 'react';
  import ReactDOM from 'react-dom';
  import { signIn } from 'next-auth/react';
  import { useRouter } from 'next/router';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const DEBUG = true;
  const [debugInfo, setDebugInfo] = useState('');

  const [isClient, setIsClient] = useState(false);

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

  // Debug: capture pointerdown / click during capture phase to see what's intercepting
  useEffect(() => {
    if (!DEBUG) return;
    const onPointerDown = (ev: PointerEvent) => {
      try {
        const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
        console.log('[DEBUG] pointerdown', { x: ev.clientX, y: ev.clientY, target: ev.target, el, className: el?.className });
        setDebugInfo(`${el?.tagName || 'none'} ${el?.className || ''}`);
      } catch (err) {
        console.log('[DEBUG] pointerdown error', err);
      }
    };
    const onClickCapture = (ev: MouseEvent) => {
      try {
        const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
        console.log('[DEBUG] click(capture)', { x: ev.clientX, y: ev.clientY, target: ev.target, el, className: el?.className });
      } catch (err) {
        console.log('[DEBUG] click error', err);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClickCapture, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('click', onClickCapture, true);
    };
  }, [DEBUG]);

  // mark client after mount so we don't try to portal during SSR
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: log when modal visibility changes
  useEffect(() => {
    if (!DEBUG) return;
    console.log('[DEBUG] showAuthModal =>', showAuthModal);
  }, [showAuthModal]);

  function handleUserBtnClick(e: React.MouseEvent) {
    if (DEBUG) console.log('user-btn clicked', { showAuthModal, event: e });
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
              .auth-body input{width:100%;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;background:rgba(255,255,255,0.02);color:#fff}
              .auth-body input::placeholder{color:rgba(255,255,255,0.45)}
              .auth-body .btn{padding:10px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
              .auth-body .btn.primary{background:#00ffc8;color:#07121b}
              .auth-body .btn.secondary{background:transparent;color:#cfd8df;border:1px solid rgba(255,255,255,0.06)}
              .auth-body .btn[disabled]{opacity:0.6;cursor:not-allowed}
              .actions-row{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}
              @media (max-width: 640px){
                .auth-box{width:calc(100% - 24px);}
                .auth-body{padding:16px}
                .auth-header{padding:12px}
                .auth-box .close{left:8px;top:-16px;width:36px;height:36px}
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
            <div className="brand-title">asi es el futbol</div>
            <div className="brand-sub">Noticias y Predicciones</div>
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">☰</button>

        <nav className="main-nav">
          <Link href="/">Inicio</Link>
          <Link href="/noticias">Noticias</Link>

          <div className="has-dropdown">
            <a href="#">Liga Perú ▾</a>
            <div className="dropdown">
              <Link href="/matches/peru/primera">Primera División</Link>
            </div>
          </div>

          <div className="has-mega">
            <a href="#">Predicciones ▾</a>
          </div>

          <a href="#">Calculadora</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
          <div className="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92c-.64.28-1.32.48-2.04.56.73-.44 1.28-1.12 1.54-1.94-.68.4-1.44.68-2.24.84C18.9 4.6 17.98 4 17 4c-1.78 0-3.22 1.44-3.22 3.22 0 .25.03.5.08.74C10.28 8 7.07 6.48 4.9 4c-.28.48-.44 1.04-.44 1.64 0 1.12.57 2.12 1.44 2.7-.56 0-1.08-.16-1.54-.4v.04c0 1.58 1.12 2.9 2.6 3.2-.28.08-.6.12-.92.12-.22 0-.44 0-.66-.04.46 1.4 1.78 2.42 3.34 2.44-1.24.98-2.8 1.56-4.5 1.56-.3 0-.6 0-.9-.04 1.6 1.04 3.5 1.64 5.56 1.64 6.66 0 10.3-5.5 10.3-10.28v-.46c.72-.5 1.3-1.12 1.78-1.82-.66.3-1.36.5-2.08.6z" fill="#1DA1F2"/></svg>
            </a>

            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38V12h2.44l-.39 2.9h-2.05v7A10 10 0 0022 12" fill="#1877F2"/></svg>
            </a>

            <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 .002 5.37.002 12S5.37 24 12 24s12-5.37 12-12S18.63 0 12 0zm5.2 8.4l-1.9 9.12c-.14.64-.5.8-1.02.5l-2.82-2.08-1.36 1.3c-.15.15-.28.28-.57.28l.2-2.86 5.2-4.7c.22-.2-.05-.32-.34-.12l-6.43 4.05-2.77-.86c-.6-.2-.61-.6.12-.89L16.8 7.2c.52-.18.97.12.6.18z" fill="#26A5E4"/></svg>
            </a>

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#f58529"/><stop offset="0.5" stopColor="#dd2a7b"/><stop offset="1" stopColor="#8134af"/></linearGradient><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.055 1.97.24 2.42.403a4.9 4.9 0 011.77 1.02 4.9 4.9 0 011.02 1.77c.164.45.348 1.25.403 2.42.058 1.27.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.403 2.42a4.9 4.9 0 01-1.02 1.77 4.9 4.9 0 01-1.77 1.02c-.45.164-1.25.348-2.42.403-1.27.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.42-.403a4.9 4.9 0 01-1.77-1.02 4.9 4.9 0 01-1.02-1.77c-.164-.45-.348-1.25-.403-2.42C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.055-1.17.24-1.97.403-2.42a4.9 4.9 0 011.02-1.77 4.9 4.9 0 011.77-1.02c.45-.164 1.25-.348 2.42-.403C8.416 2.212 8.8 2.2 12 2.2zm0 1.8c-3.12 0-3.492.01-4.72.068-1.03.05-1.58.22-1.95.366a3.1 3.1 0 00-1.12.73 3.1 3.1 0 00-.73 1.12c-.146.37-.316.92-.366 1.95C2.01 8.508 2 8.88 2 12s.01 3.492.068 4.72c.05 1.03.22 1.58.366 1.95.17.44.39.8.73 1.12.32.33.68.56 1.12.73.37.146.92.316 1.95.366C8.508 21.99 8.88 22 12 22s3.492-.01 4.72-.068c1.03-.05 1.58-.22 1.95-.366.44-.17.8-.39 1.12-.73.33-.32.56-.68.73-1.12.146-.37.316-.92.366-1.95.058-1.228.068-1.6.068-4.72s-.01-3.492-.068-4.72c-.05-1.03-.22-1.58-.366-1.95a3.1 3.1 0 00-.73-1.12 3.1 3.1 0 00-1.12-.73c-.37-.146-.92-.316-1.95-.366C15.492 3.01 15.12 3 12 3zm0 4.8a4.2 4.2 0 110 8.4 4.2 4.2 0 010-8.4zm0 1.8a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zM18.4 6.2a1 1 0 110 2 1 1 0 010-2z" fill="url(#g1)"/></svg>
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
            <button onClick={handleUserBtnClick} onMouseDown={(e)=> DEBUG && console.log('user-btn mousedown', e)} className="user-btn" aria-label="Abrir opciones de usuario" type="button">
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
          <a href="#">Predicciones</a>
          <a href="/matches/peru/primera">Partidos - Liga Perú</a>
          <a href="#">Calculadora</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
          <button onClick={() => { DEBUG && console.log('mobile-user click'); setShowAuthModal(true); }} className="mobile-user">Cuenta</button>
        </div>
      </div>

      {modal}

      {DEBUG && (
        <div className="debug-bubble" aria-hidden>
          Debug: {debugInfo}
        </div>
      )}

      <style jsx>{`
        .site-header{background:rgba(10,14,39,0.95);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,255,200,0.06);padding:12px 0;position:sticky;top:0;z-index:120;font-family:"Poppins","-apple-system","BlinkMacSystemFont","Segoe UI",sans-serif}
        .inner{max-width:100%;padding:0 16px;display:flex;align-items:center;gap:12px;justify-content:space-between;position:relative}
        .brand{display:flex;align-items:center;gap:10px}
        .logo{width:64px;height:64px;border-radius:8px;object-fit:contain;padding:8px;box-shadow:0 8px 20px rgba(2,6,23,0.45)}
        .auth-header img, .auth-logo-img{background:#fff;padding:12px;border-radius:12px;box-shadow:0 14px 40px rgba(2,6,23,0.55);width:auto;max-width:200px;height:auto;object-fit:contain}
        .brand-title{color:#00ffc8;font-weight:700}
        .brand-sub{font-size:0.75rem;color:#aaa}

        .main-nav{display:flex;gap:18px;align-items:center;justify-content:center;flex:1}
        .social-icons{display:flex;gap:10px;margin-left:12px}
        .social-icons a{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);transition:transform .12s ease,box-shadow .12s ease}
        .social-icons a:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(2,6,23,0.6)}
        .has-dropdown{position:relative}
        .has-dropdown .dropdown{position:absolute;left:0;top:100%;background:rgba(10,14,39,0.98);padding:8px;border-radius:8px;box-shadow:0 8px 24px rgba(2,6,23,0.6);display:none}
        .has-dropdown:hover .dropdown{display:block}
        .main-nav a, .main-nav :global(a){color:#fff;text-decoration:none;font-size:0.95rem}
        .main-nav :global(a), .main-nav :global(a:link), .main-nav :global(a:visited), .main-nav :global(a:hover), .main-nav :global(a:active){color:#fff !important}

        .actions{display:flex;gap:12px;align-items:center;pointer-events:auto}
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
        .auth-body input{width:100%;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;background:rgba(255,255,255,0.02);color:#fff}
        .auth-body input::placeholder{color:rgba(255,255,255,0.45)}

        .auth-body .btn{padding:10px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
        .auth-body .btn.primary{background:#00ffc8;color:#07121b}
        .auth-body .btn.secondary{background:transparent;color:#cfd8df;border:1px solid rgba(255,255,255,0.06)}
        .auth-body .btn[disabled]{opacity:0.6;cursor:not-allowed}

        .actions-row{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}

        @media (max-width: 640px){
          .auth-box{width:calc(100% - 24px);}
          .auth-body{padding:16px}
          .auth-header{padding:12px}
          .auth-box .close{left:8px;top:-16px;width:36px;height:36px}
        }

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
        .debug-bubble{position:fixed;left:12px;bottom:12px;background:rgba(0,0,0,0.6);color:#fff;padding:8px 10px;border-radius:8px;font-size:12px;z-index:9999;pointer-events:none}
      `}</style>
    </header>
  );
}

