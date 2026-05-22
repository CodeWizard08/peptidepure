/**
 * Outbound inventory sync — DB → Google Sheet.
 *
 * Invoked by Vercel Cron every 5 minutes (see vercel.json). Reads every
 * inventory row, formats them as a 2-D grid, and writes to the configured
 * spreadsheet starting at the row after the header.
 *
 * Stamps `last_synced_at = now()` on every row so the inbound webhook can
 * skip rows it just received as an echo (loop-break).
 *
 * Auth: relies on Vercel's CRON_SECRET header. Returns 401 to any caller
 * without it (so the endpoint isn't a public-write hole).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clearRange, isSheetSyncConfigured, writeRange } from '@/lib/google-sheets';

// Don't pre-render — auth + DB read + external call every invocation.
export const dynamic = 'force-dynamic';

// Column order written to the Sheet (header row at A1 lives in the Sheet
// itself; this code only touches the data rows starting at A2).
//
//   A: SKU              from products.sku via inventory.product_id
//   B: Product          inventory.product
//   C: Dose             inventory.dose
//   D: Stock            inventory.stock
//   E: Status           inventory.status
//   F: Notes            inventory.notes
//   G: Last Synced      ISO timestamp of this write
const DATA_RANGE_PREFIX = 'A2'; // header row is row 1
const SHEET_TAB = process.env.GOOGLE_SHEETS_TAB ?? 'Inventory';

// Supabase JS types nested joins as arrays when it can't statically prove the
// 1:1 relationship. Accept both shapes so the cast is honest.
type InventoryWithProduct = {
  product: string;
  dose: string | null;
  stock: number;
  status: string;
  notes: string | null;
  products: { sku: string | null } | { sku: string | null }[] | null;
};

function skuOf(row: InventoryWithProduct): string {
  const p = row.products;
  if (!p) return '';
  if (Array.isArray(p)) return p[0]?.sku ?? '';
  return p.sku ?? '';
}

export async function GET(request: Request) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Reject anything
  // else so the endpoint can't be triggered externally. CRON_SECRET MUST be
  // set; if missing we reject everything rather than letting requests through
  // unauthenticated (codex round-8 Real #1).
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSheetSyncConfigured()) {
    return NextResponse.json(
      { error: 'Sheet sync not configured (missing GOOGLE_SHEETS_* env vars)' },
      { status: 503 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: rows, error } = await supabase
    .from('inventory')
    .select('product, dose, stock, status, notes, products(sku)')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[sync to-sheet] DB read failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const typedRows = (rows ?? []) as unknown as InventoryWithProduct[];
  const values: (string | number)[][] = typedRows.map((r) => [
    skuOf(r),
    r.product ?? '',
    r.dose ?? '',
    r.stock ?? 0,
    r.status ?? '',
    r.notes ?? '',
    now,
  ]);

  try {
    // We rely on writing only the data range; the header row stays intact.
    // The sheet should have at least as many rows allocated as we send; the
    // values endpoint auto-extends when needed.
    await writeRange(`${SHEET_TAB}!${DATA_RANGE_PREFIX}`, values);
    // Clear any trailing rows from a previous push that's now smaller —
    // otherwise stale stock numbers would linger in rows beyond our data
    // (codex round-8 Real #2).
    const lastDataRow = values.length + 1; // header in row 1, data in rows 2..(values.length + 1)
    await clearRange(`${SHEET_TAB}!A${lastDataRow + 1}:Z10000`);
  } catch (err) {
    console.error('[sync to-sheet] Sheets write failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sheets write failed' },
      { status: 502 },
    );
  }

  // Stamp last_synced_at on every row we just pushed. Failures here are
  // logged but not fatal — the next inbound webhook might apply an edit that
  // was already pushed; harmless re-write. Filter on `id IS NOT NULL` so we
  // don't accidentally exclude rows whose sort_order is null (codex Warning #5).
  const { error: stampErr } = await supabase
    .from('inventory')
    .update({ last_synced_at: now })
    .not('id', 'is', null);
  if (stampErr) {
    console.error('[sync to-sheet] last_synced_at stamp failed:', stampErr.message);
  }

  return NextResponse.json({ ok: true, rows: values.length, synced_at: now });
}
