export function getStrapiBase(): string {
  const prd = (process.env.NEXT_PUBLIC_STRAPI_PRD || '').replace(/\/admin$/, '').replace(/\/$/, '');
  const dev = (process.env.NEXT_PUBLIC_STRAPI_URL || '').replace(/\/$/, '');
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || '';

  // On the browser prefer PRD if current protocol is https
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' && prd) return prd;
  }

  // On server/runtime prefer PRD when building for production
  if ((env === 'production' || process.env.NODE_ENV === 'production') && prd) return prd;

  return dev || '';
}
