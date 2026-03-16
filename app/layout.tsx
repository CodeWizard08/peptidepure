import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import { getContent } from '@/lib/content';

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://peptidepure.com'),
  title: {
    default: 'PeptidePure™ — Clinician Peptide Platform',
    template: '%s | PeptidePure™',
  },
  description:
    'PeptidePure™ gives licensed clinicians a smarter, cleaner path to peptide medicine. USA cGMP-compliant, >99% purity, fast shipping.',
  keywords: [
    'peptides',
    'clinician peptide platform',
    'peptide research',
    'BPC-157',
    'TIRZ',
    'TB-500',
    'peptide protocols',
    'cGMP peptides',
    'peptide sourcing',
    'clinical peptides',
  ],
  authors: [{ name: 'PeptidePure™' }],
  creator: 'PeptidePure™',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PeptidePure™',
    title: 'PeptidePure™ — Clinician Peptide Platform',
    description:
      'USA cGMP-compliant peptides with >99% purity. Built exclusively for licensed clinicians.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PeptidePure™ — Clinician Peptide Platform',
    description:
      'USA cGMP-compliant peptides with >99% purity. Built exclusively for licensed clinicians.',
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
  alternates: {
    canonical: '/',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerContent = await getContent<any>('footer');

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Bricolage+Grotesque:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'PeptidePure™',
              url: 'https://peptidepure.com',
              description:
                'Clinician-only peptide sourcing platform. USA cGMP-compliant peptides with >99% purity.',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: 'https://peptidepure.com/contact',
              },
            }),
          }}
        />
        <Providers>
          <Header />
          <main style={{ paddingTop: '64px' }}>{children}</main>
          <Footer content={footerContent} />
        </Providers>
      </body>
    </html>
  );
}
