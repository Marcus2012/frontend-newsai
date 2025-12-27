
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
                      <Image src="/asieselfutbol.svg" alt="asi es el futbol" width={180} height={36} />
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
                          <button type="button" onClick={() => signIn('google')} className="btn primary">Google</button>
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
          <img src="/asieselfutbol.svg" alt="Logo" className="logo" />
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
          </div>

          <a href="#">Calculadora</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
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
        .logo{width:64px;height:64px;border-radius:8px;background:#fff;object-fit:cover}
        .brand-title{color:#00ffc8;font-weight:700}
        .brand-sub{font-size:0.75rem;color:#aaa}

        .main-nav{display:flex;gap:18px;align-items:center;justify-content:center;flex:1}
        .main-nav a, .main-nav :global(a){color:#fff;text-decoration:none;font-size:0.95rem}
        .main-nav :global(a), .main-nav :global(a:link), .main-nav :global(a:visited), .main-nav :global(a:hover), .main-nav :global(a:active){color:#fff !important}

        .actions{display:flex;gap:12px;align-items:center;pointer-events:auto}
        .admin-link{display:none}

        .user-btn{background:transparent;border:1px solid rgba(255,255,255,0.04);padding:8px;border-radius:8px;display:inline-flex;align-items:center;cursor:pointer;z-index:200;position:relative;pointer-events:auto}
        .user-btn svg{display:block}
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

