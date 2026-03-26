'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Order } from '@/lib/types/order';
import DashboardHome from './DashboardHome';
import OrdersPanel from './OrdersPanel';
import AddressesPanel from './AddressesPanel';
import AccountDetailsPanel from './AccountDetailsPanel';

type DashboardTab = 'dashboard' | 'orders' | 'addresses' | 'account';

const NAV_ITEMS: { key: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { key: 'orders', label: 'Orders', icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  { key: 'addresses', label: 'Addresses', icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2" /></svg> },
  { key: 'account', label: 'Account Details', icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

export default function Dashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<DashboardTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const supabase = createClient();
  const displayName = user.user_metadata?.full_name || 'Clinician';

  useEffect(() => {
    if ((tab === 'orders' || tab === 'dashboard') && !ordersFetched) {
      setOrdersLoading(true);
      supabase.from('orders').select('*').eq('patient_id', user.id).eq('order_type', 'supplement').order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error('Orders fetch error:', error);
          setOrders((data as Order[]) ?? []);
          setOrdersLoading(false); setOrdersFetched(true);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div style={{ background: 'var(--off-white)' }}>
      <div className="py-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-xl">
          <span className="section-label">Clinician Portal</span>
          <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ color: 'var(--navy)' }}>My Account</h1>
        </div>
      </div>

      <div className="container-xl py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = tab === item.key;
                return (
                  <button key={item.key} onClick={() => setTab(item.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                    style={{ background: active ? 'var(--gold)' : 'transparent', color: active ? 'white' : 'var(--navy)' }}>
                    <span style={{ opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left hover:bg-red-50" style={{ color: '#DC2626' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            {tab === 'dashboard' && <DashboardHome user={user} displayName={displayName} orders={orders} ordersLoading={ordersLoading} onViewOrders={() => setTab('orders')} />}
            {tab === 'orders' && <OrdersPanel orders={orders} loading={ordersLoading} />}
            {tab === 'addresses' && <AddressesPanel user={user} />}
            {tab === 'account' && <AccountDetailsPanel user={user} />}
          </main>
        </div>
      </div>
    </div>
  );
}
