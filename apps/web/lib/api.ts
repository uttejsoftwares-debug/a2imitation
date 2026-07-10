const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || process.env.API_INTERNAL_URL || '';

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
}
