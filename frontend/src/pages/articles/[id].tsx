"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import BannerSlots from '../../components/BannerSlots';
import SampleAdBanner from '../../components/SampleAdBanner';
import { getStrapiBase } from '../../lib/strapiBase';

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
  const strapiUrl = getStrapiBase();
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);

  const iconBtnStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.04)',
    boxShadow: '0 8px 20px rgba(2,6,23,0.6)',
    cursor: 'pointer',
    padding: 6,
    transition: 'transform 0.12s ease, box-shadow 0.12s ease'
  };

  useEffect(() => {
    if (!showShare) return;
    const onDoc = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (shareRef.current && target && !shareRef.current.contains(target)) {
        setShowShare(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showShare]);

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

  // Fetch related articles once the main article is loaded
  useEffect(() => {
    if (!article) return;

    const fetchRelated = async () => {
      try {
        if (!strapiUrl) return;
        const params = article.category
          ? `filters[category][$eq]=${encodeURIComponent(article.category)}&filters[id][$ne]=${encodeURIComponent(article.id)}`
          : `filters[id][$ne]=${encodeURIComponent(article.id)}`;

        const res = await fetch(`${strapiUrl}/api/articles?${params}&populate=*&pagination[limit]=4&sort=publishedAt:desc`, {
          headers: strapiToken ? { 'Authorization': `Bearer ${strapiToken}` } : {}
        });
        if (!res.ok) return;
        const json = await res.json();
        const items = json.data || [];
        const mapped: Article[] = items.map((item: any) => {
          const attrs = item.attributes || item;
          const rawImage = attrs.image?.data?.attributes?.url ?? attrs.image?.url ?? null;
          const imageUrl = rawImage
            ? (rawImage.startsWith('http') ? rawImage : `${strapiUrl?.replace(/\/$/, '')}${rawImage}`)
            : null;

          return {
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
          };
        });

        setRelated(mapped.slice(0, 4));
      } catch (e) {
        // fail silently
        console.error('Error fetching related:', e);
      }
    };

    fetchRelated();
  }, [article]);

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
      {/*
      <SampleAdBanner />
      */}  
      {/* Featured Image */}
      {article?.image_url && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '32px 0 24px 0' }}>
          <div className="article-hero">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
              sizes="(max-width: 900px) 100vw, 1200px"
              priority
            />
            </div>
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
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '40px' }}>
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
          onClick={() => setShowShare(s => !s)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
            📤 Compartir Artículo
          </button>

          {/* Share icons popover */}
          {showShare && (
            <div ref={shareRef} style={{
              position: 'absolute',
              top: 'auto',
              bottom: 'calc(100% + 8px)',
              left: '0',
              transform: 'none',
              background: 'rgba(6,10,30,0.98)',
              padding: '6px 8px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)',
              boxShadow: '0 8px 20px rgba(2,6,23,0.6)',
              display: 'flex',
              gap: '10px',
              zIndex: 60,
              alignItems: 'center'
            }}>
              {/** Social buttons **/}
              <button title="X" onClick={() => {
                const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                const text = encodeURIComponent(article?.title || '');
                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
              }} style={iconBtnStyle} onMouseEnter={(e)=> (e.currentTarget.style.transform = 'scale(1.08)') } onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)') }>
                {/* Icono X (Twitter nuevo) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#181818"/><path d="M7.5 7.5L16.5 16.5M16.5 7.5L7.5 16.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>

              <button title="Facebook" onClick={() => {
                const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener');
              }} style={iconBtnStyle} onMouseEnter={(e)=> (e.currentTarget.style.transform = 'scale(1.08)') } onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)') }>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38V12h2.44l-.39 2.9h-2.05v7A10 10 0 0022 12"/></svg>
              </button>

              <button title="WhatsApp" onClick={() => {
                const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                const text = encodeURIComponent(`${article?.title ?? ''} - `);
                window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank', 'noopener');
              }} style={iconBtnStyle} onMouseEnter={(e)=> (e.currentTarget.style.transform = 'scale(1.08)') } onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)') }>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="#25D366" d="M12.04 2C6.48 2 2 6.48 2 12.04c0 2.11.56 4.07 1.53 5.8L2 22l4.36-1.42A10.04 10.04 0 0012.04 22C17.6 22 22.08 17.52 22.08 12.04 22.08 6.48 17.6 2 12.04 2z"/>
                  <path fill="#fff" d="M17.1 14.5c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.18.3-.69.97-.85 1.17-.16.2-.33.22-.62.08-.29-.15-1.23-.45-2.34-1.45-.86-.76-1.44-1.7-1.61-2-.17-.3-.02-.46.13-.61.13-.14.29-.33.43-.5.14-.17.18-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.58-.49-.5-.66-.51-.17-.01-.36-.01-.55-.01-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.97 2.63 1.1 2.82c.13.19 1.9 2.98 4.62 4.2 3.22 1.45 3.22 0 3.8-.99.59-.98.59-1.82.41-1.99-.18-.18-.33-.3-.62-.45z"/>
                </svg>
              </button>
              {/*
              <button title="Telegram" onClick={() => {
                const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                const text = encodeURIComponent(article?.title || '');
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, ' _blank', 'noopener');
              }} style={iconBtnStyle} onMouseEnter={(e)=> (e.currentTarget.style.transform = 'scale(1.08)') } onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)') }>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#26A5E4" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 .002 5.37.002 12S5.37 24 12 24s12-5.37 12-12S18.63 0 12 0zm5.2 8.4l-1.9 9.12c-.14.64-.5.8-1.02.5l-2.82-2.08-1.36 1.3c-.15.15-.28.28-.57.28l.2-2.86 5.2-4.7c.22-.2-.05-.32-.34-.12l-6.43 4.05-2.77-.86c-.6-.2-.61-.6.12-.89L16.8 7.2c.52-.18.97.12.6.18z"/></svg>
              </button>

              <button title="LinkedIn" onClick={() => {
                const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                const title = encodeURIComponent(article?.title || '');
                window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank', 'noopener');
              }} style={iconBtnStyle} onMouseEnter={(e)=> (e.currentTarget.style.transform = 'scale(1.08)') } onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)') }>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.1 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4v14h-4zM8.5 8h3.8v2h.06c.53-1 1.84-2 3.79-2 4.06 0 4.81 2.68 4.81 6.16V22h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.37 1.6-2.37 3.28V22h-4V8z"/></svg>
              </button>
              */}
              <button title="Copiar" onClick={async () => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                try { await navigator.clipboard.writeText(url); alert('Enlace copiado al portapapeles'); }
                catch { alert('No se pudo copiar'); }
              }} style={iconBtnStyle} onMouseEnter={(e)=> (e.currentTarget.style.transform = 'scale(1.08)') } onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)') }>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#888" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1zM20 5H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h12v14z"/></svg>
              </button>
            </div>
          )}
        </div>

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

        {/* Content (body) - styled card */}
        {article && (article as any).content && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              background: '#ffffff',
              color: '#071022',
              borderRadius: 12,
              padding: '28px',
              boxShadow: '0 8px 30px rgba(2,6,23,0.45)',
              lineHeight: 1.9
            }} className="article-body">
              <div dangerouslySetInnerHTML={{ __html: (article as any).content }} />
            </div>

            <style jsx global>{`
              .article-body p { margin: 1em 0; color: #1f2a39; font-size: 1.03rem; }
              .article-body a { color: #0077a6; text-decoration: underline; }
              .article-body h1, .article-body h2, .article-body h3, .article-body h4 { color: #071022; margin-top: 1.4em; margin-bottom: 0.6em; font-weight: 700; }
              .article-body img { max-width: 100%; height: auto; display: block; margin: 18px auto; border-radius: 8px; }
              .article-body figure { margin: 0; }
              .article-body blockquote { border-left: 4px solid #00ffc8; background: rgba(0,255,200,0.03); padding: 12px 16px; margin: 18px 0; color: #143033; }
              .article-body ul, .article-body ol { margin: 12px 0 20px 1.2rem; color: #1f2a39; }
              .article-body pre, .article-body code { background: #07102a; color: #00ffc8; padding: 8px 10px; border-radius: 6px; overflow: auto; }
              .article-body iframe { width: 100%; max-width: 900px; margin: 18px auto; display: block; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; }
              .article-body .twitter-tweet { margin: 18px auto !important; }
              .article-body .pull-quote { border-left: 4px solid #ffd166; background: #fff7e6; padding: 12px 16px; margin: 18px 0; color: #6b4a00; border-radius: 6px; }
              @media (max-width: 720px) {
                .article-body { padding: 18px; }
                .article-body p { font-size: 1rem; }
              }
            `}</style>
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

        {/* Related Articles */}
        <div style={{ maxWidth: 1000, margin: '40px auto 0', padding: '20px', clear: 'both' }}>
          <h3 style={{ color: '#00ffc8', marginTop: 0 }}>Noticias relacionadas</h3>
          {related.length === 0 ? (
            <p style={{ color: '#aaa' }}>No hay noticias relacionadas</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '16px' }}>
              {related.map(r => {
                const d = r.created_at ? new Date(r.created_at) : null;
                const dateStr = d ? `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}` : '';
                return (
                  <Link key={r.id} href={`/articles/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#07102a', border: '1px solid rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer' }}>
                      {r.image_url && (
                        <div style={{ width: '100%', height: 180, position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
                          <Image src={r.image_url} alt={r.title || ''} fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                      )}
                      <h4 style={{ fontSize: '1.05em', margin: '8px 0', color: '#fff' }}>{r.title}</h4>
                      <p style={{ color: '#aaa', fontSize: '0.95em', marginTop: 'auto', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description ?? ''}</p>
                      <div style={{ color: '#00ffc8', marginTop: '8px', fontSize: '0.85em' }}>{dateStr}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* JSON Data */}
        {/*
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
        */}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em', marginTop: '40px' }}>
        <p>© 2025 asi es el futbol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
