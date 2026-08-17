// Absolute base URL for links inside emails (relative URLs don't work in
// email clients). APP_URL is for local dev / an explicit override;
// VERCEL_PROJECT_PRODUCTION_URL is set automatically by Vercel and stays
// stable across deployments (unlike VERCEL_URL, which is per-deployment).
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3001";
}
