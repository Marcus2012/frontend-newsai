export function getStrapiBase(): string {
  const prd = (process.env.NEXT_PUBLIC_STRAPI_PRD || '').replace(/\/admin$/, '').replace(/\/$/, '');
  const dev = (process.env.NEXT_PUBLIC_STRAPI_URL || '').replace(/\/$/, '');
  const internal = (process.env.STRAPI_INTERNAL_URL || '').replace(/\/$/, '');
  const useProxy = (process.env.NEXT_PUBLIC_USE_STRAPI_PROXY || 'false') === 'true';
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || '';

  // Browser runtime
  if (typeof window !== 'undefined') {
    if (useProxy) return '/api/strapi';
    if (window.location.protocol === 'https:' && prd) return prd;
    return dev || '';
  }

  // Server/runtime (getStaticProps, SSR) - prefer internal server URL if provided
  if (internal) return internal;
  if ((env === 'production' || process.env.NODE_ENV === 'production') && prd) return prd;
  return dev || '';
}
