export const CATEGORY_CONFIG: Record<string, { color: string; label?: string; subtitle?: string }> = {
  'Metabolism/Weight Loss':         { color: '#C8952C', label: 'Metabolism/Weight Loss',         subtitle: 'Endocrine System' },
  'MSK/Tissue Repair':              { color: '#2563EB', label: 'MSK/Tissue Repair',              subtitle: 'Musculoskeletal System' },
  'Longevity & Mitochondrial':      { color: '#059669', label: 'Longevity & Mitochondrial',      subtitle: 'Cellular Aging, Neuroprotection, Energy Systems' },
  'Growth Hormone':                 { color: '#7C3AED', label: 'Growth Hormone',                 subtitle: 'Endocrine & Muscular System' },
  'Immune/Antimicrobial':           { color: '#DC2626', label: 'Immune/Antimicrobial',           subtitle: 'Immune & Inflammatory Regulation' },
  'Cognitive & Mood':               { color: '#0891B2', label: 'Cognitive & Mood',               subtitle: 'Neuroendocrine & Neurotransmitter Support' },
  'Aminos & Specialty Blends':      { color: '#6B7280', label: 'Aminos & Specialty Blends',      subtitle: 'Amino Acid Complexes & Custom Blends' },
  'Nootropics':                     { color: '#8B5CF6', label: 'Nootropics',                     subtitle: 'Cognitive Enhancement & Focus' },
  'Anti-aging Aesthetics':          { color: '#EC4899', label: 'Anti-aging Aesthetics',          subtitle: 'Skin Rejuvenation & Beauty' },
  // Legacy names
  'Metabolic / Weight Loss':        { color: '#C8952C', subtitle: 'Endocrine System' },
  'MSK / Tissue Repair':            { color: '#2563EB', subtitle: 'Musculoskeletal System' },
  'Longevity / Mitochondrial':      { color: '#059669', subtitle: 'Cellular Aging, Neuroprotection, Energy Systems' },
  'Growth Hormone / GH Receptor':   { color: '#7C3AED', subtitle: 'Endocrine & Muscular System' },
  'Immune / Antimicrobial':         { color: '#DC2626', subtitle: 'Immune & Inflammatory Regulation' },
};

export const PRODUCTS_PER_PAGE = 12;

export function getBaseProductName(name: string): string {
  return name.replace(/\s+\d+m[cg]g?$/i, '').replace(/\s+\(Lead Time\)$/i, '').trim();
}

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category: string;
  subcategory: string | null;
  price_cents: number;
  image_url: string | null;
  sku: string | null;
  requires_prescription: boolean;
  requires_consultation: boolean;
  metadata: Record<string, any> | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price_cents: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  metadata: {
    strength?: string; amount?: string; form?: string; brand?: string;
    inventory?: string; lead_time_days?: number | null;
    patient_price_cents?: number | null; volume_pricing?: Record<string, number> | null;
    gtin?: string | null; upsell_cents?: number | null; preorder_cents?: number | null;
  } | null;
};
