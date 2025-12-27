import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';

export default function AuthPage() {
  return (
    <>
      <Head>
        <title>Acceder / Registrarse</title>
      </Head>

      <main style={{padding: '28px', maxWidth: 680, margin: '48px auto', color: '#fff'}}>
        <h1 style={{color: '#00ffc8'}}>Cuenta</h1>
        <p>Gestiona tu acceso al blog. Usa un proveedor OAuth para iniciar sesión rápidamente.</p>

        <div style={{display: 'flex', gap: 12, marginTop: 20}}>
          <button
            onClick={() => signIn('google')}
            style={{background: '#0f62fe', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer'}}
          >
            Iniciar sesión con Google
          </button>

          <Link href="/auth/register">
            <span style={{background: 'transparent', color: '#00ffc8', border: '1px solid rgba(0,255,200,0.12)', padding: '10px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', cursor: 'pointer'}}>Registrarse</span>
          </Link>
        </div>

        <section style={{marginTop: 28}}>
          <h3 style={{color: '#fff'}}>Notas</h3>
          <ul>
            <li>Para que el OAuth funcione debes configurar proveedores y variables en el backend y en `.env.local`.</li>
            <li>Este ejemplo usa `next-auth` y Google como proveedor mostrado como ejemplo.</li>
          </ul>
        </section>
      </main>
    </>
  );
}
