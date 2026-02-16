import type { GetServerSideProps } from "next";
import { getStrapiBase } from "../lib/strapiBase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://asieselfutbol.com";

const fetchAllArticles = async () => {
  const strapiUrl = getStrapiBase();
  if (!strapiUrl) return [];

  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const pageSize = 100;
  let page = 1;
  let pageCount = 1;
  const items: any[] = [];

  while (page <= pageCount) {
    const url = `${strapiUrl}/api/articles?fields[0]=slug&fields[1]=updatedAt&fields[2]=publishedAt&fields[3]=createdAt&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=publishedAt:desc`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const json = await res.json();
    const data = Array.isArray(json) ? json : json.data || [];
    items.push(...data);

    const pagination = json?.meta?.pagination;
    pageCount = pagination?.pageCount || 1;
    page += 1;
  }

  return items;
};

const buildSitemapXml = (articles: any[]) => {
  const urls: string[] = [];
  const now = new Date().toISOString();
  const seen = new Set<string>();

  const pushUrl = (path: string, lastmod?: string) => {
    if (!path) return;
    const loc = `${SITE_URL}${path}`;
    if (seen.has(loc)) return;
    seen.add(loc);
    const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
    urls.push(`<url><loc>${loc}</loc>${lastmodTag}</url>`);
  };

  const staticPaths = [
    '/',
    '/noticias',
    '/nosotros',
    '/contacto',
    '/predicciones',
    '/calculadora',
    '/matches/england/premier',
    '/matches/italy/seriea',
    '/matches/spain/la-liga',
    '/matches/germany/bundesliga',
    '/matches/france/ligue-1',
    '/matches/europe/champions-league',
    '/matches/peru/primera',
    '/matches/peru/segunda',
    '/matches/argentina/liga-profesional',
    '/matches/argentina/copa-argentina',
    '/matches/brasil/serie-a',
    '/matches/colombia/liga-betplay',
    '/matches/ecuador/liga-pro',
    '/matches/usa/mls',
    '/matches/mexico/liga-mx',
    '/matches/conmebol/copa-libertadores',
    '/matches/conmebol/copa-sudamericana'
  ];

  staticPaths.forEach((path) => pushUrl(path, now));

  for (const item of articles) {
    const attrs = item.attributes || item;
    const slug = attrs.slug || null;
    const id = item.id || attrs.id;
    const lastmod = attrs.updatedAt || attrs.updated_at || attrs.publishedAt || attrs.createdAt;
    const path = slug ? `/articles/${slug}` : `/articles/${id}`;
    const lastmodTag = lastmod ? new Date(lastmod).toISOString() : undefined;
    pushUrl(path, lastmodTag);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>`;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const articles = await fetchAllArticles();
  const xml = buildSitemapXml(articles);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.end(xml);

  return { props: {} };
};

export default function SiteMap() {
  return null;
}
