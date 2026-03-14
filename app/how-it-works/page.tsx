import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getContent } from '@/lib/content';
import { createClient } from '@/lib/supabase/server';
import PageHero from '@/components/sections/PageHero';
import IntroVideo from '@/components/how-it-works/IntroVideo';
import EducationalFocus from '@/components/how-it-works/EducationalFocus';
import SolutionSection from '@/components/how-it-works/SolutionSection';
import StepsSection from '@/components/how-it-works/StepsSection';
import PeptideFuture from '@/components/how-it-works/PeptideFuture';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how PeptidePure™ works for clinicians: verify credentials, browse peptide protocols, and order with confidence. Simple 3-step process.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works — PeptidePure™',
    description:
      'Simple 3-step process: verify credentials, browse protocols, and order with confidence.',
  },
};

export default async function HowItWorksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account');

  const content = await getContent<any>('how-it-works');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />
      <IntroVideo content={content} />
      <EducationalFocus content={content} />
      <SolutionSection content={content} />
      <StepsSection content={content} />
      <PeptideFuture content={content} />
    </>
  );
}
