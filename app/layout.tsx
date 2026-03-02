import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'PeptidePure™ — Clinician Peptide Platform',
  description:
    'PeptidePure™ gives licensed clinicians a smarter, cleaner path to peptide medicine. USA cGMP-compliant, >99% purity, fast shipping.',
  keywords: 'peptides, clinician platform, peptide research, BPC-157, Tirzepatide, peptide protocols',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerContent = getContent<any>('footer');

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main className="pt-16">{children}</main>
        <Footer content={footerContent} />
      </body>
    </html>
  );
}
