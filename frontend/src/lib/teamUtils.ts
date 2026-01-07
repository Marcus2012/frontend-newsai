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
  return fallback || '/Logo_aeef.png';
}
