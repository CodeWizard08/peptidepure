/**
 * DiscoverTagsBlock
 *
 * Surfaces a peptide's Meridian-aligned tags:
 *   - GOALS: what patient goals this peptide addresses
 *   - BIOMARKERS: labs that shift on therapy
 *   - WEARABLES: wearable signals that respond
 *
 * This is the user-facing seed of the DISCOVER + TRACK + OPTIMIZE modules.
 * Once the AI protocol engine ships, these same tags drive the matching logic.
 *
 * Renders nothing if all three tag arrays are empty.
 */

import { resolveTags, type TagDef } from '@/lib/peptideTags';

export default function DiscoverTagsBlock({
  baseName,
  meta,
}: {
  baseName: string;
  meta: Record<string, unknown>;
}) {
  const goals = resolveTags('goal', meta.goals as string[] | undefined);
  const biomarkers = resolveTags('biomarker', meta.biomarkers_affected as string[] | undefined);
  const wearables = resolveTags('wearable', meta.wearable_metrics as string[] | undefined);

  if (goals.length === 0 && biomarkers.length === 0 && wearables.length === 0) {
    return null;
  }

  return (
    <section style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)' }}>
      <div className="container-xl py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: 'var(--gold)' }}
            >
              Meridian DISCOVER
            </p>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
              What {baseName} targets
            </h2>
            <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--text-mid)' }}>
              Patient goals, biomarkers, and wearable signals this peptide addresses.
              Powers the future Meridian AI protocol engine.
            </p>
          </div>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start"
            style={{
              background: 'rgba(200,149,44,0.1)',
              color: 'var(--gold)',
              border: '1px solid rgba(200,149,44,0.3)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
            Coming to Meridian
          </span>
        </div>

        {/* Three columns: goals / biomarkers / wearables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {goals.length > 0 && (
            <TagColumn
              label="Patient Goals"
              icon={<IconTarget />}
              tags={goals}
              emptyHint="No goal tags assigned"
            />
          )}
          {biomarkers.length > 0 && (
            <TagColumn
              label="Biomarkers Tracked"
              icon={<IconBeaker />}
              tags={biomarkers}
              emptyHint="No biomarker tags assigned"
            />
          )}
          {wearables.length > 0 && (
            <TagColumn
              label="Wearable Signals"
              icon={<IconActivity />}
              tags={wearables}
              emptyHint="No wearable tags assigned"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function TagColumn({
  label,
  icon,
  tags,
}: {
  label: string;
  icon: React.ReactNode;
  tags: TagDef[];
  emptyHint: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: 'var(--navy)' }}>{icon}</span>
        <h3
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: 'var(--navy)' }}
        >
          {label}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.slug}
            title={tag.description}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-transform hover:scale-105 cursor-default"
            style={{
              background: `${tag.color}10`,
              color: tag.color,
              border: `1px solid ${tag.color}30`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tag.color }} />
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function IconTarget() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
function IconBeaker() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6.17a2 2 0 0 1-.59 1.42L4.6 14.4a2 2 0 0 0-.6 1.42V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.18a2 2 0 0 0-.59-1.41l-3.82-3.82A2 2 0 0 1 15 9.17V3M9 3h6M8 14h8" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
