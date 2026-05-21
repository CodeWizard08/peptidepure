// Shared types for the pep-pedia-style structured protocol metadata.
// The DB stores this as a single `protocol_meta` jsonb column on `protocols`.

export type HeroStat = {
  value: string;        // e.g. "2.5-15mg weekly"
  detail?: string;      // e.g. "Once weekly"
};

export type QuickStartItem = {
  label: string;        // e.g. "Typical Dose"
  value: string;        // e.g. "Start 2.5mg weekly, escalate every 4 weeks"
};

export type MolecularInfo = {
  weight?: string;      // e.g. "4,813.55 Da"
  length?: string;      // e.g. "39 amino acids"
  type?: string;        // e.g. "Dual GLP-1/GIP agonist"
  sequence?: string;    // amino acid sequence string
  footnote?: string;    // e.g. "C20 fatty diacid conjugation for once-weekly dosing"
};

export type Pharmacokinetics = {
  peak?: string;        // e.g. "1 day"
  half_life?: string;   // e.g. "5 days"
  cleared?: string;     // e.g. "~25 days"
  peak_day?: number;    // numeric — used to render the curve
  half_life_days?: number;
  total_days?: number;  // chart x-axis end, e.g. 30
  source_label?: string; // e.g. "FDA Mounjaro Label"
};

export type IndicationGroup = {
  name: string;                  // e.g. "Weight Loss"
  effectiveness?: 'MOST EFFECTIVE' | 'EFFECTIVE' | 'EMERGING' | 'MIXED';
  items: Array<{ title: string; detail: string }>;
};

export type DosingRow = {
  goal: string;
  dose: string;
  frequency: string;
  route: string;
};

export type InteractionClassification = 'AVOID' | 'MONITOR' | 'SYNERGISTIC' | 'COMPATIBLE';

export type Interaction = {
  peptide: string;
  classification: InteractionClassification;
  note?: string;
};

export type ReconstitutionStep = {
  step: number;
  description: string;
};

export type QualityIndicator = {
  type: 'pass' | 'warn' | 'fail';
  title: string;
  description: string;
};

export type SideEffectGroup = {
  side_effects: string[];   // bullet items
  when_to_stop: string[];   // bullet items — symptoms requiring discontinuation
};

export type ResearchReference = {
  title: string;          // e.g. "SURMOUNT-2 T2DM Trial (2023)"
  tags?: string[];        // e.g. ["938 adults with T2DM and obesity", "72-week duration"]
  summary: string;        // 1-2 sentence finding
};

export type ProtocolMeta = {
  typical_dose?: HeroStat;
  route?: HeroStat;
  cycle?: HeroStat;
  storage?: HeroStat;

  key_benefits?: string;     // 1-2 sentence summary for the side card
  mechanism_short?: string;  // 1-2 sentence mechanism summary

  quick_start?: QuickStartItem[];
  molecular?: MolecularInfo;
  pharmacokinetics?: Pharmacokinetics;
  indications?: IndicationGroup[];
  dosing_table?: DosingRow[];
  dosing_timing_note?: string;
  interactions?: Interaction[];
  reconstitution?: ReconstitutionStep[];
  reconstitution_warning?: string;  // top-of-section important note
  quality_indicators?: QualityIndicator[];
  what_to_expect?: string[];
  side_effects?: SideEffectGroup;
  references?: ResearchReference[];
};

/**
 * Page-boundary guard for the jsonb column. The DB has no schema-level type
 * enforcement on the JSON shape, so a hand-edit or future migration could
 * leave a non-object value (null / array / string) in the column. Renderers
 * already guard their own field-level access; this just ensures the top-level
 * shape is a plain object before it flows downstream.
 */
export function normalizeProtocolMeta(raw: unknown): ProtocolMeta {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as ProtocolMeta;
}
