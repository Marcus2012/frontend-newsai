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
  title: string;
  created_at?: string;
  category?: string;
  author?: string;
  image_url?: string;
  description?: string;
}

const STRAPI = getStrapiBase() || process.env.NEXT_PUBLIC_API_ENDPOINT || '';

export default function HomePage({ articles }: Props) {
  // Ordenar por fecha descendente
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = new Date(a.created_at || a.publishedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.publishedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  const featured = sortedArticles[0];
  const highlighted = sortedArticles.slice(1, 4);

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
          <Link href={`/articles/${featured.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  }}>
                    {featured.category}
                  </span>
                )}
                <h2 style={{ color: '#fff', fontWeight: 'bold', fontSize: '2.1em', margin: '18px 0 10px 0', letterSpacing: '-1px' }}>{featured.title}</h2>
                {featured.description && (
                  <p style={{ color: '#cfe', fontSize: '1.13em', marginBottom: '10px', lineHeight: 1.5 }}>{featured.description.substring(0, 180)}...</p>
                )}
                <div style={{ color: '#00ffc8', fontSize: '0.95em', marginTop: 10 }}>{featured.created_at && new Date(featured.created_at).toLocaleDateString('es-ES')}</div>
              </div>
            </div>
          </Link>
        )}
        {/* ...existing code... */}
      </div>
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

