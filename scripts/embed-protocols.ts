/**
 * Generate embeddings for every published protocol so the AI Sherpa chatbot
 * can do semantic retrieval over the corpus.
 *
 * - Chunks body_md (clinician) and patient_md (patient) by ## heading
 * - Embeds each chunk via OpenAI text-embedding-3-small (1536d)
 * - Per-protocol: deletes the protocol's old chunks, then inserts the new ones.
 *   A failure mid-run isolates damage to the one in-flight protocol; every
 *   other protocol's chunks remain intact and consistent.
 *
 * Idempotent: re-running replaces all chunks for each protocol it processes.
 * Filters: by default processes only `status='published'` protocols. Pass
 * `EMBED_ALL=1` to include drafts too.
 *
 * Cost: ~$0.10 for 100 protocols × 2 audiences × ~8 chunks each ≈ 1,600 chunks
 * at ~$0.00002 per 1k tokens × ~500 tokens per chunk.
 *
 * Usage:
 *   1. Ensure .env.local has OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 *   2. From project root: npm run embed-protocols
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(process.cwd(), '.env.local') });

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;
const MIN_CHUNK_CHARS = 200; // drop tiny chunks (single-bullet sections etc.)
const MAX_CHUNK_CHARS = 4000; // long sections get split further
const BATCH_SIZE = 50; // OpenAI accepts up to 2048 inputs/batch but smaller is safer

type Audience = 'clinician' | 'patient';

type ProtocolRow = {
  id: string;
  slug: string;
  status: string;
  body_md: string;
  patient_md: string;
};

type Chunk = {
  protocol_id: string;
  slug: string;
  audience: Audience;
  heading: string | null;
  chunk_text: string;
  chunk_order: number;
};

/**
 * Split markdown by H2 headings (## ...). Each section becomes a chunk
 * containing its heading + body. Content before the first heading becomes
 * a chunk with heading=null. Long sections are further split on paragraph
 * boundaries at MAX_CHUNK_CHARS.
 */
function chunkMarkdown(md: string): Array<{ heading: string | null; text: string }> {
  if (!md.trim()) return [];

  const lines = md.split('\n');
  const sections: Array<{ heading: string | null; text: string }> = [];
  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    const text = currentBody.join('\n').trim();
    if (!text) return;
    if (text.length <= MAX_CHUNK_CHARS) {
      sections.push({ heading: currentHeading, text });
      return;
    }
    // Split overly long section on blank lines, packing paragraphs up to MAX.
    const paras = text.split(/\n\s*\n/);
    let buf: string[] = [];
    let bufLen = 0;
    for (const p of paras) {
      if (bufLen + p.length > MAX_CHUNK_CHARS && buf.length > 0) {
        sections.push({ heading: currentHeading, text: buf.join('\n\n') });
        buf = [p];
        bufLen = p.length;
      } else {
        buf.push(p);
        bufLen += p.length + 2;
      }
    }
    if (buf.length) sections.push({ heading: currentHeading, text: buf.join('\n\n') });
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      flush();
      currentHeading = h2[1];
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  flush();

  return sections.filter((s) => s.text.length >= MIN_CHUNK_CHARS);
}

async function embedBatch(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIM,
  });
  return response.data.map((d) => d.embedding);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing in .env.local');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase env vars missing.');
    process.exit(1);
  }

  const openai = new OpenAI();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const embedAll = process.env.EMBED_ALL === '1';
  const targetSlug = process.env.SLUG; // optional — embed a single protocol

  let query = supabase
    .from('protocols')
    .select('id, slug, status, body_md, patient_md');
  if (!embedAll) query = query.eq('status', 'published');
  if (targetSlug) query = query.eq('slug', targetSlug);

  const { data: protocols, error } = await query;
  if (error) {
    console.error('Lookup failed:', error.message);
    process.exit(1);
  }
  if (!protocols?.length) {
    console.log('No protocols matched the filter.');
    return;
  }

  console.log(`Embedding ${protocols.length} protocol(s) with ${EMBEDDING_MODEL}.`);

  let totalChunks = 0;
  let totalTokens = 0;
  let okProtocols = 0;
  const failedProtocols: string[] = [];

  for (const p of protocols as ProtocolRow[]) {
    const clinicianChunks = chunkMarkdown(p.body_md);
    const patientChunks = chunkMarkdown(p.patient_md);
    const chunks: Chunk[] = [
      ...clinicianChunks.map<Chunk>((c, i) => ({
        protocol_id: p.id, slug: p.slug, audience: 'clinician',
        heading: c.heading, chunk_text: c.text, chunk_order: i,
      })),
      ...patientChunks.map<Chunk>((c, i) => ({
        protocol_id: p.id, slug: p.slug, audience: 'patient',
        heading: c.heading, chunk_text: c.text, chunk_order: i,
      })),
    ];
    console.log(`  ${p.slug}: ${clinicianChunks.length} clinician + ${patientChunks.length} patient = ${chunks.length} chunks`);
    if (chunks.length === 0) {
      console.log(`    (skip — no embeddable content)`);
      continue;
    }

    // Embed all chunks for this protocol first. If embedding fails, the old
    // chunks remain in place — RAG keeps working for this protocol.
    const texts = chunks.map((c) => (c.heading ? `${c.heading}\n\n${c.chunk_text}` : c.chunk_text));
    let embeddings: number[][];
    try {
      embeddings = [];
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const slice = texts.slice(i, i + BATCH_SIZE);
        const batch = await embedBatch(openai, slice);
        embeddings.push(...batch);
        totalTokens += slice.reduce((sum, t) => sum + Math.ceil(t.length / 4), 0);
      }
    } catch (err) {
      console.error(`    embed failed: ${err instanceof Error ? err.message : err}`);
      failedProtocols.push(p.slug);
      continue;
    }

    // Now delete old chunks and insert new ones. Even if INSERT errors, the
    // damage is limited to this one protocol (and re-running with SLUG=<slug>
    // fixes it).
    const { error: delErr } = await supabase
      .from('protocol_chunks')
      .delete()
      .eq('protocol_id', p.id);
    if (delErr) {
      console.error(`    delete-old failed: ${delErr.message}`);
      failedProtocols.push(p.slug);
      continue;
    }

    const rows = chunks.map((c, j) => ({
      protocol_id: c.protocol_id,
      slug: c.slug,
      audience: c.audience,
      heading: c.heading,
      chunk_text: c.chunk_text,
      chunk_order: c.chunk_order,
      embedding: embeddings[j] as unknown as string,
    }));

    const { error: insErr } = await supabase.from('protocol_chunks').insert(rows);
    if (insErr) {
      console.error(`    insert failed: ${insErr.message} — protocol left with NO chunks; re-run with SLUG=${p.slug}`);
      failedProtocols.push(p.slug);
      continue;
    }

    okProtocols++;
    totalChunks += chunks.length;
  }

  // text-embedding-3-small priced at $0.02 / 1M input tokens (as of 2025-2026).
  const estCost = (totalTokens / 1_000_000) * 0.02;
  console.log(`\nDone. ${okProtocols} protocol(s) embedded · ${totalChunks} chunks total. ~${totalTokens.toLocaleString()} tokens. Est cost: $${estCost.toFixed(4)}.`);
  if (failedProtocols.length > 0) {
    console.log(`Failed protocols (re-run individually with SLUG=<slug>):`);
    for (const slug of failedProtocols) console.log(`  ${slug}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
