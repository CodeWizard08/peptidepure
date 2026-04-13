import crypto from 'crypto';
import type {
  CatalogSyncRequest,
  CatalogSyncResponse,
  InventoryUpdateRequest,
  InventoryUpdateResponse,
  PricingUpdateRequest,
  PricingUpdateResponse,
  FulfillmentUpdateRequest,
  FulfillmentUpdateResponse,
  SyncRecord,
  OrderSubmission,
} from '@/lib/types/meridian';

/* ------------------------------------------------------------------ */
/*  Config                                                            */
/* ------------------------------------------------------------------ */

const BASE_URL = 'https://vivameridian.com/api/partner';

function getApiKey(): string {
  const key = process.env.MERIDIAN_API_KEY;
  if (!key) throw new Error('MERIDIAN_API_KEY is not set');
  return key;
}

function getWebhookSecret(): string {
  const secret = process.env.MERIDIAN_WEBHOOK_SECRET;
  if (!secret) throw new Error('MERIDIAN_WEBHOOK_SECRET is not set');
  return secret;
}

/* ------------------------------------------------------------------ */
/*  HMAC Signing                                                      */
/* ------------------------------------------------------------------ */

/**
 * Sign a request per Meridian's spec:
 * payload = "{timestamp}.{METHOD}.{path}.{body}"
 */
function signRequest(method: string, path: string, body: string) {
  const timestamp = Date.now().toString();
  const payload = `${timestamp}.${method}.${path}.${body}`;
  const signature = crypto
    .createHmac('sha256', getWebhookSecret())
    .update(payload)
    .digest('hex');
  return { timestamp, signature };
}

/**
 * Verify an inbound webhook signature from Meridian.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac('sha256', getWebhookSecret())
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  HTTP helper                                                       */
/* ------------------------------------------------------------------ */

async function meridianFetch<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const bodyStr = body ? JSON.stringify(body) : '';
  const fullPath = `/api/partner${path}`;
  const { timestamp, signature } = signRequest(method, fullPath, bodyStr);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': getApiKey(),
      'X-Signature': signature,
      'X-Timestamp': timestamp,
    },
    ...(bodyStr ? { body: bodyStr } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meridian API ${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

/* ------------------------------------------------------------------ */
/*  Outbound: Catalog                                                 */
/* ------------------------------------------------------------------ */

/** Push products to Meridian (full or delta sync). */
export function catalogSync(req: CatalogSyncRequest) {
  return meridianFetch<CatalogSyncResponse>('POST', '/catalog/sync', req);
}

/* ------------------------------------------------------------------ */
/*  Outbound: Inventory                                               */
/* ------------------------------------------------------------------ */

/** Push real-time inventory changes to Meridian. */
export function inventoryUpdate(req: InventoryUpdateRequest) {
  return meridianFetch<InventoryUpdateResponse>('POST', '/catalog/inventory', req);
}

/* ------------------------------------------------------------------ */
/*  Outbound: Pricing                                                 */
/* ------------------------------------------------------------------ */

/** Push price changes to Meridian. */
export function pricingUpdate(req: PricingUpdateRequest) {
  return meridianFetch<PricingUpdateResponse>('POST', '/catalog/pricing', req);
}

/* ------------------------------------------------------------------ */
/*  Outbound: Fulfillment                                             */
/* ------------------------------------------------------------------ */

/** Notify Meridian of shipment / delivery / status change. */
export function fulfillmentUpdate(req: FulfillmentUpdateRequest) {
  return meridianFetch<FulfillmentUpdateResponse>('POST', '/webhooks/fulfillment', req);
}

/* ------------------------------------------------------------------ */
/*  Read-only: Sync History & Products                                */
/* ------------------------------------------------------------------ */

/** Get recent catalog sync history. */
export function getSyncHistory() {
  return meridianFetch<{ syncs: SyncRecord[] }>('GET', '/catalog/syncs');
}

/** Get order submission history. */
export function getOrderSubmissions() {
  return meridianFetch<{ submissions: OrderSubmission[] }>('GET', '/orders/submissions');
}

/** List all synced products on Meridian's side. */
export function getProducts() {
  return meridianFetch<{ products: unknown[] }>('GET', '/products');
}
