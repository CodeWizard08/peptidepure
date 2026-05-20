/**
 * Batch-draft ~100 clinical protocols via Claude and insert them as
 * `status='draft'` rows so Scott can review/edit/publish from /admin → Protocols.
 *
 * One-shot script. Idempotent — skips any protocol slug that already exists.
 *
 * Usage:
 *   1. Ensure .env.local has ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, and
 *      SUPABASE_SERVICE_ROLE_KEY set.
 *   2. From the project root: npx tsx scripts/batch-draft-protocols.ts
 *
 * Cost: ~$15-25 in Claude tokens total. First call writes the system prompt
 * cache; calls 2-100 read the cache (~90% input cost reduction).
 *
 * The script paces itself (1.2s between requests) to stay well under
 * organization-tier rate limits and let prompt caching work.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'path';

// Load .env.local manually since this isn't a Next.js process
loadEnv({ path: path.join(process.cwd(), '.env.local') });

// ─── Topic list ──────────────────────────────────────────────────────────────
type Topic = {
  title: string;
  slug: string;
  category: string;
  peptides: string[];
  summary?: string;
};

// 100 topics — single-peptide, stack/combo, and use-case framings.
// Slug must be lowercase alphanumeric + hyphens (validated by the API).
const TOPICS: Topic[] = [
  // ── Single-peptide protocols (1–30) ─────────────────────────────────────
  { title: 'BPC-157 Gastrointestinal Healing Protocol', slug: 'bpc-157-gi-healing', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg'], summary: 'Oral and injectable BPC-157 protocols for gut lining repair, IBD adjunct, and post-NSAID gastric injury.' },
  { title: 'BPC-157 Tendon & Ligament Repair Protocol', slug: 'bpc-157-tendon-ligament', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg'], summary: 'Localized BPC-157 injection protocol for tendinopathy, ligament sprains, and post-surgical tendon reconstruction.' },
  { title: 'TB-500 Tissue Repair Protocol', slug: 'tb500-tissue-repair', category: 'MSK/Tissue Repair', peptides: ['TB4 (TB-500) 10mg'], summary: 'Thymosin Beta-4 systemic protocol for chronic soft-tissue injury and post-surgical regeneration.' },
  { title: 'GHK-Cu Anti-Aging & Skin Regeneration Protocol', slug: 'ghk-cu-anti-aging-skin', category: 'Longevity & Mitochondrial', peptides: ['GHK-Cu 50mg', 'GHK-Cu 100mg'], summary: 'Copper peptide systemic and topical protocols for collagen synthesis, photoaging, and scalp/skin rejuvenation.' },
  { title: 'Sema Weight Management Protocol', slug: 'sema-weight-management', category: 'Metabolism/Weight Loss', peptides: ['Sema 15mg', 'Sema 30mg'], summary: 'GLP-1 agonist titration, monitoring, and discontinuation strategy for clinically significant weight loss.' },
  { title: 'Tirz Metabolic Optimization Protocol', slug: 'tirz-metabolic-optimization', category: 'Metabolism/Weight Loss', peptides: ['Tirz 10mg', 'Tirz 15mg', 'Tirz 30mg'], summary: 'Dual GLP-1/GIP agonist protocol for type 2 diabetes co-management and body composition.' },
  { title: 'Reta Advanced Weight Loss Protocol', slug: 'reta-advanced-weight-loss', category: 'Metabolism/Weight Loss', peptides: ['Reta 10mg', 'Reta 15mg', 'Reta 30mg'], summary: 'Triple GLP-1/GIP/glucagon agonist for higher-magnitude weight loss in obesity Class II/III.' },
  { title: 'MOTS-c Mitochondrial Function Protocol', slug: 'mots-c-mitochondrial', category: 'Longevity & Mitochondrial', peptides: ['MOTS-c 10mg', 'MOTS-c 40mg'], summary: 'Mitochondrial-derived peptide for insulin sensitization, exercise capacity, and metabolic flexibility.' },
  { title: 'NAD+ Cellular Energy Restoration Protocol', slug: 'nad-cellular-energy', category: 'Longevity & Mitochondrial', peptides: ['NAD+ 1000mg', 'NAD+ 500mg'], summary: 'IV and SC NAD+ loading protocols for cellular energy, neuroprotection, and addiction recovery adjunct.' },
  { title: 'Epithalon Telomere & Sleep Optimization Protocol', slug: 'epithalon-telomere-sleep', category: 'Longevity & Mitochondrial', peptides: ['Epithalon 10mg', 'Epithalon 50mg'], summary: 'Pineal-targeting peptide for sleep architecture and telomerase activation in longevity-focused clinics.' },
  { title: 'Cerebrolysin Cognitive Enhancement Protocol', slug: 'cerebrolysin-cognitive', category: 'Cognitive & Mood', peptides: ['Cerebrolysin 60mg'], summary: 'Neurotrophic peptide cocktail for stroke recovery, mild cognitive impairment, and traumatic brain injury.' },
  { title: 'Selank Anxiolytic & Cognitive Protocol', slug: 'selank-anxiolytic-cognitive', category: 'Cognitive & Mood', peptides: ['Selank 10mg', 'NA-Selank Amidate 30mg'], summary: 'Synthetic tuftsin analog for generalized anxiety, attention, and working memory.' },
  { title: 'Semax Cognitive Performance Protocol', slug: 'semax-cognitive-performance', category: 'Cognitive & Mood', peptides: ['Semax 10mg'], summary: 'ACTH-derived nootropic peptide for executive function, focus, and ischemic neuroprotection.' },
  { title: 'CJC-1295/Ipamorelin Growth Hormone Protocol', slug: 'cjc1295-ipamorelin-gh', category: 'Growth Hormone', peptides: ['CJC-1295/Ipamorelin 10mg', 'CJC-1295/Ipamorelin 20mg'], summary: 'Combined GHRH/GHRP secretagogue protocol for endogenous GH pulse restoration.' },
  { title: 'PT-141 Sexual Function Protocol', slug: 'pt-141-sexual-function', category: 'Cognitive & Mood', peptides: ['PT-141 10mg'], summary: 'Melanocortin agonist for hypoactive sexual desire disorder in men and women.' },
  { title: 'Melanotan II Pigmentation & Libido Protocol', slug: 'mt-ii-pigmentation-libido', category: 'Cognitive & Mood', peptides: ['Melanotan-II 10mg'], summary: 'MC1R/MC4R agonist for photoprotection and adjunct libido support.' },
  { title: 'Glutathione Antioxidant Support Protocol', slug: 'glutathione-antioxidant', category: 'Longevity & Mitochondrial', peptides: ['Glutathione 1500mg'], summary: 'Master antioxidant protocol for oxidative stress, heavy metal chelation adjunct, and hepatic support.' },
  { title: 'SS-31 Cardiac & Mitochondrial Support Protocol', slug: 'ss-31-cardiac-mitochondrial', category: 'Longevity & Mitochondrial', peptides: ['SS-31 10mg', 'SS-31 50mg'], summary: 'Elamipretide cardiolipin-targeting peptide for heart failure adjunct and mitochondrial dysfunction.' },
  { title: 'LL-37 Antimicrobial Protocol', slug: 'll-37-antimicrobial', category: 'Immune/Antimicrobial', peptides: ['LL-37 5mg'], summary: 'Host defense peptide for biofilm-related chronic infection adjunct and immune modulation.' },
  { title: 'Thymosin Alpha-1 Immune Support Protocol', slug: 'thymosin-alpha-1-immune', category: 'Immune/Antimicrobial', peptides: ['Thymosin Alpha-1 10mg'], summary: 'T-cell maturation protocol for chronic viral infection, sepsis adjunct, and immunosenescence.' },
  { title: 'KPV Anti-inflammatory Protocol', slug: 'kpv-anti-inflammatory', category: 'Immune/Antimicrobial', peptides: ['KPV 10mg', 'oral KPV 500mcg'], summary: 'Alpha-MSH fragment for gut inflammation, mast cell activation, and dermatologic inflammation.' },
  { title: 'AOD-9604 Fat Loss Protocol', slug: 'aod-9604-fat-loss', category: 'Metabolism/Weight Loss', peptides: ['AOD-9604 2mg', 'AOD-9604 5mg'], summary: 'GH fragment for lipolysis without GH-related adverse effects, suitable for metabolic-only goals.' },
  { title: '5-Amino-1MQ NNMT Inhibitor Protocol', slug: '5-amino-1mq-nnmt', category: 'Longevity & Mitochondrial', peptides: ['5-Amino-1MQ 5mg', '5-Amino-1MQ 50mg', 'oral 5-Amino-1MQ'], summary: 'NNMT inhibition for adipose NAD+ preservation, fat mass reduction, and muscle differentiation.' },
  { title: 'Pinealon Brain Health Protocol', slug: 'pinealon-brain-health', category: 'Longevity & Mitochondrial', peptides: ['Pinealon 10mg', 'Pinealon 20mg'], summary: 'Pineal bioregulator for sleep, mood, and cognitive aging support.' },
  { title: 'DSIP Sleep Quality Protocol', slug: 'dsip-sleep-quality', category: 'Cognitive & Mood', peptides: ['DSIP 10mg'], summary: 'Delta-sleep inducing peptide for fragmented sleep, chronic insomnia, and circadian dysregulation.' },
  { title: 'FOXO4-DRI Senolytic Protocol', slug: 'foxo4-dri-senolytic', category: 'Longevity & Mitochondrial', peptides: ['FOX04-DRI 5mg', 'FOX04-DRI 10mg'], summary: 'Selective senescent cell clearance peptide — experimental anti-aging protocol with appropriate caveats.' },
  { title: 'Follistatin Muscle Growth Protocol', slug: 'follistatin-muscle-growth', category: 'Growth Hormone', peptides: ['Follistatin 1mg', 'Follistatin 315 1mg', 'Follistatin 344 1mg'], summary: 'Myostatin inhibitor for sarcopenia, muscular dystrophy adjunct, and lean mass support.' },
  { title: 'IGF-1 LR3 Anabolic Protocol', slug: 'igf-1-lr3-anabolic', category: 'Growth Hormone', peptides: ['IGF-1 LR3 1mg'], summary: 'Long-acting IGF-1 analog for localized hypertrophy, recovery, and growth-mediated tissue repair.' },
  { title: 'Tesamorelin Visceral Fat Protocol', slug: 'tesamorelin-visceral-fat', category: 'Growth Hormone', peptides: ['Tesamorelin 5mg', 'Tesamorelin 10mg'], summary: 'GHRH analog for HIV-associated lipodystrophy and visceral adiposity in metabolic syndrome.' },
  { title: 'Oxytocin Bonding & Mood Protocol', slug: 'oxytocin-bonding-mood', category: 'Cognitive & Mood', peptides: ['Oxytocin 5mg'], summary: 'Intranasal oxytocin for relational bonding, social anxiety adjunct, and trauma-informed care.' },

  // ── Stack / combination protocols (31–70) ───────────────────────────────
  { title: 'BPC-157 + TB-500 Soft Tissue Repair Stack', slug: 'bpc-tb500-soft-tissue-stack', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'TB4 (TB-500) 10mg', 'BPC-157/TB500 20mg'], summary: 'The most-prescribed combination protocol for chronic soft-tissue injury, surgical recovery, and overuse syndromes.' },
  { title: 'GLOW Stack (BPC-157 + GHK-Cu + TB-500) Protocol', slug: 'glow-stack-bpc-ghk-tb', category: 'MSK/Tissue Repair', peptides: ['GLOW 70mg'], summary: 'Premixed regenerative formulation for aesthetic and tissue-regeneration practice — skin, scalp, surgical scarring.' },
  { title: 'KLOW Stack (TB-500 + BPC-157 + GHK-Cu + KPV) Protocol', slug: 'klow-stack-quad-blend', category: 'MSK/Tissue Repair', peptides: ['KLOW 80mg'], summary: 'Quad-peptide stack adding anti-inflammatory KPV to GLOW for refractory tissue injury and chronic inflammation.' },
  { title: 'Tirz vs Reta Head-to-Head Weight Loss Comparison', slug: 'tirz-vs-reta-comparison', category: 'Metabolism/Weight Loss', peptides: ['Tirz 15mg', 'Reta 15mg'], summary: 'Comparative protocol framing for clinics choosing between dual and triple GLP-1 agonist therapy.' },
  { title: 'Sema + Cagrilintide Synergy Stack', slug: 'sema-cagrilintide-synergy', category: 'Metabolism/Weight Loss', peptides: ['Sema 15mg', 'Cagrilintide 5mg', 'Cagrilintide 10mg'], summary: 'GLP-1 + amylin co-agonist stack for plateau-busting in semaglutide-responsive patients.' },
  { title: 'CJC-1295 + Ipamorelin + Tesamorelin GH Stack', slug: 'cjc-ipa-tesa-gh-stack', category: 'Growth Hormone', peptides: ['CJC-1295/Ipamorelin 10mg', 'Ipamorelin 10mg', 'Tesamorelin 10mg'], summary: 'Triple-agent GH secretagogue stack for advanced lean-mass and recovery protocols.' },
  { title: 'NAD+ + MOTS-c + SS-31 Mitochondrial Triple Stack', slug: 'nad-motsc-ss31-mito-stack', category: 'Longevity & Mitochondrial', peptides: ['NAD+ 1000mg', 'MOTS-c 10mg', 'SS-31 10mg'], summary: 'Three-vector mitochondrial support combining NAD+ precursor pool, retrograde signaling, and cardiolipin protection.' },
  { title: 'GHK-Cu + SNAP-8 Aesthetic Topical Stack', slug: 'ghk-snap8-aesthetic-stack', category: 'Longevity & Mitochondrial', peptides: ['GHK-Cu 50mg', 'SNAP-8'], summary: 'Copper peptide + neurotransmitter-modulating peptide stack as needle-free Botox alternative.' },
  { title: 'PT-141 + Oxytocin + MT-II Libido Stack', slug: 'pt141-oxy-mtii-libido-stack', category: 'Cognitive & Mood', peptides: ['PT-141 10mg', 'Oxytocin 5mg', 'Melanotan-II 10mg'], summary: 'Multi-mechanism libido and sexual response support combining central and peripheral pathways.' },
  { title: 'Selank + Semax + DSIP Neuro Stack', slug: 'selank-semax-dsip-neuro-stack', category: 'Cognitive & Mood', peptides: ['Selank 10mg', 'Semax 10mg', 'DSIP 10mg'], summary: 'Neuroplasticity and circadian optimization combining nootropic, anxiolytic, and sleep-architecture peptides.' },
  { title: 'Epithalon + Pinealon Pineal Longevity Stack', slug: 'epithalon-pinealon-stack', category: 'Longevity & Mitochondrial', peptides: ['Epithalon 10mg', 'Epithalon 50mg', 'Pinealon 10mg'], summary: 'Bioregulator stack targeting pineal function for telomerase activation and sleep restoration.' },
  { title: 'Oral BPC-157 + Glutamine Gut Repair Stack', slug: 'oral-bpc-glutamine-gut', category: 'MSK/Tissue Repair', peptides: ['oral BPC-157 500mcg', 'BPC-157 10mg'], summary: 'Oral peptide gut repair protocol for IBD, leaky gut adjunct, and post-antibiotic dysbiosis.' },
  { title: 'Hexarelin + GHRP-2 Growth Hormone Pulse Stack', slug: 'hexarelin-ghrp2-gh-pulse', category: 'Growth Hormone', peptides: ['Hexarelin 5mg', 'GHRP-2 5mg', 'GHRP-2 10mg'], summary: 'Multiple GHRP comparison protocol for clinics optimizing endogenous GH pulse amplitude.' },
  { title: 'LL-37 + Thymosin Alpha-1 Antimicrobial Stack', slug: 'll37-ta1-antimicrobial-stack', category: 'Immune/Antimicrobial', peptides: ['LL-37 5mg', 'Thymosin Alpha-1 10mg'], summary: 'Innate + adaptive immune support for chronic infection, biofilm disease, and immune dysregulation.' },
  { title: 'BPC-157 + KPV Inflammatory Bowel Stack', slug: 'bpc-kpv-ibd-stack', category: 'Immune/Antimicrobial', peptides: ['BPC-157 10mg', 'oral BPC-157 500mcg', 'KPV 10mg', 'oral KPV 500mcg'], summary: 'Two-mechanism IBD adjunct protocol — mucosal repair and inflammatory suppression.' },
  { title: 'MOTS-c + AOD-9604 Body Composition Stack', slug: 'motsc-aod-body-comp-stack', category: 'Metabolism/Weight Loss', peptides: ['MOTS-c 10mg', 'MOTS-c 40mg', 'AOD-9604 2mg'], summary: 'Mitochondrial enhancement + targeted lipolysis for body recomposition in metabolically healthy patients.' },
  { title: 'Cerebrolysin + Selank Stroke Recovery Stack', slug: 'cerebrolysin-selank-stroke', category: 'Cognitive & Mood', peptides: ['Cerebrolysin 60mg', 'Selank 10mg'], summary: 'Combination protocol for post-stroke neurorehabilitation and TBI recovery.' },
  { title: 'IGF-1 LR3 + GHRP-2 Anabolic Stack', slug: 'igf1-ghrp2-anabolic-stack', category: 'Growth Hormone', peptides: ['IGF-1 LR3 1mg', 'GHRP-2 5mg'], summary: 'Anabolic protocol for sarcopenia and refractory lean mass loss — careful candidate selection required.' },
  { title: 'Tirz + AOD-9604 + L-Carnitine Metabolic Stack', slug: 'tirz-aod-carnitine-stack', category: 'Metabolism/Weight Loss', peptides: ['Tirz 10mg', 'AOD-9604 2mg', 'Lipo-C 10mL'], summary: 'Multi-mechanism fat oxidation stack for weight loss plateau breakthrough.' },
  { title: 'Sermorelin + Ipamorelin Anti-Aging GH Stack', slug: 'sermorelin-ipa-anti-aging', category: 'Growth Hormone', peptides: ['Sermorelin 10mg', 'Ipamorelin 5mg', 'Ipamorelin 10mg'], summary: 'Lower-amplitude GH protocol suitable for anti-aging without the side effect profile of supraphysiologic GH.' },
  { title: 'TB-500 + IGF-1 LR3 Athletic Recovery Stack', slug: 'tb500-igf1-recovery-stack', category: 'MSK/Tissue Repair', peptides: ['TB4 (TB-500) 10mg', 'IGF-1 LR3 1mg'], summary: 'Repair + anabolism stack for elite recovery from heavy training or in-season athlete management.' },
  { title: 'NAD+ Multi-Week Loading Protocol', slug: 'nad-loading-protocol', category: 'Longevity & Mitochondrial', peptides: ['NAD+ 1000mg', 'NAD+ 500mg'], summary: 'Front-loaded NAD+ titration protocol for severe fatigue, post-COVID, and addiction recovery initial response.' },
  { title: 'Glutathione + ALA Detoxification Stack', slug: 'glutathione-ala-detox-stack', category: 'Longevity & Mitochondrial', peptides: ['Glutathione 1500mg'], summary: 'Master antioxidant protocol with alpha-lipoic acid recycling for hepatic and systemic detox.' },
  { title: 'BPC-157 + PEG-MGF Localized Repair Stack', slug: 'bpc-peg-mgf-localized', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'PEG-MGF 2mg'], summary: 'Targeted localized injection protocol for joint, tendon, and post-surgical site healing.' },
  { title: 'CJC-1295 DAC vs No-DAC Protocol Comparison', slug: 'cjc-dac-vs-no-dac', category: 'Growth Hormone', peptides: ['CJC-1295 DAC 10mg', 'CJC-1295 10mg'], summary: 'Clinical decision framework for choosing between long-acting and short-acting GHRH analogs.' },
  { title: 'Mazdutide Investigational Weight Loss Protocol', slug: 'mazdutide-investigational', category: 'Metabolism/Weight Loss', peptides: ['Mazdutide 5mg', 'Mazdutide 10mg'], summary: 'GLP-1/glucagon dual agonist protocol — investigational framing with appropriate evidence caveats.' },
  { title: 'AOD-9604 + 5-Amino-1MQ + CLA Fat Loss Stack', slug: 'aod-1mq-cla-fat-loss', category: 'Metabolism/Weight Loss', peptides: ['AOD-9604 2mg', '5-Amino-1MQ 50mg'], summary: 'Non-GLP-1 fat loss stack for patients who cannot tolerate or do not qualify for GLP-1 agonists.' },
  { title: 'Hexarelin + Tesamorelin GH Optimization Stack', slug: 'hexarelin-tesa-gh-stack', category: 'Growth Hormone', peptides: ['Hexarelin 5mg', 'Tesamorelin 10mg'], summary: 'Visceral fat reduction stack combining GHRH analog and high-amplitude GHRP.' },
  { title: 'Tesamorelin + Ipamorelin Synergy Protocol', slug: 'tesa-ipa-synergy', category: 'Growth Hormone', peptides: ['Tesamorelin / Ipamorelin 20mg'], summary: 'Combined GHRH analog + GHRP for visceral adiposity and lean mass.' },
  { title: 'Cagrilintide Standalone Amylin Protocol', slug: 'cagrilintide-amylin', category: 'Metabolism/Weight Loss', peptides: ['Cagrilintide 5mg', 'Cagrilintide 10mg'], summary: 'Long-acting amylin analog protocol for satiety and gastric emptying without GLP-1 effect.' },
  { title: 'Multi-Peptide Aesthetic Practice Starter Protocol', slug: 'aesthetic-practice-starter', category: 'Longevity & Mitochondrial', peptides: ['GHK-Cu 50mg', 'BPC-157 10mg', 'TB4 (TB-500) 10mg', 'Glutathione 1500mg'], summary: 'Bundle of foundational protocols for an aesthetic practice transitioning into peptide medicine.' },
  { title: 'Cognitive & Mood Comparison: Selank vs Semax', slug: 'selank-vs-semax-comparison', category: 'Cognitive & Mood', peptides: ['Selank 10mg', 'NA-Selank Amidate 30mg', 'Semax 10mg'], summary: 'Decision framework for selecting between two of the most-prescribed cognitive peptides.' },
  { title: 'GLP-1 Discontinuation & Lean Mass Preservation Protocol', slug: 'glp1-discontinuation-lean-mass', category: 'Metabolism/Weight Loss', peptides: ['Sema 15mg', 'Tirz 15mg', 'CJC-1295/Ipamorelin 10mg', 'Tesamorelin 10mg'], summary: 'Structured taper off GLP-1 agonists with GH-axis support to preserve lean mass and metabolic gains.' },
  { title: 'Pre-Bariatric Surgery Metabolic Optimization Protocol', slug: 'pre-bariatric-optimization', category: 'Metabolism/Weight Loss', peptides: ['Sema 15mg', 'AOD-9604 2mg', 'Glutathione 1500mg'], summary: 'Six-month pre-bariatric protocol to reduce visceral adiposity and improve surgical outcomes.' },
  { title: 'Post-Bariatric Lean Mass Preservation Protocol', slug: 'post-bariatric-lean-mass', category: 'Growth Hormone', peptides: ['CJC-1295/Ipamorelin 10mg', 'Ipamorelin 10mg', 'Tesamorelin 10mg', 'BPC-157 10mg'], summary: 'Post-surgical lean mass preservation and GI healing protocol after bariatric surgery.' },
  { title: 'Adjunct Protocol for Type 2 Diabetes Reversal', slug: 't2dm-reversal-adjunct', category: 'Metabolism/Weight Loss', peptides: ['Tirz 15mg', 'MOTS-c 10mg', 'Glutathione 1500mg'], summary: 'Combined GLP-1/GIP + mitochondrial support protocol as adjunct to lifestyle change in T2DM reversal.' },
  { title: 'Comprehensive Anti-Aging Foundation Protocol', slug: 'anti-aging-foundation', category: 'Longevity & Mitochondrial', peptides: ['Epithalon 10mg', 'GHK-Cu 50mg', 'NAD+ 1000mg', 'Glutathione 1500mg'], summary: 'Four-vector longevity foundation protocol for adults 45+ entering preventive medicine programs.' },
  { title: 'IBD-Specific Multi-Peptide Protocol', slug: 'ibd-multi-peptide', category: 'Immune/Antimicrobial', peptides: ['oral BPC-157 500mcg', 'BPC-157 10mg', 'KPV 10mg', 'oral KPV 500mcg', 'Thymosin Alpha-1 10mg'], summary: 'Multi-mechanism IBD adjunct combining mucosal repair, anti-inflammatory, and immune-modulatory peptides.' },
  { title: 'Sermorelin Only Anti-Aging Protocol', slug: 'sermorelin-only-anti-aging', category: 'Growth Hormone', peptides: ['Sermorelin 10mg'], summary: 'Single-agent GHRH analog protocol — the most conservative entry point to GH-axis support.' },
  { title: 'Lipo-C Injectable Lipotropic Protocol', slug: 'lipo-c-lipotropic', category: 'Metabolism/Weight Loss', peptides: ['Lipo-C 10mL'], summary: 'Methionine, inositol, choline, and B-complex protocol for adjunct fat oxidation and hepatic support.' },

  // ── Use-case / clinical-context protocols (71–100) ──────────────────────
  { title: 'Post-Surgical Recovery Peptide Protocol', slug: 'post-surgical-recovery', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'TB4 (TB-500) 10mg', 'GHK-Cu 50mg'], summary: 'Multi-peptide protocol for accelerated post-surgical healing across orthopedic, abdominal, and dermatologic procedures.' },
  { title: 'ACL Reconstruction Recovery Protocol', slug: 'acl-reconstruction-recovery', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'TB4 (TB-500) 10mg', 'IGF-1 LR3 1mg'], summary: 'Time-staged ACL recovery protocol from pre-op through return-to-sport.' },
  { title: 'Achilles Tendinopathy Recovery Protocol', slug: 'achilles-tendinopathy', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'TB4 (TB-500) 10mg', 'PEG-MGF 2mg'], summary: 'Localized injection + systemic peptide protocol for chronic Achilles tendinopathy.' },
  { title: 'Rotator Cuff Repair Support Protocol', slug: 'rotator-cuff-repair', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'BPC-157/TB500 20mg', 'GHK-Cu 50mg'], summary: 'Pre and post-operative protocol for rotator cuff surgical and conservative management.' },
  { title: 'Chronic Fatigue Syndrome Adjunct Protocol', slug: 'chronic-fatigue-adjunct', category: 'Longevity & Mitochondrial', peptides: ['NAD+ 1000mg', 'MOTS-c 10mg', 'Thymosin Alpha-1 10mg', 'BPC-157 10mg'], summary: 'Multi-mechanism CFS/ME adjunct protocol addressing mitochondrial, immune, and gut-brain axis dimensions.' },
  { title: 'Long COVID Recovery Protocol', slug: 'long-covid-recovery', category: 'Immune/Antimicrobial', peptides: ['Thymosin Alpha-1 10mg', 'LL-37 5mg', 'NAD+ 1000mg', 'SS-31 10mg'], summary: 'Four-vector long COVID protocol for immune dysregulation, mitochondrial dysfunction, and persistent inflammation.' },
  { title: 'Perimenopausal Hormone Support Protocol', slug: 'perimenopausal-support', category: 'Cognitive & Mood', peptides: ['Oxytocin 5mg', 'PT-141 10mg', 'CJC-1295/Ipamorelin 10mg', 'Epithalon 10mg'], summary: 'Peptide adjunct protocol for perimenopausal mood, libido, sleep, and energy concerns alongside or in lieu of HRT.' },
  { title: 'Andropause / Low T Peptide Adjunct Protocol', slug: 'andropause-adjunct', category: 'Growth Hormone', peptides: ['CJC-1295/Ipamorelin 10mg', 'PT-141 10mg', 'Sermorelin 10mg'], summary: 'Adjunct protocol for clinical andropause working alongside testosterone replacement or in TRT-ineligible patients.' },
  { title: 'Aesthetic Practice Botox-Alternative Protocol', slug: 'aesthetic-botox-alternative', category: 'Longevity & Mitochondrial', peptides: ['GHK-Cu 50mg', 'GHK-Cu 100mg', 'Argireline (SNAP-8)', 'BPC-157 10mg'], summary: 'Needle-free aesthetic protocol for fine-line softening and skin quality improvement without neurotoxin.' },
  { title: 'Diabetic Foot Ulcer Healing Adjunct Protocol', slug: 'diabetic-foot-ulcer', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'TB4 (TB-500) 10mg', 'GHK-Cu 50mg', 'LL-37 5mg'], summary: 'Wound healing and antimicrobial protocol for refractory diabetic ulceration.' },
  { title: 'Sleep Architecture Optimization Protocol', slug: 'sleep-architecture', category: 'Cognitive & Mood', peptides: ['DSIP 10mg', 'Epithalon 10mg', 'Pinealon 10mg', 'Oxytocin 5mg'], summary: 'Multi-peptide protocol for slow-wave sleep optimization, sleep maintenance, and circadian alignment.' },
  { title: 'Mild Cognitive Impairment Protocol', slug: 'mild-cognitive-impairment', category: 'Cognitive & Mood', peptides: ['Cerebrolysin 60mg', 'Selank 10mg', 'Semax 10mg', 'NAD+ 1000mg'], summary: 'MCI adjunct protocol working alongside lifestyle and pharmacologic management.' },
  { title: 'Athletic Performance Recovery Protocol', slug: 'athletic-recovery', category: 'MSK/Tissue Repair', peptides: ['BPC-157 10mg', 'TB4 (TB-500) 10mg', 'CJC-1295/Ipamorelin 10mg', 'IGF-1 LR3 1mg'], summary: 'Elite athlete recovery protocol — careful attention to WADA / sport-specific governing body status.' },
  { title: 'Post-Concussion / TBI Recovery Protocol', slug: 'post-concussion-recovery', category: 'Cognitive & Mood', peptides: ['Cerebrolysin 60mg', 'Selank 10mg', 'Semax 10mg', 'NAD+ 1000mg'], summary: 'Neurorehabilitation protocol for mTBI and post-concussion syndrome — staged across acute and subacute phases.' },
  { title: 'Hashimoto Thyroiditis Adjunct Protocol', slug: 'hashimotos-adjunct', category: 'Immune/Antimicrobial', peptides: ['Thymosin Alpha-1 10mg', 'BPC-157 10mg', 'Glutathione 1500mg'], summary: 'Autoimmune adjunct protocol working alongside thyroid hormone replacement.' },
  { title: 'Androgenetic Alopecia Hair Growth Protocol', slug: 'androgenetic-hair-growth', category: 'Longevity & Mitochondrial', peptides: ['GHK-Cu 50mg', 'GHK-Cu 100mg', 'PEG-MGF 2mg', 'BPC-157 10mg'], summary: 'Topical and microinjection protocol for male and female pattern hair loss.' },
  { title: 'Body Recomposition (Cut + Tone) Protocol', slug: 'body-recomp-cut-tone', category: 'Metabolism/Weight Loss', peptides: ['AOD-9604 2mg', 'CJC-1295/Ipamorelin 10mg', 'BPC-157 10mg'], summary: 'Simultaneous fat loss and lean mass preservation protocol for already-healthy patients seeking aesthetic recomposition.' },
  { title: 'Heart Failure Adjunct Protocol', slug: 'heart-failure-adjunct', category: 'Longevity & Mitochondrial', peptides: ['SS-31 10mg', 'SS-31 50mg', 'MOTS-c 10mg', 'NAD+ 1000mg'], summary: 'Mitochondrial-focused adjunct protocol for HFrEF and HFpEF working alongside guideline-directed medical therapy.' },
  { title: 'Pre-Diabetic Reversal Protocol', slug: 'pre-diabetic-reversal', category: 'Metabolism/Weight Loss', peptides: ['Sema 15mg', 'MOTS-c 10mg', 'AOD-9604 2mg'], summary: 'Multi-mechanism protocol for prediabetic patients refusing or not qualifying for metformin.' },
  { title: 'PCOS Metabolic Adjunct Protocol', slug: 'pcos-adjunct', category: 'Metabolism/Weight Loss', peptides: ['Tirz 10mg', 'MOTS-c 10mg', 'AOD-9604 2mg'], summary: 'Insulin resistance and metabolic adjunct protocol for PCOS, working alongside lifestyle and inositol therapy.' },
  { title: 'Anxiety & Mood Peptide Adjunct Protocol', slug: 'anxiety-mood-adjunct', category: 'Cognitive & Mood', peptides: ['Selank 10mg', 'NA-Selank Amidate 30mg', 'Semax 10mg', 'DSIP 10mg'], summary: 'Adjunct protocol for generalized anxiety, treatment-resistant depression, and panic disorder.' },
  { title: 'Geriatric Frailty & Sarcopenia Protocol', slug: 'geriatric-frailty-sarcopenia', category: 'Growth Hormone', peptides: ['Sermorelin 10mg', 'Tesamorelin 10mg', 'BPC-157 10mg', 'MOTS-c 10mg'], summary: 'Multi-vector protocol for clinically significant sarcopenia and frailty syndrome in older adults.' },
  { title: 'Liver Detoxification Support Protocol', slug: 'liver-detox-support', category: 'Longevity & Mitochondrial', peptides: ['Glutathione 1500mg', 'NAD+ 1000mg'], summary: 'Hepatic support protocol for fatty liver, post-acetaminophen exposure, and heavy detox medication regimens.' },
  { title: 'Travel Recovery / Jet Lag Protocol', slug: 'travel-jetlag-recovery', category: 'Cognitive & Mood', peptides: ['Epithalon 10mg', 'DSIP 10mg', 'NAD+ 500mg'], summary: 'Short-duration protocol for circadian re-entrainment, post-flight recovery, and shift-worker support.' },
  { title: 'Migraine Prophylaxis Peptide Adjunct Protocol', slug: 'migraine-prophylaxis', category: 'Cognitive & Mood', peptides: ['Cerebrolysin 60mg', 'BPC-157 10mg', 'Selank 10mg'], summary: 'Adjunct protocol for chronic migraine refractory to first-line CGRP inhibitors.' },
  { title: 'Erectile Dysfunction Multi-Peptide Protocol', slug: 'erectile-dysfunction-multi', category: 'Cognitive & Mood', peptides: ['PT-141 10mg', 'CJC-1295/Ipamorelin 10mg', 'BPC-157 10mg'], summary: 'Multi-mechanism ED protocol for PDE5-inhibitor non-responders or patients seeking alternatives.' },
  { title: 'Inflammatory Skin (Eczema/Psoriasis) Adjunct Protocol', slug: 'inflammatory-skin-adjunct', category: 'Immune/Antimicrobial', peptides: ['KPV 10mg', 'oral KPV 500mcg', 'BPC-157 10mg', 'Thymosin Alpha-1 10mg'], summary: 'Adjunct protocol for refractory atopic dermatitis, psoriasis, and chronic urticaria.' },
  { title: 'Chronic Lyme & Tick-Borne Illness Adjunct Protocol', slug: 'chronic-lyme-adjunct', category: 'Immune/Antimicrobial', peptides: ['Thymosin Alpha-1 10mg', 'LL-37 5mg', 'BPC-157 10mg', 'NAD+ 1000mg'], summary: 'Multi-mechanism adjunct for chronic post-treatment Lyme disease syndrome — clear evidence caveats included.' },
  { title: 'Female Athletic Triad Recovery Protocol', slug: 'female-athletic-triad', category: 'Growth Hormone', peptides: ['CJC-1295/Ipamorelin 10mg', 'BPC-157 10mg', 'IGF-1 LR3 1mg'], summary: 'Recovery protocol for relative energy deficiency in sport (REDS) and female athletic triad.' },
  { title: 'Vagus Nerve & Gut-Brain Axis Protocol', slug: 'vagus-gut-brain-axis', category: 'Cognitive & Mood', peptides: ['BPC-157 10mg', 'Selank 10mg', 'oral BPC-157 500mcg'], summary: 'Multi-mechanism protocol targeting the gut-brain axis for IBS, functional dyspepsia, and stress-related GI dysfunction.' },
];

// ─── System prompts (must match /api/admin/protocols/draft) ─────────────────
type Audience = 'clinician' | 'patient';

const CLINICIAN_SYSTEM_PROMPT = `You are a senior clinical writer authoring peptide protocols for licensed clinicians on the Peptide Pure Research Network — an IRB-aligned observational registry sourcing exclusively from 503A/503B compounding pharmacies.

Audience: MDs, DOs, NPs, PAs, NDs, and other licensed prescribers. Write at a clinical-research level. Cite mechanism of action where well-established. Be honest about evidence gaps.

Required structure (use markdown):

## Overview
2-3 paragraphs framing the protocol's clinical goal, target patient profile, and what the peptide stack accomplishes together.

## Peptide Components
For each peptide, write a paragraph or short list covering: dose/strength, route, frequency, half-life, and primary mechanism. Keep concise but specific.

## Synergy & Mechanism
Why these peptides are combined. What downstream pathways they share or complement.

## Clinical Considerations
- Recommended baseline labs / biomarkers
- Monitoring cadence
- Common adverse events to counsel patients on
- Absolute and relative contraindications
- Drug interactions of note

## Suggested Dosing Schedule
A pragmatic schedule (e.g. "Week 1: BPC-157 250mcg SC bid; TB-500 2.5mg SC twice weekly...") that a clinician can adapt. Make it actionable, not theoretical.

## Expected Outcomes & Timeline
Realistic expectations at 4, 8, and 12 weeks. Acknowledge inter-individual variability.

## Evidence Notes
Brief honest summary of the evidence quality (peer-reviewed RCT, observational, mechanistic, case series). Flag where the protocol is empirical or off-label.

## Disclaimer
Always end with: "Protocol provided for clinician education under IRB-aligned observational research framework. Not FDA-approved for the indications discussed. Individualize dosing based on patient context; this is not medical advice."

Style:
- Use Sema / Tirz / Reta (not Semaglutide / Tirzepatide / Retatrutide) for Eli Lilly / Novo Nordisk avoidance.
- No emojis. No sycophantic phrases. No "it is important to note that".
- When uncertain about a specific dose, write a range and flag it.
- Markdown only — no HTML.`;

const PATIENT_SYSTEM_PROMPT = `You are a clinician-supervised patient educator writing a friendly, plain-language summary of a peptide protocol for patients.

Audience: a curious, motivated patient with a smartphone — not a doctor. Eighth-grade reading level. Warm, direct, honest tone. Skip the medical jargon (and if you must use a word like "subcutaneous," define it once in parentheses on first use).

This is content the patient's doctor will hand them — so the doctor's voice still comes through. It explains WHAT the protocol does, WHY it's being prescribed, WHAT to expect day-to-day, and WHEN to call the office.

Required structure (use markdown):

## What This Protocol Is For
2-3 short paragraphs: what condition or goal the protocol addresses, in everyday language. Talk about results the patient cares about (energy, recovery, weight, mood, sleep) — not biochemistry.

## What You'll Be Taking
Plain English for each peptide: nickname, what it does in one sentence, how often you'll take it. NO mechanism-of-action paragraphs.

## How to Use It
Step-by-step. Reconstitution if relevant (short, with the "ask the office" reminder). Injection or oral instructions. Storage. What time of day. With or without food. Skip-a-dose guidance.

## What to Expect
Realistic timeline (week 1, week 4, week 8, week 12) — what changes the patient should notice. Use "you'll likely notice / some people notice / give it the full N weeks" framing rather than guaranteed outcomes.

## Common Side Effects
The 3-5 most common, with the "what to do if you notice this" guidance for each. Plain language ("upset stomach" not "GI distress"). Reassure where appropriate that mild side effects usually settle within 1-2 weeks.

## When to Call the Office
Specific symptoms that mean stop and call. Make this easy to scan — short bullet list.

## A Note About This Protocol
Two sentences. Honest framing: this is supervised through Peptide Pure's research network, not FDA-approved for these uses, your doctor is monitoring you, this is not a magic bullet.

## Questions for Your Next Visit
3-4 thoughtful questions the patient can bring up at their next visit — encourages partnership and follow-up.

Style:
- Second person ("you"). Friendly but professional.
- Use Sema / Tirz / Reta (not the brand names like Ozempic, Mounjaro, Wegovy, or Zepbound, and not the full chemical names).
- No emojis. No "Don't worry!" / "Amazing!" / sycophancy.
- Avoid scaring the patient — but be honest. If something is investigational, say so once, simply.
- Markdown only — no HTML.`;

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set. Add it to .env.local.');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase env vars missing. Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.');
    process.exit(1);
  }

  const anthropic = new Anthropic();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  // ONLY_AUDIENCE env var lets you re-run for one audience after a partial
  // failure. Default is 'both' — drafts clinician + patient per topic.
  const onlyAudience = process.env.ONLY_AUDIENCE as Audience | undefined;
  const audiences: Audience[] = onlyAudience ? [onlyAudience] : ['clinician', 'patient'];
  console.log(`Starting batch draft of ${TOPICS.length} protocols for: ${audiences.join(' + ')}.`);
  console.log(`First call per audience writes the cache; subsequent calls in the same audience read it (~0.1× input cost).\n`);

  // Per-audience counters
  const stats = {
    clinician: { drafted: 0, skipped: 0, failed: 0 },
    patient: { drafted: 0, skipped: 0, failed: 0 },
  };
  let totalCacheReads = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // Single Claude draft attempt with bounded retry. Returns markdown or null.
  async function draftOnce(t: Topic, audience: Audience, label: string): Promise<string | null> {
    const systemPrompt = audience === 'patient' ? PATIENT_SYSTEM_PROMPT : CLINICIAN_SYSTEM_PROMPT;
    const firstHeading = audience === 'patient' ? '## What This Protocol Is For' : '## Overview';
    const userPrompt = [
      `Draft the protocol for: **${t.title}**`,
      ``,
      `**Category:** ${t.category}`,
      t.summary ? `**Short summary the patient/clinician will already see at the top of the page:** ${t.summary}` : null,
      `**Peptides in this stack:**\n${t.peptides.map((p) => `- ${p}`).join('\n')}`,
      ``,
      `Write the full protocol body in markdown for the ${audience === 'patient' ? 'PATIENT' : 'CLINICIAN'} audience, following the required structure exactly. Do not repeat the page title — start at the "${firstHeading}" heading.`,
    ]
      .filter((s) => s !== null)
      .join('\n');

    let lastError: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-7',
          max_tokens: 8000,
          thinking: { type: 'adaptive' },
          output_config: { effort: 'high' },
          system: [
            {
              type: 'text',
              text: systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userPrompt }],
        });

        const markdown = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('\n')
          .trim();

        if (!markdown || markdown.length < 300) {
          console.log(`${label} FAIL ${t.slug}/${audience} (attempt ${attempt}: short/empty len=${markdown.length}, stop_reason=${response.stop_reason})`);
          lastError = new Error(`Short response (${markdown.length} chars)`);
          await new Promise((r) => setTimeout(r, 3000 * attempt));
          continue;
        }

        totalCacheReads += response.usage.cache_read_input_tokens ?? 0;
        totalInputTokens += response.usage.input_tokens;
        totalOutputTokens += response.usage.output_tokens;

        const cacheNote = (response.usage.cache_read_input_tokens ?? 0) > 0 ? ' [cache hit]' : '';
        const retryNote = attempt > 1 ? ` (attempt ${attempt})` : '';
        console.log(`${label} ✓ ${t.slug}/${audience} (${markdown.length.toLocaleString()} chars, ${response.usage.output_tokens} out tokens)${cacheNote}${retryNote}`);
        return markdown;
      } catch (err) {
        lastError = err;
        if (err instanceof Anthropic.RateLimitError) {
          console.log(`${label} … rate limited (attempt ${attempt}), sleeping 60s`);
          await new Promise((r) => setTimeout(r, 60_000));
        } else if (err instanceof Anthropic.APIError && err.status >= 500) {
          console.log(`${label} … server error ${err.status} (attempt ${attempt}), sleeping 15s`);
          await new Promise((r) => setTimeout(r, 15_000));
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(`${label} FAIL ${t.slug}/${audience} (non-retryable: ${msg})`);
          return null;
        }
      }
    }
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    console.log(`${label} GIVE-UP ${t.slug}/${audience} after 3 attempts: ${msg}`);
    return null;
  }

  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i];
    const num = `[${String(i + 1).padStart(3, '0')}/${TOPICS.length}]`;

    // Look up existing row — we need status + both body fields to decide
    // what to draft. Skip published rows entirely; never reset them.
    const { data: existing, error: lookupErr } = await supabase
      .from('protocols')
      .select('id, body_md, patient_md, status')
      .eq('slug', t.slug)
      .maybeSingle();

    if (lookupErr) {
      console.log(`${num} FAIL ${t.slug} (lookup: ${lookupErr.message})`);
      for (const a of audiences) stats[a].failed++;
      continue;
    }

    if (existing && existing.status === 'published') {
      console.log(`${num} SKIP ${t.slug} (already published — never reset published rows)`);
      for (const a of audiences) stats[a].skipped++;
      continue;
    }

    // Ensure the row exists before drafting either audience. If the row is new
    // (no existing.id), insert a stub with the metadata so subsequent saves
    // can UPDATE by id.
    let rowId = existing?.id;
    if (!rowId) {
      const { data: inserted, error: insErr } = await supabase
        .from('protocols')
        .insert({
          slug: t.slug,
          title: t.title,
          category: t.category,
          peptides: t.peptides,
          summary: t.summary ?? null,
          status: 'draft',
          sort_order: 100 + i,
        })
        .select('id')
        .single();
      if (insErr || !inserted) {
        console.log(`${num} FAIL ${t.slug} (insert stub: ${insErr?.message ?? 'no row returned'})`);
        for (const a of audiences) stats[a].failed++;
        continue;
      }
      rowId = inserted.id;
    }

    for (const audience of audiences) {
      const field: 'body_md' | 'patient_md' = audience === 'patient' ? 'patient_md' : 'body_md';
      const currentValue = audience === 'patient' ? existing?.patient_md : existing?.body_md;

      if (currentValue && currentValue.trim().length > 200) {
        console.log(`${num} SKIP ${t.slug}/${audience} (already populated)`);
        stats[audience].skipped++;
        continue;
      }

      const markdown = await draftOnce(t, audience, num);
      if (!markdown) {
        stats[audience].failed++;
        continue;
      }

      const dbResult = await supabase
        .from('protocols')
        .update({ [field]: markdown, status: 'draft' })
        .eq('id', rowId);

      if (dbResult.error) {
        console.log(`${num} FAIL ${t.slug}/${audience} (db: ${dbResult.error.message})`);
        stats[audience].failed++;
        continue;
      }

      stats[audience].drafted++;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log(`\nDone.`);
  for (const a of audiences) {
    console.log(`  ${a}: drafted ${stats[a].drafted} · skipped ${stats[a].skipped} · failed ${stats[a].failed}`);
  }
  console.log(`Tokens: ${totalInputTokens.toLocaleString()} in (${totalCacheReads.toLocaleString()} cache reads) · ${totalOutputTokens.toLocaleString()} out`);

  const inputCost = ((totalInputTokens - totalCacheReads) * 5 + totalCacheReads * 0.5) / 1_000_000;
  const cacheWriteCost = (totalCacheReads > 0 ? audiences.length * 700 * 6.25 : 0) / 1_000_000;
  const outputCost = (totalOutputTokens * 25) / 1_000_000;
  console.log(`Approx Claude spend: $${(inputCost + cacheWriteCost + outputCost).toFixed(2)}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
