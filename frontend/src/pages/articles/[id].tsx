"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import BannerSlots from '../../components/BannerSlots';

interface Article {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  category?: string;
  author?: string;
  status?: string;
  image_url?: string;
  seo_meta?: Record<string, any>;
  keywords?: string[];
  meta_description?: string;
  [key: string]: any;
}

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;


    const fetchArticle = async () => {
      try {
        if (!strapiUrl) {
          throw new Error('Falta NEXT_PUBLIC_STRAPI_URL');
        }
        // Usar el endpoint con filtro por ID
        const res = await fetch(`${strapiUrl}/api/articles?filters[id][$eq]=${id}&populate=*`, {
          headers: strapiToken ? { 'Authorization': `Bearer ${strapiToken}` } : {}
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        const arr = Array.isArray(json) ? json : (json.data || []);
        const item = arr[0] || arr;
        if (!item) throw new Error('Noticia no encontrada');
        const attrs = item.attributes || item;
        // Construir URL completa de la imagen si viene como ruta relativa desde Strapi
        const rawImage = attrs.image?.data?.attributes?.url ?? attrs.image?.url ?? null;
        const imageUrl = rawImage
          ? (rawImage.startsWith('http') ? rawImage : `${strapiUrl?.replace(/\/$/, '')}${rawImage}`)
          : null;

        setArticle({
          id: String(item.id),
          title: attrs.title ?? null,
          description: attrs.excerpt ?? null,
          created_at: attrs.publishedAt ?? attrs.createdAt ?? attrs.created_at ?? null,
          category: attrs.category ?? null,
          author: attrs.author ?? null,
          status: attrs.status ?? null,
          image_url: imageUrl,
          seo_meta: attrs.seo_meta ?? null,
          keywords: attrs.keywords ?? null,
          meta_description: attrs.meta_description ?? null,
          ...attrs
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Cargando...</p>;
  
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link href="/">
          <button style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            ← Volver a noticias
          </button>
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Noticia no encontrada</p>
        <Link href="/">
          <button style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
            ← Volver a noticias
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif', background: '#0a0e27', color: '#fff', minHeight: '100vh' }}>
      <Header />

      {/* Featured Image */}
      {article?.image_url && (
        <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
          <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized />
        </div>
      )}

      {/* Inline banner */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
        <BannerSlots position="between" />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        {/* Category Badge */}
        {article?.category && (
          <span style={{
            background: 'rgba(0, 255, 200, 0.2)',
            color: '#00ffc8',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85em',
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '20px'
          }}>
            {article.category}
          </span>
        )}

        {/* Title */}
        <h1 style={{ fontSize: '2.5em', margin: '20px 0', lineHeight: '1.2', fontWeight: 'bold' }}>
          {article?.title}
        </h1>

        {/* Meta Info */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', color: '#aaa', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(0, 255, 200, 0.1)', flexWrap: 'wrap' }}>
          {article?.author && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>👤 {article.author}</span>}
          {article?.created_at && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📅 {new Date(article.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>⏱️ 5 min lectura</span>
        </div>

        {/* Share Button */}
        <button style={{
          background: '#00ffc8',
          color: '#000',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '40px',
          fontSize: '0.95em',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}>
          📤 Compartir Artículo
        </button>

        {/* Description */}
        {article?.description && (
          <div style={{
            fontSize: '1.1em',
            lineHeight: '1.8',
            marginBottom: '30px',
            paddingLeft: '20px',
            borderLeft: '4px solid #00ffc8',
            background: 'rgba(0, 255, 200, 0.05)',
            padding: '20px 20px',
            borderRadius: '8px'
          }}>
            {article.description}
          </div>
        )}

        {/* IA Analysis Section */}
        {article?.seo_meta || article?.keywords ? (
          <div style={{
            background: 'rgba(0, 100, 100, 0.2)',
            border: '1px solid rgba(0, 255, 200, 0.3)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '40px'
          }}>
            <h3 style={{ color: '#00ffc8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              🤖 Análisis de Predicción IA
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.95em' }}>Impulsado por Análisis Avanzado</p>

            {article?.meta_description && (
              <div style={{ background: 'rgba(0, 255, 200, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <p style={{ margin: 0, color: '#ccc' }}>{article.meta_description}</p>
              </div>
            )}

            {article?.keywords && article.keywords.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <strong style={{ color: '#00ffc8' }}>Palabras clave:</strong>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {article.keywords.slice(0, 5).map((keyword, idx) => (
                    <span key={idx} style={{
                      background: 'rgba(0, 255, 200, 0.2)',
                      color: '#00ffc8',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85em',
                      border: '1px solid rgba(0, 255, 200, 0.3)'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* JSON Data */}
        <div style={{ marginTop: '40px', borderTop: '1px solid rgba(0, 255, 200, 0.1)', paddingTop: '40px' }}>
          <h3 style={{ color: '#00ffc8', marginTop: 0 }}>📊 Datos Completos</h3>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.85em',
            border: '1px solid rgba(0, 255, 200, 0.1)',
            maxHeight: '400px',
            color: '#00ffc8'
          }}>
            {JSON.stringify(article, null, 2)}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em', marginTop: '40px' }}>
        <p>© 2025 asi es el futbol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
