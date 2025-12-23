import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
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

      {/* Main Noticias Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 0 20px' }}>
        <h1 style={{ color: '#00ffc8', fontSize: '2em', fontWeight: 'bold', marginBottom: '30px' }}>📰 Todas las Noticias</h1>
        {articles.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>No hay artículos disponibles</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
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
                    <div style={{ height: '180px', position: 'relative' }}>
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

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em', marginTop: '40px' }}>
        <p>© 2025 asi es el futbol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_API_ENDPOINT;
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
