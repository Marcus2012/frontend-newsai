'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  created_at: string;
  category?: string;
  author?: string;
  status?: string;
  image_url?: string;
  description?: string;
}

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:8000';
const API_USERNAME = 'admin';
const API_PASSWORD = 'admin123';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log('1. Autenticando en:', `${API_ENDPOINT}/auth/login`);
        
        // Paso 1: Login para obtener token
        const loginResponse = await fetch(`${API_ENDPOINT}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: API_USERNAME,
            password: API_PASSWORD,
          }),
        });

        if (!loginResponse.ok) {
          throw new Error(`Error de login ${loginResponse.status}: ${loginResponse.statusText}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.access_token;
        console.log('2. Token obtenido:', token);

        // Paso 2: Obtener artículos con el token
        console.log('3. Obteniendo artículos desde:', `${API_ENDPOINT}/admin/articles`);
        
        const articlesResponse = await fetch(`${API_ENDPOINT}/admin/articles`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!articlesResponse.ok) {
          throw new Error(`Error ${articlesResponse.status}: ${articlesResponse.statusText}`);
        }

        const data = await articlesResponse.json();
        console.log('4. Artículos recibidos:', data);
        setArticles(data || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p>Cargando artículos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ background: '#0a0e27', color: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(10, 14, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 255, 200, 0.1)',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.8em', color: '#00ffc8' }}>🏈 AI Sports</h1>
          <nav style={{ display: 'flex', gap: '30px' }}>
            {['Inicio', 'Noticias', 'Predicciones', 'Contacto'].map(item => (
              <a key={item} href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.95em', transition: 'color 0.3s' }}>
                {item}
              </a>
            ))}
            <Link href="/admin" style={{ color: '#00ffc8', textDecoration: 'none', fontWeight: 'bold' }}>Admin</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f42 100%)',
        padding: '60px 20px',
        borderBottom: '1px solid rgba(0, 255, 200, 0.1)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '3em', fontWeight: 'bold', marginBottom: '10px', color: '#00ffc8' }}>Noticias Deportivas con IA</h2>
          <p style={{ fontSize: '1.2em', color: '#aaa', marginBottom: '20px' }}>Las últimas noticias de deportes analizadas por inteligencia artificial</p>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <h3 style={{ color: '#00ffc8', fontSize: '1.5em', marginBottom: '30px' }}>📰 Noticias Destacadas</h3>

        {articles.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>No hay artículos disponibles</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article 
                  style={{
                    background: 'linear-gradient(135deg, #1a1f42 0%, #2a2f52 100%)',
                    border: '1px solid rgba(0, 255, 200, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.6)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 200, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {article.image_url && (
                    <div style={{ height: '150px', overflow: 'hidden', background: 'rgba(0, 0, 0, 0.3)' }}>
                      <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {article.category && (
                      <span style={{
                        background: 'rgba(0, 255, 200, 0.2)',
                        color: '#00ffc8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75em',
                        fontWeight: 'bold',
                        width: 'fit-content',
                        marginBottom: '8px'
                      }}>
                        {article.category}
                      </span>
                    )}
                    <h2 style={{ fontSize: '1.1em', margin: '0 0 10px 0', color: '#fff', lineHeight: '1.3' }}>
                      {article.title}
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.8em', color: '#aaa', marginTop: 'auto' }}>
                      {article.author && <span>👤 {article.author}</span>}
                      {article.created_at && <span>📅 {new Date(article.created_at).toLocaleDateString('es-ES')}</span>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 20px', textAlign: 'center', color: '#aaa' }}>
        <p>© 2025 AI Sports Predictor. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
