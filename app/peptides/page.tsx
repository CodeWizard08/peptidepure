import Link from 'next/link';
import { getContent } from '@/lib/content';
import PageHero from '@/components/sections/PageHero';

export default async function PeptidesPage() {
  const content = await getContent<any>('peptides');

  return (
    <>
      <PageHero
        sectionLabel={content.hero.sectionLabel}
        heading={content.hero.heading}
        subtitle={content.hero.subtitle}
        centered={false}
        compact
      />

      <div className="container-xl py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20">
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
                <div className="px-5 py-4" style={{ background: 'var(--navy)' }}>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Categories</h3>
                </div>
                <div className="bg-white divide-y divide-gray-100">
                  {content.categories.map((cat: any) => (
                    <div key={cat.name} className="px-5 py-4">
                      <p className="text-sm font-bold mb-1" style={{ color: cat.color }}>
                        {cat.name}
                      </p>
                      <p className="text-xs italic mb-2" style={{ color: 'var(--text-light)' }}>
                        ({cat.subtitle})
                      </p>
                      <ul className="space-y-1">
                        {cat.items.map((item: string) => (
                          <li key={item}>
                            <Link href="#" className="text-xs hover:underline" style={{ color: 'var(--text-mid)' }}>
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Custom Formulations badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}>
              {content.customBadge}
            </div>

            {/* Starter Packages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {content.starterPackages.map((pkg: any) => (
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
                          🎁 Bonus: {pkg.bonus}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-6 pb-5">
                    <Link
                      href="/account"
                      className="w-full text-center block py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      style={{ background: pkg.highlight ? 'var(--gold)' : 'var(--navy)', color: 'white' }}
                    >
                      Login required →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Essential Protocols */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)' }}>{content.protocols.heading}</h2>
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                {content.protocols.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {content.protocols.items.map((protocol: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* Product image placeholder */}
                  <div className="h-44 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}>
                    <div className="grid grid-cols-3 gap-2 p-4">
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className="w-10 h-14 rounded-lg flex items-end justify-center pb-1"
                          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          <span className="text-white text-xs font-bold opacity-70">PP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--navy)' }}>{protocol.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {protocol.tags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-medium" style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="#"
                      className="mt-auto text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--navy)' }}
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
