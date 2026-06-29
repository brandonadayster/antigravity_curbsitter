export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

if (!MAPBOX_ACCESS_TOKEN) {
  console.warn('Mapbox access token is missing. Please define NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local');
}
