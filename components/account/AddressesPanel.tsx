import type { User } from '@supabase/supabase-js';

export default function AddressesPanel({ user }: { user: User }) {
  const meta = user.user_metadata ?? {};
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>
          The following addresses will be used on the checkout page by default.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl p-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>Shipping Address</h3>
            {meta.full_name ? (
              <div className="text-sm space-y-0.5" style={{ color: 'var(--text-mid)' }}>
                <p className="font-semibold" style={{ color: 'var(--navy)' }}>{meta.full_name}</p>
                {meta.clinic && <p>{meta.clinic}</p>}
                {meta.phone && <p>{meta.phone}</p>}
                <p>{user.email}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                No address saved yet. Your shipping address will be saved after your first order.
              </p>
            )}
          </div>
          <div className="rounded-xl p-5" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>Billing Address</h3>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Same as shipping address. Billing address will be used for invoicing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
