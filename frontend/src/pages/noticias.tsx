
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BannerSlots from '../components/BannerSlots';
import SampleAdBanner from '../components/SampleAdBanner';
import BannerEasyPromo from '../components/BannerEasyPromo';
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

      {/* Banner superior de ejemplo (placeholder) */}
      <SampleAdBanner />
      <div className="banner-mobile-wrapper">
        <BannerSlots position="top" />
      </div>

      {/* Mobile banner below content (visible only on small screens) */}
      <div className="mobile-banner-bottom">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: 340 }}>
            <BannerEasyPromo />
          </div>
          <a href="#" target="_blank" rel="prefetch noreferrer noopener" style={{ width: '100%', maxWidth: 340 }}>
            <img
              src="https://storage.googleapis.com/asieselfutbol/production-statics/TA-CA_META_FTD-GENERICO_1080X1080.jpg"
              alt="Te apuesto"
              style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
            />
          </a>
        </div>
      </div>

      {/* Grid de noticias con banner de ejemplo a la derecha en desktop */}
      <div className="noticias-content-layout">
        <aside className="noticias-content-banner">
          <div style={{ marginBottom: 18 }}>
            <BannerEasyPromo />
          </div>
          <a href="#" target="_blank" rel="prefetch noreferrer noopener" className="teapuesto-banner-link">
            <div className="teapuesto-banner-bg">
              <img
                src="https://storage.googleapis.com/asieselfutbol/production-statics/TA-CA_META_FTD-GENERICO_1080X1080.jpg"
                alt="Te apuesto"
                className="teapuesto-banner-img"
                width={320}
                height={547}
              />
            </div>
          </a>
          <a
            href="https://www.youtube.com/@asieselfutbol_tv"
            target="_blank"
            rel="noopener noreferrer"
            className="teapuesto-banner-link"
            style={{marginTop: '18px'}}>
            <div className="teapuesto-banner-bg">
              <img
                src="https://storage.googleapis.com/asieselfutbol/production-statics/Banner-AEEF%20(1).png"
                alt="Banner AEEF"
                className="teapuesto-banner-img"
                width={320}
                height={320}
              />
            </div>
          </a>
        </aside>
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
        
      </div>

      {/* Footer */}
      <Footer />

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
          position: relative;
        }
        .noticias-content-main {
          flex: 1 1 0%;
          min-width: 0;
          padding-right: 380px; /* espacio para el banner overlay */
        }
        .noticias-content-banner {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 24px;
          position: absolute; /* overlay encima del contenido */
          right: 20px;
          top: 120px; /* ajustar según header */
          z-index: 50;
          pointer-events: auto;
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
            position: static;
            width: 100%;
            padding: 0;
            margin-left: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .mobile-banner-bottom {
            display: block;
          }
          .footer-desktop {
            display: none;
          }
        }
        .mobile-banner-bottom { display: none; }
        .teapuesto-banner-link {
          display: block;
          width: 100%;
          max-width: 340px;
          border-radius: 22px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.32);
          background: linear-gradient(135deg, #181f34 60%, #232b47 100%);
          padding: 10px 8px 8px 8px;
          margin: 0 auto;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .teapuesto-banner-link:hover {
          box-shadow: 0 16px 48px rgba(0,0,0,0.45);
          transform: translateY(-4px) scale(1.03);
        }
        .teapuesto-banner-bg {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 18px;
          background: #181f34;
        }
        .teapuesto-banner-img {
          display: block;
          width: 100%;
          max-width: 320px;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.22);
          background: #181f34;
        }
        @media (max-width: 900px) {
          .teapuesto-banner-link {
            max-width: 98vw;
            padding: 6px 2vw 6px 2vw;
          }
          .teapuesto-banner-img {
            max-width: 98vw;
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
