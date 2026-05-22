/**
 * Inbound inventory sync — Google Sheet → DB.
 *
 * Apps Script onEdit trigger posts here with `{ sku, stock, status?, notes?,
 * sheet_secret }`. The endpoint:
 *   1. Verifies sheet_secret against SHEET_SYNC_SECRET (constant-time compare).
 *   2. Looks up the inventory row by SKU (via products.sku FK).
 *   3. If the row's last_synced_at is within the last 60 seconds, treats the
 *      edit as the echo of our own outbound push and skips. Breaks the loop.
 *   4. Otherwise updates inventory.stock / status / notes — the existing
 *      trigger 021 cascades the stock change to products.stock_quantity.
 *
 * The endpoint is `POST` only. Returns 401 on bad secret, 404 on unknown
 * SKU, 200 on apply or skip (with `applied: true|false`).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import { isSheetSyncConfigured } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

// If the row was last synced FROM the DB within this many milliseconds, the
// incoming edit is almost certainly an echo. Skip to break the loop.
const ECHO_WINDOW_MS = 60_000;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(request: NextRequest) {
  if (!isSheetSyncConfigured()) {
    return NextResponse.json(
      { error: 'Sheet sync not configured' },
      { status: 503 },
    );
  }

  let body: {
    sku?: string;
    stock?: number;
    status?: string;
    notes?: string;
    sheet_secret?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const expected = process.env.SHEET_SYNC_SECRET ?? '';
  const provided = body.sheet_secret ?? '';
  if (!safeEqual(expected, provided)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sku = (body.sku ?? '').trim();
  if (!sku) return NextResponse.json({ error: 'sku is required' }, { status: 400 });

  // stock is the only field we strictly require to do something useful;
  // status and notes are optional partial updates.
  if (body.stock !== undefined) {
    const n = Number(body.stock);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      return NextResponse.json(
        { error: 'stock must be a non-negative integer' },
        { status: 400 },
      );
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Resolve SKU → product_id → inventory row. Inventory rows without a
  // product_id (clinic-only display SKUs) aren't reachable from the sheet
  // because the sheet's SKU column comes from products.
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id')
    .eq('sku', sku)
    .maybeSingle();
  if (prodErr) {
    return NextResponse.json({ error: prodErr.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: `Unknown SKU: ${sku}` }, { status: 404 });
  }

  const { data: row, error: rowErr } = await supabase
    .from('inventory')
    .select('id, last_synced_at')
    .eq('product_id', product.id)
    .maybeSingle();
  if (rowErr) {
    return NextResponse.json({ error: rowErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json(
      { error: `No inventory row for SKU ${sku}` },
      { status: 404 },
    );
  }

  // Echo-skip: if we just pushed this row outbound within the window, the
  // edit is probably the cron's own write reflected back via Apps Script.
  if (row.last_synced_at) {
    const synced = new Date(row.last_synced_at).getTime();
    if (Number.isFinite(synced) && Date.now() - synced < ECHO_WINDOW_MS) {
      return NextResponse.json({ ok: true, applied: false, reason: 'echo' });
    }
  }

  // Apply the partial update.
  const updates: Record<string, unknown> = {};
  if (body.stock !== undefined) updates.stock = Number(body.stock);
  if (typeof body.status === 'string') updates.status = body.status;
  if (typeof body.notes === 'string') updates.notes = body.notes || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, applied: false, reason: 'no-fields' });
  }

  const { error: updErr } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', row.id);
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, applied: true });
}
