import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageHero from '@/components/sections/PageHero';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Legality & Compliance | Peptide Pure Research Network',
  description:
    'Transparency about the regulatory landscape for compounded peptides, GLP-1 therapies, and IRB-approved research protocols. Peptide Pure Research Network.',
  alternates: { canonical: '/legality' },
};

type Block =
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'callout'; variant: 'info' | 'warning'; title: string; body: string }
  | { type: 'stat-grid'; items: { label: string; value: string }[] };

type LegalityContent = {
  hero: { sectionLabel: string; heading: string; subtitle: string };
  intro: string[];
  introCallout?: { type: 'info' | 'warning'; title: string; body: string };
  sections: { heading: string; blocks: Block[] }[];
  cta: {
    label: string;
    heading: string;
    subtitle: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  lastUpdated: string;
};

function Callout({ variant, title, body }: { variant: 'info' | 'warning'; title: string; body: string }) {
  const isWarning = variant === 'warning';
  return (
    <div
      className="rounded-lg p-5 my-6"
      style={{
        background: isWarning ? '#FFF0F0' : '#FFF8E7',
        borderLeft: `4px solid ${isWarning ? '#dc2626' : 'var(--gold)'}`,
      }}
    >
      <p className="text-sm font-bold mb-1" style={{ color: isWarning ? '#dc2626' : 'var(--gold)' }}>{title}</p>
      <div className="text-sm leading-relaxed prose-callout" style={{ color: 'var(--text-dark)' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </div>
  );
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div
      className="rounded-lg p-5 my-4"
      style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
    >
      <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(items.length, 3)} gap-3 text-sm`}>
        {items.map((it, i) => (
          <div key={i}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>{it.label}</p>
            <p className="font-bold" style={{ color: 'var(--navy)' }}>{it.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm leading-relaxed prose-bullet" style={{ color: 'var(--text-mid)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <>{children}</> }}>
              {item}
            </ReactMarkdown>
          </span>
        </li>
      ))}
    </ul>
  );
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case 'subheading':
      return <h3 key={key} className="text-lg font-bold mt-8 mb-3" style={{ color: 'var(--navy)' }}>{block.text}</h3>;
    case 'paragraph':
      return (
        <div key={key} className="text-sm leading-relaxed mb-4 prose-callout" style={{ color: 'var(--text-mid)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
        </div>
      );
    case 'bullets':
      return <Bullets key={key} items={block.items} />;
    case 'callout':
      return <Callout key={key} variant={block.variant} title={block.title} body={block.body} />;
    case 'stat-grid':
      return <StatGrid key={key} items={block.items} />;
  }
}

export default async function LegalityPage() {
  const content = await getContent<LegalityContent>('legality');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
      />

      <section className="py-16">
        <div className="container-xl max-w-3xl">
          {content.intro.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>{para}</p>
          ))}

          {content.introCallout && (
            <Callout
              variant={content.introCallout.type}
              title={content.introCallout.title}
              body={content.introCallout.body}
            />
          )}

          {content.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-2xl font-bold mt-14 mb-4" style={{ color: 'var(--navy)' }}>{section.heading}</h2>
              {section.blocks.map((block, j) => renderBlock(block, j))}
            </div>
          ))}

          <div className="mt-14 rounded-2xl p-10 text-center" style={{ background: 'var(--navy)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
              {content.cta.label}
            </p>
            <h2 className="text-2xl font-bold text-white mb-4">{content.cta.heading}</h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {content.cta.subtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href={content.cta.primaryHref} className="btn-primary px-8 py-3">
                {content.cta.primaryLabel}
              </a>
              <Link
                href={content.cta.secondaryHref}
                className="px-8 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                {content.cta.secondaryLabel}
              </Link>
            </div>
          </div>

          <p className="text-xs text-center mt-8" style={{ color: 'var(--text-light)' }}>
            {content.lastUpdated}
          </p>
        </div>
      </section>
    </>
  );
}
