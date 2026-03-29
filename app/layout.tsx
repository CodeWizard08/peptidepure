import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ChatWidget from '@/components/ChatWidget';
import { getContent } from '@/lib/content';
import type { FooterContent } from '@/lib/content-types';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

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
    images: [
      {
        url: 'https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2025/05/product-line-up.webp',
        width: 1200,
        height: 630,
        alt: 'PeptidePure™ peptide product lineup',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PeptidePure™ — Clinician Peptide Platform',
    description:
      'USA cGMP-compliant peptides with >99% purity. Built exclusively for licensed clinicians.',
    images: ['https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2025/05/product-line-up.webp'],
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
  const footerContent = await getContent<FooterContent>('footer');

  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${bricolage.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': 'https://peptidepure.com/#organization',
                name: 'PeptidePure™',
                url: 'https://peptidepure.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://peptidepure.com/logo.webp',
                  width: 140,
                  height: 36,
                },
                description: 'Clinician-only peptide sourcing platform. USA cGMP-compliant peptides with >99% purity.',
                telephone: '+1-858-480-1017',
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer service',
                  telephone: '+1-858-480-1017',
                  url: 'https://peptidepure.com/contact',
                  availableLanguage: 'English',
                },
                sameAs: [],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': 'https://peptidepure.com/#website',
                url: 'https://peptidepure.com',
                name: 'PeptidePure™',
                publisher: { '@id': 'https://peptidepure.com/#organization' },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: { '@type': 'EntryPoint', urlTemplate: 'https://peptidepure.com/peptides?q={search_term_string}' },
                  'query-input': 'required name=search_term_string',
                },
              },
            ]),
          }}
        />
        <Providers>
          <Header />
          <main style={{ paddingTop: 'var(--nav-h)' }}>{children}</main>
          <Footer content={footerContent} />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
