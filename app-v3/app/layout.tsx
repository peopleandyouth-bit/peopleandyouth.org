import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.peopleandyouth.org'),
  title: {
    default: 'People & Youth — Independent Institution | Building Institutions, Empowering Generations',
    template: '%s | People & Youth',
  },
  description:
    'People & Youth is an independent institution dedicated to advancing knowledge, leadership, research, civic engagement, and institution building globally.',
  keywords: [
    'People & Youth',
    'People and Youth',
    'peopleandyouth',
    'PEOPLE AND YOUTH',
    'peopleandyouth.org',
    'People & Youth Research Institute',
    'People & Youth Academy',
    'Dissent Dias',
    'Renaissance Series',
    'Civic Engagement',
    'Public Policy Institution'
  ],
  authors: [{ name: 'People & Youth', url: 'https://www.peopleandyouth.org' }],
  creator: 'People & Youth',
  publisher: 'People & Youth',
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: 'https://www.peopleandyouth.org',
  },
  openGraph: {
    title: 'People & Youth — Building Institutions. Empowering Generations.',
    description:
      'An independent global platform dedicated to advancing knowledge, research, leadership development, civic engagement, and institutional innovation.',
    url: 'https://www.peopleandyouth.org',
    siteName: 'People & Youth',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'People & Youth',
    description: 'Building Institutions. Empowering Generations.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'People & Youth',
    alternateName: ['People and Youth', 'peopleandyouth', 'PEOPLE AND YOUTH', 'peopleandyouth.org'],
    url: 'https://www.peopleandyouth.org',
    logo: 'https://www.peopleandyouth.org/logo.png',
    description:
      'People & Youth is an independent institution dedicated to advancing knowledge, research, leadership development, civic engagement, and institution building.',
    sameAs: [
      'https://www.linkedin.com/company/https-www.peopleandyouth.org-/',
      'https://instagram.com/peopleandyouth',
      'https://youtube.com/@peopleandyouth',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'People & Youth',
    alternateName: ['People and Youth', 'peopleandyouth'],
    url: 'https://www.peopleandyouth.org',
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased bg-[#030611] text-white">
        {children}
      </body>
    </html>
  );
}