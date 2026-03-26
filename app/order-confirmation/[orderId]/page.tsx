import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatOrderNumber } from '@/lib/format';
import OrderConfirmationBody from '@/components/OrderConfirmationBody';
import type { Order, OrderItemJson, ShippingAddress } from '@/lib/types/order';

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return {
    title: `Order ${formatOrderNumber(orderId)} | PeptidePure`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: order } = await supabase
    .from('orders').select('*')
    .eq('id', orderId).eq('patient_id', user.id)
    .single<Order>();
  if (!order) notFound();

  const items: OrderItemJson[] = order.items ?? [];
  const shipping: ShippingAddress | null = order.shipping_address;

  return <OrderConfirmationBody order={order} items={items} shipping={shipping} />;
}
