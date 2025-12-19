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
  description?: string;
}

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:8000';

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // Login
      const loginResponse = await fetch(`${API_ENDPOINT}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      if (!loginResponse.ok) throw new Error('Error de autenticación');

      const loginData = await loginResponse.json();
      const accessToken = loginData.access_token;
      setToken(accessToken);

      // Fetch articles
      const articlesResponse = await fetch(`${API_ENDPOINT}/admin/articles`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!articlesResponse.ok) throw new Error('Error al obtener artículos');

      const data = await articlesResponse.json();
      setArticles(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (articleId: string, newStatus: string) => {
    setUpdating(articleId);
    try {
      const response = await fetch(`${API_ENDPOINT}/admin/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      setArticles(articles.map(a => 
        a.id === articleId ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return '#00ff88';
      case 'draft': return '#ffaa00';
      case 'pending': return '#ff6b6b';
      default: return '#aaa';
    }
  };

  return (
    <div style={{ background: '#0a0e27', color: '#fff', minHeight: '100vh', fontFamily: '"Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(10, 14, 39, 0.95)',
        borderBottom: '1px solid rgba(0, 255, 200, 0.2)',
        padding: '20px',
        fontFamily: '"Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#00ffc8' }}>🛠️ Panel de Administración</h1>
          <Link href="/" style={{ color: '#00ffc8', textDecoration: 'none', cursor: 'pointer' }}>
            ← Volver
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: '#ff6b6b', textAlign: 'center' }}>Error: {error}</p>
        ) : (
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '30px', color: '#00ffc8' }}>
              📋 Noticias ({articles.length})
            </h2>

            {articles.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>No hay artículos</p>
            ) : (
              <div style={{
                overflowX: 'auto',
                border: '1px solid rgba(0, 255, 200, 0.2)',
                borderRadius: '12px',
                background: 'rgba(26, 31, 66, 0.5)'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.95em'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0, 255, 200, 0.2)', background: 'rgba(0, 255, 200, 0.1)' }}>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#00ffc8' }}>Título</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#00ffc8' }}>Categoría</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#00ffc8' }}>Estado</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#00ffc8' }}>Fecha</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#00ffc8' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article, idx) => (
                      <tr key={article.id} style={{
                        borderBottom: '1px solid rgba(0, 255, 200, 0.1)',
                        background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                      }}>
                        <td style={{ padding: '15px' }}>
                          <Link href={`/articles/${article.id}`} style={{ color: '#00ffc8', textDecoration: 'none' }}>
                            {article.title}
                          </Link>
                        </td>
                        <td style={{ padding: '15px', color: '#aaa' }}>{article.category || '-'}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: getStatusColor(article.status),
                            color: '#000',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            fontWeight: 'bold'
                          }}>
                            {article.status || 'draft'}
                          </span>
                        </td>
                        <td style={{ padding: '15px', color: '#aaa' }}>
                          {article.created_at ? new Date(article.created_at).toLocaleDateString('es-ES') : '-'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {article.status !== 'published' && (
                              <button
                                onClick={() => updateStatus(article.id, 'published')}
                                disabled={updating === article.id}
                                style={{
                                  background: '#00ff88',
                                  color: '#000',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.85em',
                                  opacity: updating === article.id ? 0.5 : 1
                                }}
                              >
                                ✓ Publicar
                              </button>
                            )}
                            {article.status !== 'draft' && (
                              <button
                                onClick={() => updateStatus(article.id, 'draft')}
                                disabled={updating === article.id}
                                style={{
                                  background: '#ffaa00',
                                  color: '#000',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.85em',
                                  opacity: updating === article.id ? 0.5 : 1
                                }}
                              >
                                ✎ Borrador
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
