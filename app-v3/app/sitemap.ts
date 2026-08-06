import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
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

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'always' : 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));
}