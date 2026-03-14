import Link from 'next/link';

export default function StarterPackages({
  user,
  packages,
}: {
  user: any;
  packages: any[];
}) {
  if (user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {packages.map((pkg: any) => (
          <div
            key={pkg.name}
            className={`rounded-2xl overflow-hidden shadow-sm flex flex-col relative ${pkg.highlight ? 'ring-2' : ''}`}
            style={{
              border: pkg.highlight ? '2px solid var(--gold)' : '1px solid var(--border)',
              background: 'white',
            }}
          >
            {pkg.highlight && (
              <div className="text-center py-1.5 text-xs font-bold uppercase tracking-widest text-white" style={{ background: 'var(--gold)' }}>
                Most Popular
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                {pkg.tier}
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: pkg.highlight ? 'var(--gold)' : 'var(--navy)' }}>
                {pkg.price}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-mid)' }}>{pkg.desc}</p>
              <div className="text-xs mb-3 p-3 rounded-lg" style={{ background: 'var(--off-white)' }}>
                <strong style={{ color: 'var(--navy)' }}>Focus:</strong>{' '}
                <span style={{ color: 'var(--text-mid)' }}>{pkg.focus}</span>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>{pkg.detail}</p>
              <div className="mt-auto space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-light)' }}>Wholesale Value:</span>
                  <span className="line-through" style={{ color: 'var(--text-light)' }}>{pkg.wholesale}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span style={{ color: 'var(--navy)' }}>Patient Retail Value:</span>
                  <span style={{ color: 'var(--gold)' }}>{pkg.retail}</span>
                </div>
                {pkg.bonus && (
                  <p className="text-xs mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--gold)' }}>
                    Bonus: {pkg.bonus}
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 pb-5">
              <Link
                href="/contact"
                className="w-full text-center block py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: pkg.highlight ? 'var(--gold)' : 'var(--navy)', color: 'white' }}
              >
                Request Package
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm mb-8" style={{ border: '1px solid var(--border)', background: 'white' }}>
      <div className="px-6 py-5 flex items-center gap-3" style={{ background: 'var(--navy)' }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Starter Packages</h3>
      </div>
      <div className="p-8 text-center">
        <p className="text-base font-semibold mb-2" style={{ color: 'var(--navy)' }}>
          Pricing available for verified clinicians
        </p>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-mid)' }}>
          We offer tiered starter packages with volume discounts for licensed healthcare professionals. Log in or create an account to view pricing and request a package.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/account" className="btn-primary">
            Log In to View Pricing
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
