import type { Metadata } from 'next';
import HeroSlider from '@/components/HeroSlider';

export const metadata: Metadata = {
  title: 'Clinician-Only Peptide Sourcing Platform',
  description:
    'PeptidePure™ gives licensed clinicians a smarter, cleaner path to peptide medicine. USA cGMP-compliant, >99% purity, third-party COAs, fast shipping.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'PeptidePure™ — Clinician-Only Peptide Sourcing Platform',
    description:
      'USA cGMP-compliant peptides with >99% purity. Built exclusively for licensed clinicians.',
    type: 'website',
  },
};
import MarqueeTrustBar from '@/components/home/MarqueeTrustBar';
import StatsSection from '@/components/home/StatsSection';
import ThreeStepProcess from '@/components/home/ThreeStepProcess';
import USAResearchSection from '@/components/home/USAResearchSection';
import WhyDifferentSection from '@/components/home/WhyDifferentSection';
import FreeShippingSection from '@/components/home/FreeShippingSection';
import FinalCTA from '@/components/home/FinalCTA';
import { getContent } from '@/lib/content';

export default async function HomePage() {
  const content = await getContent<any>('home');
  const heroContent = await getContent<any>('hero-slider');

  return (
    <>
      <HeroSlider content={heroContent} />
      <MarqueeTrustBar items={content.trustBar} />
      {/* <StatsSection content={content.stats} /> */}
      <ThreeStepProcess content={content.threeSteps} />
      <USAResearchSection content={content.usaResearch} />
      <WhyDifferentSection content={content.whyDifferent} />
      <FreeShippingSection content={content.freeShipping} />
      <FinalCTA content={content.finalCta} />

      {/* Compliance Notice */}
      <section className="py-10" style={{ background: 'var(--gold-pale)', borderTop: '1px solid rgba(200,149,44,0.2)' }}>
        <div className="container-xl">
          <h3 className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            {content.complianceNotice.heading}
          </h3>
          <p className="text-xs text-center max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            {content.complianceNotice.text}
          </p>
        </div>
      </section>
    </>
  );
}
