
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import BannerSlots from '../components/BannerSlots';
import { getStrapiBase } from '../lib/strapiBase';

import { GetStaticProps } from 'next';

interface Article {
  id: string;
  title: string;
  created_at?: string;
  category?: string;
  author?: string;
  image_url?: string;
  description?: string;
}

interface NoticiasProps {
  articles: Article[];
}

export default function NoticiasPage({ articles }: NoticiasProps) {
  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      <Header />

      {/* Banner superior, siempre visible arriba */}
      <div className="banner-mobile-wrapper">
        <BannerSlots position="top" />
      </div>

      {/* Grid de noticias con banner de ejemplo a la derecha en desktop */}
      <div className="noticias-content-layout">
        <div className="noticias-content-main">
          <h1 style={{ color: '#00ffc8', fontSize: '2em', fontWeight: 'bold', marginBottom: '30px' }}>📰 Todas las Noticias</h1>
          {articles.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#aaa' }}>No hay artículos disponibles</p>
          ) : (
            <div className="noticias-grid">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <article style={{
                    background: 'rgba(26, 31, 66, 0.7)',
                    border: '1px solid rgba(0, 255, 200, 0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}>
                    {article.image_url && (
                      <div style={{ height: '220px', position: 'relative' }}>
                        <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                    )}
                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '0 0 10px 0', color: '#fff' }}>{article.title}</h2>
                      {article.description && (
                        <p style={{ color: '#aaa', fontSize: '0.95em', marginBottom: '10px' }}>{article.description.substring(0, 120)}...</p>
                      )}
                      <div style={{ marginTop: 'auto', fontSize: '0.85em', color: '#00ffc8' }}>
                        {article.created_at && new Date(article.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
        <aside className="noticias-content-banner">
          <a href="https://www.mundodeportivo.com/us/apuestas-latam/ir-betano-pe" target="_blank" rel="prefetch noreferrer noopener">
            <img
              src="https://www.mundodeportivo.com/us/apuestas-latam/thumbor/IqTBUbo8B6ts0mowThRlyTbj8rY=/394x674/smart/filters:format(webp)/https%3A%2F%2Fwww.mundodeportivo.com%2Fus%2Fapuestas-latam%2Fapp%2Fuploads%2F2025%2F11%2Fgirosgratis-betano-peru-min.webp"
              alt="bono betano giros gratis"
              style={{ width: '320px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
              width={320}
              height={547}
            />
          </a>
        </aside>
      </div>

      {/* Footer */}
      <footer className="footer-desktop" style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em', marginTop: '40px' }}>
        <p>© 2025 asi es el futbol. Todos los derechos reservados.</p>
      </footer>

      {/* CSS para grid y banner a la derecha */}
      <style jsx>{`
        .banner-mobile-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 0 20px;
        }
        .noticias-content-layout {
          display: flex;
          flex-direction: row;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px 0 20px;
          gap: 32px;
        }
        .noticias-content-main {
          flex: 1 1 0%;
          min-width: 0;
        }
        .noticias-content-banner {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 24px;
        }
        /* Mantener el banner visible mientras se hace scroll */
        .noticias-content-banner > a {
          position: sticky;
          top: 96px; /* ajuste para dejar espacio al header fijo */
          z-index: 30;
          align-self: flex-end;
        }

        .noticias-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 36px;
        }

        .noticias-grid article {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .noticias-grid article:hover { transform: translateY(-6px); box-shadow: 0 18px 50px rgba(2,6,23,0.45); }
        .footer-desktop {
          display: block;
        }
        @media (max-width: 900px) {
          .noticias-content-layout {
            flex-direction: column;
            padding: 24px 0 0 0;
            gap: 0;
          }
          .noticias-content-main {
            width: 100%;
            padding: 0 10px;
          }
          .noticias-content-banner {
            display: none;
          }
          .footer-desktop {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const STRAPI = getStrapiBase() || process.env.NEXT_PUBLIC_API_ENDPOINT || '';
  const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  //const BASE = STRAPI || 'http://localhost:1337';
  try {
    const res = await fetch(`${STRAPI}/api/articles?publicationState=live&populate=*&sort[0]=publishedAt:desc`, {
      headers: STRAPI_TOKEN ? { 'Authorization': `Bearer ${STRAPI_TOKEN}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    const arr = Array.isArray(json) ? json : (json.data || []);
    const items = arr.map((item: any) => {
      const attrs = item.attributes || item;
      const rawImage = attrs.image?.data?.attributes?.url ?? attrs.image?.url ?? null;
      const image_url = rawImage
        ? (rawImage.startsWith('http') ? rawImage : `${STRAPI?.replace(/\/$/, '')}${rawImage}`)
        : null;
      return {
        id: String(item.id),
        title: attrs.title ?? null,
        created_at: attrs.publishedAt ?? attrs.createdAt ?? attrs.created_at ?? null,
        category: attrs.category ?? null,
        author: attrs.author ?? null,
        image_url,
        description: attrs.excerpt ?? null
      };
    });
    return { props: { articles: items }, revalidate: 120 };
  } catch (err) {
    return { props: { articles: [] }, revalidate: 60 };
  }
};
