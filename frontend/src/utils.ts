export const getApiUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const isDev = import.meta.env.DEV;
  const baseUrl = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://sathayakala-mam-blog.onrender.com');
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};
