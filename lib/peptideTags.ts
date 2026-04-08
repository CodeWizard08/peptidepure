/**
 * Canonical tag taxonomy for the PeptidePure / Meridian ecosystem.
 *
 * Three orthogonal tag axes drive the future DISCOVER protocol engine:
 *
 *   1. GOALS         — what the patient wants to achieve
 *   2. BIOMARKERS    — what blood/lab values shift on therapy
 *   3. WEARABLES     — what wearable signals respond to the peptide
 *
 * Each peptide's metadata.goals[] / biomarkers_affected[] / wearable_metrics[]
 * stores the slug values from these maps. UI components look up the slug to
 * get the display label and color.
 *
 * Adding a new tag: just add an entry here, no DB migration required.
 */

export type TagAxis = 'goal' | 'biomarker' | 'wearable';

export type TagDef = {
  slug: string;
  label: string;
  description: string;
  color: string;
};

// ── GOAL tags ──
// What the patient is trying to achieve. Used for "Recommended for…" matching.
export const GOAL_TAGS: Record<string, TagDef> = {
  'weight-loss': {
    slug: 'weight-loss',
    label: 'Weight Loss',
    description: 'Reducing body fat and improving body composition.',
    color: '#C8952C',
  },
  longevity: {
    slug: 'longevity',
    label: 'Longevity',
    description: 'Extending healthspan and slowing biological aging.',
    color: '#059669',
  },
  recovery: {
    slug: 'recovery',
    label: 'Recovery',
    description: 'Tissue repair, exercise recovery, and post-injury healing.',
    color: '#2563EB',
  },
  cognition: {
    slug: 'cognition',
    label: 'Cognition',
    description: 'Focus, memory, mental clarity, and neuroplasticity.',
    color: '#0891B2',
  },
  mood: {
    slug: 'mood',
    label: 'Mood',
    description: 'Anxiety reduction, mood support, and emotional resilience.',
    color: '#7C3AED',
  },
  libido: {
    slug: 'libido',
    label: 'Libido',
    description: 'Sexual response, drive, and intimacy.',
    color: '#DC2626',
  },
  'lean-mass': {
    slug: 'lean-mass',
    label: 'Lean Mass',
    description: 'Muscle growth, hypertrophy, and strength.',
    color: '#7C3AED',
  },
  'sleep-quality': {
    slug: 'sleep-quality',
    label: 'Sleep Quality',
    description: 'Sleep architecture, deep sleep, and circadian rhythm.',
    color: '#1E40AF',
  },
  'gut-health': {
    slug: 'gut-health',
    label: 'Gut Health',
    description: 'Intestinal barrier integrity and gut inflammation.',
    color: '#16A34A',
  },
  immunity: {
    slug: 'immunity',
    label: 'Immunity',
    description: 'Immune modulation and antimicrobial defense.',
    color: '#DC2626',
  },
  aesthetics: {
    slug: 'aesthetics',
    label: 'Aesthetics',
    description: 'Skin, hair, and visible signs of aging.',
    color: '#EC4899',
  },
  'mitochondrial-health': {
    slug: 'mitochondrial-health',
    label: 'Mitochondrial Health',
    description: 'Cellular energy production and metabolic efficiency.',
    color: '#059669',
  },
};

