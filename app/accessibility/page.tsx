import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    'PeptidePure™ is committed to digital accessibility. Learn about our efforts to ensure our platform is usable by all clinicians, including those with disabilities.',
  alternates: { canonical: '/accessibility' },
};

interface PolicySection {
  title: string;
  text?: string;
  items?: string[];
  extra?: string;
}

export default async function AccessibilityPage() {
  const content = await getContent<any>('accessibility');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />

      <section className="py-16">
        <div className="container-xl max-w-3xl">
          {/* Intro */}
          <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-mid)' }}>
            {content.intro}
          </p>

          {/* Sections */}
          <div className="space-y-10">
            {content.sections.map((section: PolicySection, i: number) => (
              <div key={i}>
                <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--navy)' }}>
                  {section.title}
                </h2>
                {section.text && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-mid)' }}>
                    {section.text}
                  </p>
                )}
                {section.items && (
                  <ul className="space-y-2 ml-1">
                    {section.items.map((item: string, j: number) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.extra && (
                  <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-mid)' }}>
                    {section.extra}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
