import Link from 'next/link';

const categories = [
  {
    name: 'Metabolic / Weight Loss Peptides',
    subtitle: 'Endocrine System',
    color: '#C8952C',
    items: ['AOD-9604', 'Cagrilintide', 'Cagrilintide + Semaglutide', 'GLP-1 (SEMA)', 'GLP-1 / GIP (TIRZ)', 'GLP-1 / GIP / G (RETA)', 'Mazdutide', 'Melanotan II', 'SLU-PP-332', 'Survodutide'],
  },
  {
    name: 'MSK / Tissue Repair Peptides',
    subtitle: 'Musculoskeletal System',
    color: '#2563EB',
    items: ['ARA-290', 'BPC-157', 'BPC-157 / TB-500', 'Follistatin', 'Thymosin Beta-4 (TB-500)', 'Glow (BPC-157 / GHK-Cu / TB-500)', 'KLOW (TB-500 / BPC-157 / GHK-Cu / KPV)'],
  },
  {
    name: 'Longevity Peptides + Mitochondrial Support',
    subtitle: 'Cellular Aging, Neuroprotection, Energy Systems',
    color: '#059669',
    items: ['5-Amino-1MQ', 'Cerebrolysin', 'Epithalon', 'FOXO4-DRI', 'GHK-Cu', 'Glutathione', 'MOTS-c', 'NAD+', 'Pinealon', 'SS-31 (Elamipeptide)'],
  },
  {
    name: 'Growth Hormone / GH Receptor Peptides',
    subtitle: 'Endocrine & Muscular System',
    color: '#7C3AED',
    items: ['CJC-1295 / Ipamorelin', 'GHRP-2', 'Hexarelin', 'IGF-1 LR3', 'Ipamorelin', 'PEO-MGF', 'Sermorelin', 'Tesamorelin', 'Tesamorelin / Ipamorelin'],
  },
  {
    name: 'Immune / Antimicrobial Peptides',
    subtitle: 'Immune & Inflammatory Regulation',
    color: '#DC2626',
    items: ['KPV', 'LL-37', 'Thymosin Alpha-1'],
  },
  {
    name: 'Cognitive & Mood Peptides / Compounds',
    subtitle: 'Neuroendocrine & Neurotransmitter Support',
    color: '#0891B2',
    items: ['Oxytocin', 'PT-141 (Bremelanotide)', 'Selank', 'Semax'],
  },
];

const starterPackages = [
  {
    name: '$5,000 Starter Package',
    price: '$5,000',
    wholesale: '~$5,479',
    retail: '~$25,000+',
    tier: 'Entry Level',
    desc: 'Entry-level bundle for new clinicians',
    focus: 'Weight loss (Tirzepatide & Retatrutide) + Longevity/Repair (MOTS-c, GHK-Cu, BPC-157, Epithalon)',
    detail: 'Enough vials for initial patient trials or small stocking.',
    bonus: '1 free Tirzepatide 15mg',
    highlight: false,
  },
  {
    name: '$10,000 Starter Package',
    price: '$10,000',
    wholesale: '~$10,958',
    retail: '~$50,000+',
    tier: 'Growth Tier',
    desc: 'Mid-tier bundle for growing clinics',
    focus: 'Higher volume in weight loss, mitochondrial health, longevity, and tissue repair',
    detail: 'Scales up for ongoing patient treatments.',
    bonus: '1 free Tirzepatide 15mg + 1 free Retatrutide 15mg',
    highlight: false,
  },
  {
    name: '$20,000 Starter Package',
    price: '$20,000',
    wholesale: '~$21,916',
    retail: '~$100,000+',
    tier: 'Most Popular',
    desc: 'High-volume bundle for established clinics',
    focus: 'Bulk supply in metabolic optimization, longevity, and repair',
    detail: 'Substantial stock for multiple patients.',
    bonus: '2 free Tirzepatide 15mg + 2 free Retatrutide 15mg',
    highlight: true,
  },
];

const protocols = [
  {
    name: 'Soft-Tissue Repair & Regenerative Support Protocol',
    tags: ['All Peptides', 'Metabolism / Weight Loss', 'Package', 'Popular Peptides', 'Protocol Packages'],
  },
  {
    name: 'Metabolic Health & Body Composition Comparison Protocol',
    tags: ['All Peptides', 'Metabolism / Weight Loss', 'Package', 'Popular Peptides', 'Protocol Packages'],
  },
  {
    name: 'Aesthetic & Tissue Regeneration Comparison Protocol',
    tags: ['All Peptides', 'Package', 'Popular Peptides', 'Protocol Packages'],
  },
];

export default function PeptidesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="py-14" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <span className="section-label text-yellow-300">Browse Catalog</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">All Peptides & Protocols</h1>
          <p className="text-gray-300 mt-2 text-sm max-w-xl">
            Clinical-grade compounds available exclusively to verified healthcare professionals and qualified researchers.
          </p>
        </div>
      </section>

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
                  {categories.map((cat) => (
                    <div key={cat.name} className="px-5 py-4">
                      <p className="text-sm font-bold mb-1" style={{ color: cat.color }}>
                        {cat.name}
                      </p>
                      <p className="text-xs italic mb-2" style={{ color: 'var(--text-light)' }}>
                        ({cat.subtitle})
                      </p>
                      <ul className="space-y-1">
                        {cat.items.map((item) => (
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
              ✦ Custom Formulations Available
            </div>

            {/* Starter Packages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {starterPackages.map((pkg) => (
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
                      href="/sign-in"
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
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)' }}>Essential Protocols</h2>
              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                Clinics may also purchase bundle packages with flexible vial ratios based on clinical focus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {protocols.map((protocol, i) => (
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
                      {protocol.tags.map((tag) => (
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
