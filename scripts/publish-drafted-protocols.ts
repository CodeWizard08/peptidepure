/**
 * Publish a curated starter set of protocols — the most-prescribed peptides
 * across MSK, metabolism, GH, longevity, and sexual health.
 *
 * Scott reviews and publishes the remaining 88 from /admin → Protocols at his pace.
 *
 * Each row in the allowlist must have body_md AND patient_md > 500 chars
 * before it's published — protects against publishing a half-drafted protocol.
 *
 * Idempotent. Safe to re-run.
 */

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(process.cwd(), '.env.local') });

// 12 most-prescribed protocols — broad therapeutic coverage for day-one launch.
const STARTER_SLUGS = [
  'bpc-157-gi-healing',
  'bpc-157-tendon-ligament',
  'tb500-tissue-repair',
  'bpc-tb500-soft-tissue-stack',
  'ghk-cu-anti-aging-skin',
  'sema-weight-management',
  'tirz-metabolic-optimization',
  'reta-advanced-weight-loss',
  'cjc1295-ipamorelin-gh',
  'pt-141-sexual-function',
  'nad-cellular-energy',
  'mots-c-mitochondrial',
];

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars in .env.local.');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const { data: candidates, error: lookupErr } = await supabase
    .from('protocols')
    .select('id, slug, status, body_md, patient_md')
    .in('slug', STARTER_SLUGS);

  if (lookupErr) {
    console.error('Lookup failed:', lookupErr.message);
    process.exit(1);
  }

  const found = candidates ?? [];
  const missing = STARTER_SLUGS.filter((s) => !found.find((p) => p.slug === s));
  if (missing.length) {
    console.warn(`WARN: ${missing.length} slug(s) not in DB — skipping: ${missing.join(', ')}`);
  }

  const ready = found.filter(
    (p) => (p.body_md ?? '').length > 500 && (p.patient_md ?? '').length > 500,
  );
  const halfDrafted = found.filter(
    (p) => (p.body_md ?? '').length <= 500 || (p.patient_md ?? '').length <= 500,
  );

  console.log(`Curated starter set: ${STARTER_SLUGS.length} slugs.`);
  console.log(`  Found in DB: ${found.length}`);
  console.log(`  Already published: ${found.filter((p) => p.status === 'published').length}`);
  console.log(`  Ready to publish (both bodies > 500 chars): ${ready.length}`);
  if (halfDrafted.length) {
    console.warn(`  Half-drafted (won't publish): ${halfDrafted.map((p) => p.slug).join(', ')}`);
  }

  const toPublish = ready.filter((p) => p.status !== 'published');
  if (toPublish.length === 0) {
    console.log('\nNothing new to publish.');
    return;
  }

  const ids = toPublish.map((p) => p.id);
  const { error: updateErr, count } = await supabase
    .from('protocols')
    .update({ status: 'published' }, { count: 'exact' })
    .in('id', ids);

  if (updateErr) {
    console.error('Publish failed:', updateErr.message);
    process.exit(1);
  }

  console.log(`\nPublished ${count ?? toPublish.length} protocols:`);
  for (const p of toPublish) console.log(`  ✓ ${p.slug}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
