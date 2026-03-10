import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clinical Forms — PeptidePure™',
  description: 'IRB clinical documentation forms for peptide protocols: baseline assessment, treatment log, and adverse event reporting.',
};

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
