export function formatTeamName(n?: string | null) {
  if (!n) return '';
  const s = String(n).trim();
  const lower = s.toLowerCase();
  if (lower === 'cultural santa rosa' || lower.includes('cultural santa rosa')) return 'Los Chankas';
  return s;
}

export function formatTeamLogo(name?: string | null, fallback?: string | null) {
  if (!name) return fallback || '/Logo_aeef.png';
  const lower = String(name).toLowerCase();
  if (lower === 'cultural santa rosa' || lower.includes('cultural santa rosa') || lower.includes('los chankas')) {
    return 'https://ipetcead.com/aeef/loschankas.png';
  }
  if (lower === 'fc cajamarca' || lower.includes('fc cajamarca') || lower === 'cajamarca fc' || lower.includes('cajamarca fc')) {
    return 'https://storage.googleapis.com/asieselfutbol/production-statics/logo_fccajamarca.png';
  }
  if (lower.includes('ucv moquegua') || lower.includes('cesar vallejo moquegua')) {
    return 'https://tmssl.akamaized.net//images/wappen/head/114625.png?lm=1735173037';
  }
  return fallback || '/Logo_aeef.png';
}
