const coaList = [
  { compound: 'Ipamorelin, CJC-1295 no DAC', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-001' },
  { compound: 'MOTS-c 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-002' },
  { compound: 'Ipamorelin CJC-1295 no DAC', lab: 'Freedom Peptides', purity: '>99%', batch: 'FP-2024-001' },
  { compound: 'Ipamorelin CJC-1295 no DAC', lab: 'Freedom Peptides', purity: '>99%', batch: 'FP-2024-002' },
  { compound: 'Retatrutide', lab: 'Freedom Peptides', purity: '>99%', batch: 'FP-2024-003' },
  { compound: 'Retatrutide', lab: 'Freedom Peptides', purity: '>99%', batch: 'FP-2024-004' },
  { compound: 'BPC-157 (Bopaon) Arginate Salt 5mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-005' },
  { compound: 'BPC-157 (Bopaon) Arginate Salt 5mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-006' },
  { compound: 'Retatrutide 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-007' },
  { compound: 'Retatrutide 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-008' },
  { compound: 'Semax 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-009' },
  { compound: 'Retatrutide 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-010' },
  { compound: 'Tirzepatide 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-011' },
  { compound: 'Tirzepatide 5mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-012' },
  { compound: 'NAD+ (Nadide) 500mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-013' },
  { compound: 'Retatrutide 10mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-014' },
  { compound: 'BPC-157 x Thymosin A4', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-015' },
  { compound: 'GHK-Copper 32mg', lab: 'Peptide Sciences', purity: '>99%', batch: 'PS-2024-016' },
];

export default function COAPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl text-center">
          <span className="section-label text-yellow-300">Quality Assurance</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">
            Certificates of Analysis
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Every compound we supply is independently verified. Multi-lab testing ensures batch-level accuracy, identity confirmation, and purity above 99%.
          </p>
        </div>
      </section>

      {/* Quality badges */}
      <section className="py-8" style={{ background: 'var(--gold-pale)', borderBottom: '1px solid rgba(200,149,44,0.2)' }}>
        <div className="container-xl">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { label: 'Purity Guaranteed', value: '>99%' },
              { label: 'Testing Labs', value: 'Multi-Lab' },
              { label: 'Compliance', value: 'cGMP / ISO 9001' },
              { label: 'Traceability', value: 'Batch-Level' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{item.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-mid)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COA Grid */}
      <section className="py-16">
        <div className="container-xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>Available COAs</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                {coaList.length} certificates available
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}>
                All verified
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coaList.map((coa, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover"
                style={{ border: '1px solid var(--border)' }}
              >
                {/* COA document preview */}
                <div
                  className="h-52 flex items-center justify-center relative overflow-hidden"
                  style={{ background: '#f5f0eb' }}
                >
                  {/* Document mock */}
                  <div className="w-32 h-40 bg-white shadow-md rounded-sm relative flex flex-col">
                    {/* Header bar */}
                    <div className="h-6 w-full rounded-t-sm" style={{ background: 'var(--navy)' }}></div>
                    {/* COA chart mock */}
                    <div className="flex-1 p-2 flex flex-col gap-1">
                      <div className="h-1 rounded" style={{ background: 'var(--border)', width: '80%' }}></div>
                      <div className="h-1 rounded" style={{ background: 'var(--border)', width: '60%' }}></div>
                      <div className="h-1 rounded" style={{ background: 'var(--border)', width: '90%' }}></div>
                      <div className="mt-2 flex-1 rounded" style={{ background: 'var(--off-white)' }}>
                        {/* Chromatogram line */}
                        <svg width="100%" height="100%" viewBox="0 0 100 60">
                          <polyline points="0,50 20,45 40,10 50,48 70,46 100,48" fill="none" stroke="#C8952C" strokeWidth="1.5" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
                        </svg>
                      </div>
                      <div className="h-1 rounded" style={{ background: 'var(--border)', width: '70%' }}></div>
                    </div>
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.08 }}>
                      <span className="text-xs font-bold tracking-widest uppercase rotate-45" style={{ color: 'var(--navy)' }}>PEPTIDE PURE</span>
                    </div>
                  </div>
                  {/* Lab badge */}
                  <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md font-semibold" style={{ background: 'rgba(11,31,58,0.85)', color: 'var(--gold)' }}>
                    {coa.purity}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-1 leading-snug" style={{ color: 'var(--navy)' }}>{coa.compound}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>{coa.lab}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-light)' }}>{coa.batch}</span>
                  </div>
                  <button
                    className="mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors hover:opacity-90"
                    style={{ background: 'var(--off-white)', color: 'var(--navy)', border: '1px solid var(--border)' }}
                  >
                    View Full COA →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Additional COAs available upon request for verified account holders.{' '}
              <a href="/contact" className="underline" style={{ color: 'var(--gold)' }}>
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
