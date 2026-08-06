import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.peopleandyouth.org';

  const routes = [
    '',
    '/about',
    '/careers',
    '/constitution',
    '/realms',
    '/passport',
    '/renaissance-series',
    '/library',
    '/research-institute',
    '/activity',
    '/leadership-network',
    '/observatories',
    '/academy',
  ];

  const xmlUrls = routes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route === '' ? 'always' : 'daily'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}