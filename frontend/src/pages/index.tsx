import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BannerSlots from '../components/BannerSlots';
import SampleAdBanner from '../components/SampleAdBanner';
import MatchTicker from '../components/MatchTicker';
import { GetStaticProps } from 'next';
import { getStrapiBase } from '../lib/strapiBase';

interface Props {
  articles: any[];
}

interface Article {
  id: string;
  slug?: string;
  title: string;
  created_at?: string;
  category?: string;
  author?: string;
  image_url?: string;
  description?: string;
}

const STRAPI = getStrapiBase() || process.env.NEXT_PUBLIC_API_ENDPOINT || '';

export default function HomePage({ articles }: Props) {
  const getArticleHref = (article: Article) => `/articles/${article.slug || article.id}`;
  // Ordenar por fecha descendente
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = new Date(a.created_at || a.publishedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.publishedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  const featured = sortedArticles[0];
  const highlighted = sortedArticles.slice(1, 5);
  const articlesByCategory = sortedArticles.reduce<Record<string, typeof sortedArticles>>((acc, article) => {
    const key = (article.category && String(article.category).trim()) || 'Sin categoría';
    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      {/* Header */}
      <Header />

      {/* Top banner */}
      <SampleAdBanner />
      <BannerSlots position="top" />

      {/* Main Content: hero left + two stacked cards right */}
      <div className="main-layout container-max">
        {/* Left: Hero */}
        {featured && (
          <Link href={getArticleHref(featured)} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="featured-aside" style={{
              background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.9), rgba(20, 26, 56, 0.9))',
              border: '1px solid rgba(0, 255, 200, 0.12)',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.6)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 200, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              
              {featured.image_url && (
                <div className="hero-image" style={{ height: '420px', position: 'relative' }}>
                  <Image src={featured.image_url} alt={featured.title || 'featured'} fill style={{ objectFit: 'cover' }} unoptimized />
                </div>
              )}
              
              <div style={{ padding: '30px' }}>
                {featured.category && (
                  <span style={{
                    background: 'rgba(0, 255, 200, 0.2)',
                    color: '#00ffc8',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    display: 'inline-block'
                  }}>
                    {featured.category.toUpperCase()}
                  </span>
                )}
                
                <h1 style={{ fontSize: '2em', margin: '15px 0', lineHeight: '1.3', fontWeight: 'bold' }}>
                  {featured.title}
                </h1>
                
                {featured.description && (
                  <p style={{ color: '#aaa', fontSize: '0.95em', lineHeight: '1.6', marginBottom: '20px' }}>
                    {featured.description ? featured.description.substring(0, 200) + '...' : null}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85em', color: '#aaa', borderTop: '1px solid rgba(0, 255, 200, 0.1)', paddingTop: '15px' }}>
                  {featured.author && <span>👤 {featured.author}</span>}
                  {featured.created_at && <span>📅 {new Date(featured.created_at).toLocaleDateString('es-ES')}</span>}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Right column: highlighted cards (mostrar hasta 4) */}
        <aside className="sidebar-aside" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {highlighted.slice(0,4).map((article, idx) => (
            <Link key={article.id} href={getArticleHref(article)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'linear-gradient(180deg, rgba(20,26,46,0.6), rgba(12,15,30,0.6))',
                border: '1px solid rgba(0,255,200,0.06)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '12px'
              }}>
                {article.image_url && (
                  <div style={{ width: '110px', height: '80px', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                    <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#00ffc8', fontSize: '0.75em', fontWeight: '700', marginBottom: '6px' }}>{article.category}</div>
                  <div style={{ fontWeight: '700', color: '#fff', lineHeight: '1.2' }}>{article.title ? article.title.substring(0, 80) + '...' : ''}</div>
                  <div style={{ fontSize: '0.75em', color: '#999', marginTop: '8px' }}>{article.created_at && new Date(article.created_at).toLocaleDateString('es-ES')}</div>
                </div>
              </div>
            </Link>
          ))}
        </aside>
      </div>

      {/* Match ticker similar to reference */}
      {/*<div className="container-max">
        <MatchTicker />
      </div>
      */}

      {/*
      <div style={{ maxWidth: '100%', padding: '0 40px' }}>
        <BannerSlots position="between" />
      </div>
      */} 
      {/* Grid de todas las noticias con sidebar de banners */}
      <div className="container-max" style={{ padding: '40px 20px', borderTop: '1px solid rgba(0, 255, 200, 0.1)' }}>
        <div className="news-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          <div>
            {/*<h3 style={{ color: '#00ffc8', fontSize: '1.3em', marginTop: 0, marginBottom: '20px' }}>📋 Noticias por Categoría</h3>*/}
            {sortedArticles.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>No hay artículos disponibles</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {Object.entries(articlesByCategory).map(([category, items]) => (
                  <section key={category}>
                    <h3 style={{ color: '#00ffc8', fontSize: '1.3em', margin: '0 0 14px 0' }}>📋 {category}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                      {items.map((article) => (
                        <Link key={article.id} href={getArticleHref(article)} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <article 
                            style={{
                              background: 'rgba(26, 31, 66, 0.6)',
                              border: '1px solid rgba(0, 255, 200, 0.1)',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.4)';
                              e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            {article.image_url && (
                              <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                                <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} unoptimized />
                              </div>
                            )}
                            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              {article.category && (
                                <span style={{
                                  background: 'rgba(0, 255, 200, 0.15)',
                                  color: '#00ffc8',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '0.7em',
                                  fontWeight: 'bold',
                                  width: 'fit-content',
                                  marginBottom: '6px'
                                }}>
                                  {article.category}
                                </span>
                              )}
                              {article.title ? (
                                <h4 style={{ fontSize: '1rem', margin: '0 0 8px 0', lineHeight: '1.2', fontWeight: 'bold' }}>
                                  {article.title ? article.title.substring(0, 120) + '...' : null}
                                </h4>
                              ) : null}
                              <div style={{ marginTop: 'auto', fontSize: '0.75em', color: '#888' }}>
                                {article.created_at && new Date(article.created_at).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
          {/*
          <aside style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ position: 'sticky', top: 100 }}>
              <BannerSlots position="sidebar" />
            </div>
            <div>
              <BannerSlots position="affiliate" />
            </div>
          </aside>
          */}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_API_ENDPOINT;
  const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  try {
    const res = await fetch(`${STRAPI}/api/articles?publicationState=live&populate=*&sort[0]=publishedAt:desc`, {
      headers: STRAPI_TOKEN ? { 'Authorization': `Bearer ${STRAPI_TOKEN}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    // Si la respuesta es un array plano, úsalo directamente; si es { data: [...] }, usa data
    const arr = Array.isArray(json) ? json : (json.data || []);
    const items = arr.map((item: any) => {
      // Si es formato plano, los campos están en item; si es formato data, están en item.attributes
      const attrs = item.attributes || item;
      const rawImage = attrs.image?.data?.attributes?.url ?? attrs.image?.url ?? null;
      const image_url = rawImage
        ? (rawImage.startsWith('http') ? rawImage : (STRAPI ? `${STRAPI.replace(/\/$/, '')}${rawImage}` : rawImage))
        : null;
      return {
        id: String(item.id),
        slug: attrs.slug ?? null,
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

