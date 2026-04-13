/* ------------------------------------------------------------------ */
/*  Meridian Partner API – TypeScript types                           */
/*  Base URL: https://vivameridian.com/api/partner                    */
/* ------------------------------------------------------------------ */

// ── Catalog Sync ────────────────────────────────────────────────────

export type MeridianVariant = {
  variantName: string;
  retailPrice: number;       // cents
  partnerCost: number;       // cents
  active: boolean;
};

export type MeridianProduct = {
  partnerProductId: string;
  sku?: string;
  title: string;
  category: string;
  descriptionShort?: string;
  descriptionLong?: string;
  imageUrl?: string;
  priceModel: 'one_time' | 'subscription' | 'tiered';
  priceAmount?: number;      // cents
  requiresApproval?: boolean;
  inventoryCount?: number;
  shippingProfile?: 'standard' | 'cold_chain' | 'hazmat' | 'digital';
  goalTags?: string[];
  variants?: MeridianVariant[];
};

export type CatalogSyncRequest = {
  syncType: 'full' | 'delta';
  products: MeridianProduct[];
};

export type CatalogSyncResponse = {
  syncId: string;
  itemsReceived: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
};

// ── Inventory ───────────────────────────────────────────────────────

export type InventoryUpdate = {
  partnerProductId: string;
  sku?: string;
  quantity: number;
  reason?: string;
};

export type InventoryUpdateRequest = {
  updates: InventoryUpdate[];
};

export type InventoryUpdateResponse = {
  updated: number;
  failed: number;
};

// ── Pricing ─────────────────────────────────────────────────────────

export type PricingUpdate = {
  partnerProductId: string;
  priceAmount?: number;      // cents
  variants?: Pick<MeridianVariant, 'variantName' | 'retailPrice' | 'partnerCost'>[];
};

export type PricingUpdateRequest = {
  updates: PricingUpdate[];
};

export type PricingUpdateResponse = {
  updated: number;
  failed: number;
};

// ── Inbound Orders (Meridian → PeptidePure) ─────────────────────────

export type MeridianOrderItem = {
  productId: string;
  variantId?: string;
  title: string;
  quantity: number;
  unitPrice: number;         // cents
};

export type MeridianInboundOrder = {
  meridianOrderId: string;
  customerEmail: string;
  customerName: string;
  items: MeridianOrderItem[];
  totalAmount: number;       // cents
  currency: string;
  paymentConfirmed: boolean;
  stripePaymentIntentId?: string;
  metadata?: {
    checkoutGroup?: string;
    approvalStatus?: string;
  };
};

export type OrderAcceptResponse = {
  orderId: string;
  status: 'accepted';
};

// ── Fulfillment Updates (PeptidePure → Meridian) ────────────────────

export type FulfillmentStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

export type FulfillmentUpdateRequest = {
  meridianOrderId: string;
  partnerOrderRef: string;
  status: FulfillmentStatus;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string; // ISO 8601
};

export type FulfillmentUpdateResponse = {
  received: boolean;
  orderId: string;
  status: FulfillmentStatus;
};

// ── Inbound Webhooks (Meridian → PeptidePure) ───────────────────────

export type MeridianWebhookEvent =
  | 'order.status_changed'
  | 'order.confirmed'
  | 'order.cancelled'
  | 'order.refunded';

export type MeridianWebhookPayload = {
  event: MeridianWebhookEvent;
  orderId: string;
  status: string;
  orderStatus: string;
  approvalStatus?: string;
  shipmentStatus?: string | null;
  totalAmount: number;
  currency: string;
  partnerReferenceId?: string;
  timestamp: string;
};

// ── Sync History ────────────────────────────────────────────────────

export type SyncRecord = {
  id: string;
  syncType: 'full' | 'delta';
  syncStatus: string;
  syncDirection: string;
  itemsReceived: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsFailed: number;
  startedAt: string;
  completedAt: string;
};

export type OrderSubmission = {
  id: string;
  orderId: string;
  submissionStatus: string;
  partnerOrderRef?: string;
  attempts: number;
  submittedAt: string;
  acknowledgedAt?: string;
};

// ── Error ───────────────────────────────────────────────────────────

export type MeridianError = {
  error: string;
  details?: unknown[];
};
