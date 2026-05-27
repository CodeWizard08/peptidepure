/**
 * Ingest "The Cockroach Diet" book extract into the protocols table as
 * `status='indexed'` rows so the AI Sherpa can do RAG retrieval over
 * the TCD content alongside clinical protocols.
 *
 * The TCD extract uses `---` separators between chapters and a consistent
 * structure:
 *   ## Chapter Title
 *   **chapter_id**: `slug`
 *   **word_count**: N
 *   ### Body
 *   <content>
 *
 * Each chapter becomes one protocol row with:
 *   - slug = chapter_id
 *   - title = chapter heading
 *   - category = 'TCD Book'
 *   - body_md = full chapter body
 *   - status = 'indexed' (retrievable via RAG but hidden from /protocols page)
 *
 * After running this, run `npm run embed-protocols` (or with EMBED_ALL=1)
 * to generate the vector embeddings for the new chunks.
 *
 * Usage:
 *   1. Save the TCD extract to content/tcd-sherpa-extract.md
 *   2. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   3. npm run ingest-tcd
 */

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import path from 'path';

loadEnv({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Chapter = {
  slug: string;
  title: string;
  wordCount: number;
  sections: string[];
  body: string;
};

function parseTCDExtract(md: string): Chapter[] {
  // Split on `---` separators (horizontal rules between chapters).
  const blocks = md.split(/\n---\n/).filter((b) => b.trim().length > 0);
  const chapters: Chapter[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    let title = '';
    let slug = '';
    let wordCount = 0;
    const sections: string[] = [];
    let bodyStartIdx = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // ## Chapter heading
      if (line.startsWith('## ') && !title) {
        title = line.replace(/^## /, '').trim();
      }

      // **chapter_id**: `slug`
      if (line.startsWith('**chapter_id**:')) {
        const match = line.match(/`([^`]+)`/);
        if (match) slug = match[1];
      }

      // **word_count**: N
      if (line.startsWith('**word_count**:')) {
        const match = line.match(/(\d+)/);
        if (match) wordCount = parseInt(match[1], 10);
      }

      // **sections**: N (followed by a list)
      // Individual section lines like "- 1.1 The Problem"
      if (line.startsWith('- ') && line.match(/^\- \d+\.\d+/)) {
        sections.push(line.replace(/^- /, '').trim());
      }

      // ### Body marker
      if (line === '### Body') {
        bodyStartIdx = i + 1;
      }
    }

    if (!slug || !title || bodyStartIdx < 0) continue;

    const body = lines.slice(bodyStartIdx).join('\n').trim();
    if (body.length < 100) continue; // skip near-empty chapters

    chapters.push({ slug, title, wordCount, sections, body });
  }

  return chapters;
}

async function main() {
  const filePath = path.join(process.cwd(), 'content', 'tcd-sherpa-extract.md');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.error('Save the TCD extract to content/tcd-sherpa-extract.md first.');
    process.exit(1);
  }

  const md = fs.readFileSync(filePath, 'utf-8');
  const chapters = parseTCDExtract(md);

  console.log(`Parsed ${chapters.length} TCD chapters.`);

  let upserted = 0;
  let skipped = 0;

  for (const ch of chapters) {
    // Upsert: if a protocol with this slug already exists (from a prior run
    // or a real protocol that happens to share the slug), update body_md +
    // category. Otherwise insert.
    const { data: existing } = await supabase
      .from('protocols')
      .select('id')
      .eq('slug', ch.slug)
      .maybeSingle();

    const payload = {
      slug: ch.slug,
      title: ch.title,
      category: 'TCD Book',
      summary: ch.sections.length > 0
        ? `Sections: ${ch.sections.join(', ')} (${ch.wordCount} words)`
        : `${ch.wordCount} words`,
      body_md: ch.body,
      patient_md: '', // TCD doesn't have a patient variant
      peptides: [],
      tags: ['tcd', 'cockroach-diet'],
      status: 'indexed',
      sort_order: 0,
    };

    if (existing) {
      const { error } = await supabase
        .from('protocols')
        .update(payload)
        .eq('id', existing.id);
      if (error) {
        console.error(`Failed to update ${ch.slug}:`, error.message);
        skipped++;
      } else {
        console.log(`Updated: ${ch.slug} — ${ch.title}`);
        upserted++;
      }
    } else {
      const { error } = await supabase
        .from('protocols')
        .insert(payload);
      if (error) {
        console.error(`Failed to insert ${ch.slug}:`, error.message);
        skipped++;
      } else {
        console.log(`Inserted: ${ch.slug} — ${ch.title}`);
        upserted++;
      }
    }
  }

  console.log(`\nDone. ${upserted} upserted, ${skipped} skipped.`);
  console.log('Next: run `npm run embed-protocols` to generate vector embeddings.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
