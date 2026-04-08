/**
 * AI Protocol Builder Stub
 *
 * Placeholder for the future Meridian DISCOVER protocol engine. Even before
 * the AI engine ships, this card communicates the vision: bloodwork +
 * goals + biomarkers → personalized protocol.
 *
 * Functionality is intentionally aspirational — clicking the goal chips
 * scrolls to the catalog filtered to that goal (via URL hash). When the
 * AI engine ships, the same UI hooks into Meridian without redesigning.
 */

import Link from 'next/link';
import { ALL_GOALS } from '@/lib/peptideTags';

// Top 6 goals for the visible chips (others accessible via "See all goals")
const FEATURED_GOAL_SLUGS = [
  'weight-loss',
  'longevity',
  'recovery',
  'cognition',
  'libido',
  'lean-mass',
];

export default function AIProtocolBuilderStub() {
  const featuredGoals = ALL_GOALS.filter((g) => FEATURED_GOAL_SLUGS.includes(g.slug));

  return (
    <section
      className="rounded-3xl overflow-hidden mb-10"
      style={{
        background:
          'linear-gradient(135deg, var(--navy) 0%, #11305c 50%, #0f2a52 100%)',
        border: '1px solid rgba(200,149,44,0.25)',
      }}
    >
      {/* Decorative grid */}
      <div className="relative">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left — pitch */}
          <div className="lg:col-span-3 p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(200,149,44,0.15)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(200,149,44,0.35)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
                Coming to Meridian
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                AI Protocol Engine
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-3">
              Build a personalized protocol from your patient&rsquo;s labs &amp; goals
            </h2>
            <p className="text-sm text-white/65 leading-relaxed mb-6 max-w-xl">
              Upload bloodwork, select goals, and Meridian&rsquo;s AI engine will recommend
              evidence-based peptide protocols matched to your patient&rsquo;s biomarkers and
              wearable data. Closed-loop optimization across the entire ecosystem.
            </p>

            {/* Quick goal chips → filter the catalog below */}
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--gold)' }}
            >
              Browse by patient goal
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {featuredGoals.map((goal) => (
                <Link
                  key={goal.slug}
                  href={`#goal-${goal.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    background: `${goal.color}20`,
                    color: '#fff',
                    border: `1px solid ${goal.color}55`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: goal.color }} />
                  {goal.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact?topic=meridian-waitlist"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-lg"
                style={{
                  background: 'var(--gold)',
                  color: 'var(--navy)',
                }}
              >
                Join the Meridian Waitlist
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6 21 12m0 0-7.5 6M21 12H3" />
                </svg>
              </Link>
              <span className="text-[11px] text-white/45">
                Free for verified clinicians at launch
              </span>
            </div>
          </div>

          {/* Right — feature stack */}
          <div
            className="lg:col-span-2 p-8 lg:p-10 lg:pl-6"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: 'var(--gold)' }}
            >
              The closed loop
            </p>
            <div className="space-y-3">
              <FeatureRow icon={<IconLab />}     label="DISCOVER"  desc="Match labs &amp; goals to peptides" />
              <FeatureRow icon={<IconShop />}     label="SOURCE"    desc="503A/503B clinic-tier sourcing" />
              <FeatureRow icon={<IconChart />}    label="TRACK"     desc="Biomarker &amp; wearable dashboards" />
              <FeatureRow icon={<IconRecycle />}  label="OPTIMIZE"  desc="AI-tuned protocol adjustments" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{
          background: 'rgba(200,149,44,0.1)',
          border: '1px solid rgba(200,149,44,0.25)',
          color: 'var(--gold)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="text-[11px] text-white/55 leading-snug" dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
    </div>
  );
}

function IconLab() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6.17a2 2 0 0 1-.59 1.42L4.6 14.4a2 2 0 0 0-.6 1.42V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.18a2 2 0 0 0-.59-1.41l-3.82-3.82A2 2 0 0 1 15 9.17V3M9 3h6M8 14h8" />
    </svg>
  );
}
function IconShop() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l4-4 4 4 5-5" />
    </svg>
  );
}
function IconRecycle() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.582 9a8 8 0 0 1 14.95 1.543M19.418 15a8 8 0 0 1-14.95-1.543" />
    </svg>
  );
}
