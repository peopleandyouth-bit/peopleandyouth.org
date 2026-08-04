import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import PrintProtection from './PrintProtection';

export const metadata: Metadata = {
  title: 'People & Youth — Sovereign Digital Institution',
  description: 'Empowering youth leadership, empirical research, and constitutional transparency.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#070b19',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className="bg-[#070b19] text-white antialiased min-h-screen w-full overflow-x-hidden">
        <PrintProtection>
          <div className="relative w-full max-w-full overflow-x-hidden flex flex-col min-h-screen">
            {children}
          </div>
        </PrintProtection>
      </body>
    </html>
  );
}