// ── BIOMARKER tags ──
// Lab values that respond (positively or negatively) to therapy.
// Maps to Meridian's TRACK module for biomarker dashboards.
export const BIOMARKER_TAGS: Record<string, TagDef> = {
  'hs-crp': {
    slug: 'hs-crp',
    label: 'hs-CRP',
    description: 'High-sensitivity C-reactive protein — systemic inflammation.',
    color: '#DC2626',
  },
  'igf-1': {
    slug: 'igf-1',
    label: 'IGF-1',
    description: 'Insulin-like growth factor 1 — GH-axis activity.',
    color: '#7C3AED',
  },
  hba1c: {
    slug: 'hba1c',
    label: 'HbA1c',
    description: 'Glycated hemoglobin — 3-month average glucose.',
    color: '#C8952C',
  },
  'fasting-insulin': {
    slug: 'fasting-insulin',
    label: 'Fasting Insulin',
    description: 'Insulin resistance and metabolic health.',
    color: '#C8952C',
  },
  testosterone: {
    slug: 'testosterone',
    label: 'Testosterone',
    description: 'Total and free testosterone — androgenic activity.',
    color: '#1E40AF',
  },
  cortisol: {
    slug: 'cortisol',
    label: 'Cortisol',
    description: 'Adrenal output and stress response.',
    color: '#DC2626',
  },
  'lipid-panel': {
    slug: 'lipid-panel',
    label: 'Lipid Panel',
    description: 'Cholesterol, triglycerides, ApoB.',
    color: '#C8952C',
  },
  'liver-enzymes': {
    slug: 'liver-enzymes',
    label: 'Liver Enzymes',
    description: 'ALT, AST, GGT — hepatic health.',
    color: '#16A34A',
  },
  'body-composition': {
    slug: 'body-composition',
    label: 'Body Composition',
    description: 'DEXA or BIA — fat mass, lean mass, visceral fat.',
    color: '#0891B2',
  },
  glutathione: {
    slug: 'glutathione',
    label: 'Glutathione',
    description: 'Master antioxidant and redox status.',
    color: '#059669',
  },
  homocysteine: {
    slug: 'homocysteine',
    label: 'Homocysteine',
    description: 'Methylation status and cardiovascular risk.',
    color: '#DC2626',
  },
};

// ── WEARABLE tags ──
// Wearable signals that should shift in response to therapy.
// Maps to Meridian's TRACK + OPTIMIZE modules.
export const WEARABLE_TAGS: Record<string, TagDef> = {
  hrv: {
    slug: 'hrv',
    label: 'HRV',
    description: 'Heart rate variability — autonomic balance and recovery.',
    color: '#059669',
  },
  'deep-sleep': {
    slug: 'deep-sleep',
    label: 'Deep Sleep',
    description: 'Slow-wave sleep duration.',
    color: '#1E40AF',
  },
  'rem-sleep': {
    slug: 'rem-sleep',
    label: 'REM Sleep',
    description: 'REM sleep duration and architecture.',
    color: '#7C3AED',
  },
  'resting-hr': {
    slug: 'resting-hr',
    label: 'Resting HR',
    description: 'Resting heart rate — cardiovascular fitness.',
    color: '#DC2626',
  },
  'recovery-score': {
    slug: 'recovery-score',
    label: 'Recovery Score',
    description: 'Composite recovery score (Whoop, Oura, Garmin).',
    color: '#2563EB',
  },
  steps: {
    slug: 'steps',
    label: 'Steps / Activity',
    description: 'Daily step count and activity volume.',
    color: '#16A34A',
  },
  'glucose-cgm': {
    slug: 'glucose-cgm',
    label: 'CGM Glucose',
    description: 'Continuous glucose monitor — postprandial response.',
    color: '#C8952C',
  },
};

/**
 * Look up a tag definition by axis and slug.
 * Returns null if the slug doesn't exist (e.g. legacy data).
 */
export function getTag(axis: TagAxis, slug: string): TagDef | null {
  const map =
    axis === 'goal' ? GOAL_TAGS : axis === 'biomarker' ? BIOMARKER_TAGS : WEARABLE_TAGS;
  return map[slug] ?? null;
}

/**
 * Resolve an array of slugs to their full definitions, dropping any unknown
 * slugs silently.
 */
export function resolveTags(axis: TagAxis, slugs: string[] | undefined | null): TagDef[] {
  if (!Array.isArray(slugs)) return [];
  return slugs.map((s) => getTag(axis, s)).filter((t): t is TagDef => t !== null);
}

/**
 * All goal slugs as a flat array — used for filter chips on /peptides.
 */
export const ALL_GOALS: TagDef[] = Object.values(GOAL_TAGS);
