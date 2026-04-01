'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type OrderItem = { product_name: string; quantity: number; unit_price_cents: number; line_total_cents: number };
type ShippingAddress = { name: string; email: string; phone?: string; line1: string; line2?: string; city: string; state: string; zip: string };
type Order = { id: string; status: string; payment_method?: string; items: OrderItem[]; subtotal_cents: number; total_cents: number; shipping_address: ShippingAddress | null; tracking_number: string | null; patient_notes: string | null; clinician_notes: string | null; created_at: string };

const STATUS_OPTIONS = ['pending', 'approved', 'processing', 'completed', 'cancelled'];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E' }, approved: { bg: '#DBEAFE', text: '#1E40AF' },
  processing: { bg: '#E0E7FF', text: '#3730A3' }, completed: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function TrackingInput({ initial, onSave, disabled }: { initial: string; onSave: (v: string) => void; disabled: boolean }) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  return (
    <div className="flex gap-2">
      <input type="text" value={value} onChange={(e) => { setValue(e.target.value); setDirty(e.target.value !== initial); }} placeholder="Enter tracking number" className="flex-1 py-2 px-3 text-sm rounded-lg focus:outline-none" style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }} />
      {dirty && <button onClick={() => { onSave(value); setDirty(false); }} disabled={disabled} className="px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--gold)' }}>Save</button>}
    </div>
  );
}

function NotesInput({ initial, onSave, disabled }: { initial: string; onSave: (v: string) => void; disabled: boolean }) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  return (
    <div>
      <textarea value={value} onChange={(e) => { setValue(e.target.value); setDirty(e.target.value !== initial); }} placeholder="Internal notes..." rows={2} className="w-full py-2 px-3 text-sm rounded-lg focus:outline-none resize-none" style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }} />
      {dirty && <button onClick={() => { onSave(value); setDirty(false); }} disabled={disabled} className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--gold)' }}>Save Notes</button>}
    </div>
  );
}

export default function AdminOrdersPanel({ embedded = false }: { embedded?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders || []); setTotal(data.total || 0);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrder = async (orderId: string, updates: Record<string, unknown>) => {
    setUpdating(orderId);
    try { const res = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, ...updates }) }); if (res.ok) await fetchOrders(); }
    finally { setUpdating(null); }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.shipping_address?.name?.toLowerCase().includes(q) ||
      o.shipping_address?.email?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div style={{ background: 'var(--off-white)', minHeight: embedded ? undefined : '100vh' }}>
      {!embedded && (
        <div className="py-8" style={{ background: 'var(--navy)' }}>
          <div className="container-xl">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin" className="text-xs font-semibold uppercase tracking-widest hover:underline" style={{ color: 'var(--gold)' }}>Admin</Link>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white">Orders</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Order Management</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{total} total order{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
      {embedded && (
        <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-2">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Orders</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>{total} total order{total !== 1 ? 's' : ''}</p>
        </div>
      )}
      <div className={embedded ? 'px-4 sm:px-8 py-4' : 'container-xl py-6'}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by order ID or customer name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-45 px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors" style={{ background: statusFilter === s ? 'var(--navy)' : 'white', color: statusFilter === s ? 'white' : 'var(--text-mid)', border: `1px solid ${statusFilter === s ? 'var(--navy)' : 'var(--border)'}` }}>{s}</button>
          ))}
        </div>
      </div>
      <div className={embedded ? 'px-4 sm:px-8 pb-12' : 'container-xl pb-12'}>
        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }} /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center"><p className="text-sm" style={{ color: 'var(--text-light)' }}>{orders.length === 0 ? 'No orders found.' : 'No orders match your search.'}</p></div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const addr = order.shipping_address;
              return (
                <div key={order.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: 'var(--navy)' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>{order.status}</span>
                        {order.payment_method && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>{order.payment_method === 'credit_card' ? 'Card' : order.payment_method}</span>}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>{addr?.name || 'Unknown'} &middot; {fmtDate(order.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--navy)' }}>{fmt(order.total_cents)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-light)' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                    <svg className="w-4 h-4 shrink-0 transition-transform" style={{ color: 'var(--text-light)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-light)' }}>Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, i) => (<div key={i} className="flex justify-between text-sm"><span style={{ color: 'var(--text-dark)' }}>{item.product_name} <span style={{ color: 'var(--text-light)' }}>x{item.quantity}</span></span><span className="font-medium" style={{ color: 'var(--navy)' }}>{fmt(item.line_total_cents)}</span></div>))}
                            <hr style={{ borderColor: 'var(--border)' }} />
                            <div className="flex justify-between text-sm font-bold"><span style={{ color: 'var(--navy)' }}>Total</span><span style={{ color: 'var(--gold)' }}>{fmt(order.total_cents)}</span></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-light)' }}>Shipping</h4>
                          {addr ? (<div className="text-sm space-y-1" style={{ color: 'var(--text-dark)' }}><p className="font-semibold">{addr.name}</p><p>{addr.email}</p>{addr.phone && <p>{addr.phone}</p>}<p>{addr.line1}</p>{addr.line2 && <p>{addr.line2}</p>}<p>{addr.city}, {addr.state} {addr.zip}</p></div>) : (<p className="text-sm" style={{ color: 'var(--text-light)' }}>No address</p>)}
                          {order.patient_notes && <div className="mt-4"><h4 className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-light)' }}>Customer Notes</h4><p className="text-sm" style={{ color: 'var(--text-dark)' }}>{order.patient_notes}</p></div>}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-light)' }}>Update Order</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>Status</label>
                              <select value={order.status} onChange={(e) => updateOrder(order.id, { status: e.target.value })} disabled={updating === order.id} className="w-full py-2 px-3 text-sm rounded-lg focus:outline-none" style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                              </select>
                            </div>
                            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>Tracking Number</label><TrackingInput initial={order.tracking_number || ''} onSave={(val) => updateOrder(order.id, { trackingNumber: val })} disabled={updating === order.id} /></div>
                            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>Admin Notes</label><NotesInput initial={order.clinician_notes || ''} onSave={(val) => updateOrder(order.id, { clinicianNotes: val })} disabled={updating === order.id} /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg text-xs font-bold" style={{ background: page === p ? 'var(--navy)' : 'white', color: page === p ? 'white' : 'var(--text-mid)', border: `1px solid ${page === p ? 'var(--navy)' : 'var(--border)'}` }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
