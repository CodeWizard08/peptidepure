import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'PeptidePure™ — Clinician Peptide Platform',
  description:
    'PeptidePure™ gives licensed clinicians a smarter, cleaner path to peptide medicine. USA cGMP-compliant, >99% purity, fast shipping.',
  keywords: 'peptides, clinician platform, peptide research, BPC-157, Tirzepatide, peptide protocols',
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
        <Providers>
          <Header />
          <main className="pt-18.25">{children}</main>
          <Footer content={footerContent} />
        </Providers>
      </body>
    </html>
  );
}
