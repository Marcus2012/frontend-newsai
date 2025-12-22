import Link from 'next/link';
import Image from 'next/image';
import { GetStaticProps } from 'next';

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

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_API_ENDPOINT;

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
      <header style={{
        background: 'rgba(10, 14, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 255, 200, 0.1)',
        padding: '15px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: '"Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif'
      }}>
        <div style={{ maxWidth: '100%', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://ipetcead.com/new/asieselfutbol.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', objectFit: 'cover' }} />
            <div style={{ fontSize: '0.9em' }}>
              <div style={{ color: '#00ffc8', fontWeight: 'bold' }}>AI Sports</div>
              <div style={{ fontSize: '0.75em', color: '#aaa' }}>Predictor</div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '30px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Inicio</Link>
            <Link href="/noticias" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Noticias</Link>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Predicciones</a>
            <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Calculadora</a>
            <Link href="/nosotros" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Nosotros</Link>
            <Link href="/contacto" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9em', cursor: 'pointer', transition: 'color 0.3s' }}>Contacto</Link>
          </nav>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link href="/admin" style={{ background: '#00ffc8', color: '#000', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85em', cursor: 'pointer' }}>
              ADMIN
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '100%', padding: '40px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
        
        {/* Featured Article */}
        {featured && (
          <Link href={`/articles/${featured.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8), rgba(26, 31, 66, 0.8))',
              border: '1px solid rgba(0, 255, 200, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
                <div style={{ height: '300px', position: 'relative' }}>
                  <Image src={featured.image_url} alt={featured.title || 'featured'} fill style={{ objectFit: 'cover' }} />
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

        {/* Sidebar - Noticias Destacadas */}
        <div>
          <h3 style={{ color: '#00ffc8', fontSize: '1.1em', marginTop: 0, marginBottom: '20px' }}>📰 Noticias Destacadas</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {highlighted.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'rgba(26, 31, 66, 0.6)',
                  border: '1px solid rgba(0, 255, 200, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 200, 0.1)';
                }}>
                  
                  {article.image_url && (
                    <div style={{ width: '80px', height: '80px', minWidth: '80px', overflow: 'hidden', position: 'relative' }}>
                      <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  
                  <div style={{ padding: '10px', flex: 1 }}>
                    {article.category && (
                      <span style={{
                        background: 'rgba(0, 255, 200, 0.15)',
                        color: '#00ffc8',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.7em',
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        display: 'inline-block'
                      }}>
                        {article.category}
                      </span>
                    )}
                    
                    <h4 style={{ fontSize: '0.85em', margin: '5px 0', lineHeight: '1.2', fontWeight: 'bold' }}>
                      {article.title ? article.title.substring(0, 50) + '...' : null}
                    </h4>
                    
                    {article.created_at && (
                      <span style={{ fontSize: '0.75em', color: '#888' }}>
                        {new Date(article.created_at).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de todas las noticias */}
      <div style={{ maxWidth: '100%', padding: '40px', borderTop: '1px solid rgba(0, 255, 200, 0.1)' }}>
        <h3 style={{ color: '#00ffc8', fontSize: '1.3em', marginTop: 0, marginBottom: '30px' }}>📋 Todas las Noticias</h3>
        
        {sortedArticles.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>No hay artículos disponibles</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {sortedArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                    <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
                      <Image src={article.image_url} alt={article.title} fill style={{ objectFit: 'cover' }} />
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
                      <h4 style={{ fontSize: '0.9em', margin: '0 0 8px 0', lineHeight: '1.2', fontWeight: 'bold' }}>
                        {article.title ? article.title.substring(0, 60) + '...' : null}
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
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0, 255, 200, 0.1)', padding: '30px 40px', textAlign: 'center', color: '#888', fontSize: '0.85em' }}>
        <p>© 2025 AI Sports Predictor. Todos los derechos reservados.</p>
      </footer>
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
      return {
        id: String(item.id),
        title: attrs.title ?? null,
        created_at: attrs.publishedAt ?? attrs.createdAt ?? attrs.created_at ?? null,
        category: attrs.category ?? null,
        author: attrs.author ?? null,
        image_url: attrs.image?.data?.attributes?.url ?? attrs.image?.url ?? null,
        description: attrs.excerpt ?? null
      };
    });

    return { props: { articles: items }, revalidate: 120 };
  } catch (err) {
    return { props: { articles: [] }, revalidate: 60 };
  }
};

