import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
  title: 'How to Get Started | PeptidePure™',
  description:
    'Step-by-step guide for licensed clinicians to join the PeptidePure™ wholesale platform and the Mortensen Medical Research Network observational registry.',
  alternates: { canonical: '/how-to-get-started' },
};

interface Step {
  number: string;
  title: string;
  text: string;
  items: string[];
}

interface Resource {
  title: string;
  description: string;
  href: string;
  label: string;
}

interface Contact {
  name: string;
  role: string;
  email: string;
}

export default async function HowToGetStartedPage() {
  const content = await getContent<any>('how-to-get-started');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />

      <section className="py-16">
        <div className="container-xl max-w-4xl">
          {/* Intro */}
          <p className="text-base leading-relaxed mb-14 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
            {content.intro}
          </p>

          {/* Steps */}
          <div className="space-y-12">
            {content.steps.map((step: Step, i: number) => (
              <div key={i} className="flex gap-6">
                {/* Step number */}
                <div className="shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1.5px solid var(--gold)' }}
                  >
                    {step.number}
                  </div>
                  {i < content.steps.length - 1 && (
                    <div className="w-px mx-auto mt-2" style={{ height: '32px', background: 'var(--border)' }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
                    {step.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                    {step.text}
                  </p>
                  {step.items && (
                    <ul className="space-y-2">
                      {step.items.map((item: string, j: number) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="mt-16 pt-12" style={{ borderTop: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--navy)' }}>
              {content.resources.heading}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {content.resources.items.map((resource: Resource, i: number) => (
                <div
                  key={i}
                  className="rounded-xl p-6"
                  style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-3">
                    <svg className="w-8 h-8" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--navy)' }}>
                    {resource.title}
                  </h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
                    {resource.description}
                  </p>
                  <a
                    href={resource.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--gold)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {resource.label}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Support contacts */}
          <div className="mt-16 pt-12" style={{ borderTop: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
              {content.support.heading}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-mid)' }}>
              {content.support.text}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {content.support.contacts.map((contact: Contact, i: number) => (
                <div
                  key={i}
                  className="rounded-xl p-5"
                  style={{ background: 'white', border: '1px solid var(--border)' }}
                >
                  <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--navy)' }}>
                    {contact.name}
                  </p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-mid)' }}>
                    {contact.role}
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-xs font-semibold underline underline-offset-2"
                    style={{ color: 'var(--gold)' }}
                  >
                    {contact.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-16 rounded-2xl p-10 text-center"
            style={{ background: 'var(--navy)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
              Ready to Begin?
            </p>
            <h2 className="text-2xl font-bold text-white mb-4">
              Apply for Clinician Access
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Create your account and submit your credentials. Most applications are reviewed within 1–2 business days.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/account" className="btn-primary px-8 py-3">
                Create Account
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
