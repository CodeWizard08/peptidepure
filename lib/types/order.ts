export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

export type OrderItemJson = {
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export type ShippingAddress = {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Order = {
  id: string;
  patient_id: string;
  order_type: string;
  status: string;
  items: OrderItemJson[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  patient_notes: string | null;
  clinician_notes: string | null;
  created_at: string;
  updated_at: string;
};
