import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// One CSV cell. Wraps in double quotes if value contains comma, quote, or newline.
// Doubles internal quotes per RFC 4180. Prefixes leading =/+/-/@ with a single
// quote so Excel and Sheets don't interpret the cell as a formula (CWE-1236).
function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = typeof v === 'string' ? v : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Allowed status filter values; anything else is rejected. Keeps the value
// safe to interpolate into Content-Disposition without further escaping.
const ALLOWED_STATUSES = new Set(['all', 'pending', 'approved', 'processing', 'completed', 'cancelled']);

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',');
}

type OrderItem = {
  product_name?: string;
  product_slug?: string;
  quantity?: number;
  unit_price_cents?: number;
  line_total_cents?: number;
};

type ShippingAddress = {
  name?: string;
  email?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

// GET /api/admin/orders/export?status=approved
// Streams a CSV of orders ready for 3PL handoff. One row per order line item
// so the 3PL can map directly to fulfillment line items. Supports optional
// status filter; default returns all non-cancelled orders.
export async function GET(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const rawStatus = searchParams.get('status');
  const status = rawStatus && ALLOWED_STATUSES.has(rawStatus) ? rawStatus : null;

  const supabase = getAdminSupabase();
  let query = supabase
    .from('orders')
    .select('id, created_at, status, tracking_number, total_cents, items, shipping_address, patient_notes')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  } else {
    query = query.neq('status', 'cancelled');
  }

  const { data, error } = await query;
  if (error) {
    console.error('[orders/export]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  const headers = [
    'Order ID',
    'Date',
    'Status',
    'Tracking Number',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Address Line 1',
    'Address Line 2',
    'City',
    'State',
    'ZIP',
    'Country',
    'Product Name',
    'Product Slug',
    'Quantity',
    'Unit Price (USD)',
    'Line Total (USD)',
    'Order Total (USD)',
    'Patient Notes',
  ];

  const rows: string[] = [csvRow(headers)];

  for (const order of data ?? []) {
    const shipping = (order.shipping_address ?? {}) as ShippingAddress;
    const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
    const orderTotal = ((order.total_cents ?? 0) / 100).toFixed(2);
    const shortId = String(order.id).slice(0, 8).toUpperCase();

    if (items.length === 0) {
      rows.push(
        csvRow([
          shortId,
          order.created_at,
          order.status,
          order.tracking_number ?? '',
          shipping.name ?? '',
          shipping.email ?? '',
          shipping.phone ?? '',
          shipping.line1 ?? '',
          shipping.line2 ?? '',
          shipping.city ?? '',
          shipping.state ?? '',
          shipping.zip ?? '',
          shipping.country ?? 'US',
          '',
          '',
          '',
          '',
          '',
          orderTotal,
          order.patient_notes ?? '',
        ]),
      );
      continue;
    }

    for (const item of items) {
      rows.push(
        csvRow([
          shortId,
          order.created_at,
          order.status,
          order.tracking_number ?? '',
          shipping.name ?? '',
          shipping.email ?? '',
          shipping.phone ?? '',
          shipping.line1 ?? '',
          shipping.line2 ?? '',
          shipping.city ?? '',
          shipping.state ?? '',
          shipping.zip ?? '',
          shipping.country ?? 'US',
          item.product_name ?? '',
          item.product_slug ?? '',
          item.quantity ?? 0,
          ((item.unit_price_cents ?? 0) / 100).toFixed(2),
          ((item.line_total_cents ?? 0) / 100).toFixed(2),
          orderTotal,
          order.patient_notes ?? '',
        ]),
      );
    }
  }

  const csv = rows.join('\r\n');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `peptidepure-orders-${status ?? 'open'}-${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
