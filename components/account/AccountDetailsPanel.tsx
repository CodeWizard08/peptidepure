import type { User } from '@supabase/supabase-js';
import { formatDate } from '@/lib/format';
import { ProfileField } from './AccountShared';

export default function AccountDetailsPanel({ user }: { user: User }) {
  const meta = user.user_metadata ?? {};
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'white', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--navy)' }}>Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <ProfileField label="Full Name" value={meta.full_name || '—'} />
          <ProfileField label="Email" value={user.email || '—'} />
          <ProfileField label="Clinic / Practice" value={meta.clinic || '—'} />
          <ProfileField label="Phone" value={meta.phone || '—'} />
          <ProfileField label="NPI Number" value={meta.npi_number || '—'} />
          <ProfileField label="Credential" value={meta.credential || '—'} />
          <ProfileField label="Member Since" value={formatDate(user.created_at)} />
        </div>
      </div>
    </div>
  );
}
