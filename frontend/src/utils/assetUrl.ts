/**
 * Converts a relative backend asset path (e.g. /uploads/logo_123.png)
 * to an absolute URL pointing to the backend server.
 *
 * In development, Vite proxies /uploads → localhost:3000, so a relative
 * path already works. This helper is mainly a safety net for production
 * deployments where frontend and backend may be on different origins.
 */
export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${base}${path}`;
}
