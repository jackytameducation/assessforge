// Utility to get the correct API URL with basePath
export function getApiUrl(path: string): string {
  // Get the basePath from the environment or use the configured one
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/assessforge';
  
  // In the browser, construct the full URL with basePath
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}${basePath}${path}`;
  }
  
  // On server, just return the path with basePath
  return `${basePath}${path}`;
}
