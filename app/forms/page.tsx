import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Capture — PeptidePure™',
  description:
    'Clinical data capture tools: SOAP notes, IRB baseline assessments, treatment logs, adverse event reports, and patient outcomes.',
};

const forms = [
  {
    href: '/forms/soap-capture',
    title: 'SOAP Data Capture',
    subtitle: 'Primary clinical documentation tool',
    description:
      'Paste or type your clinical notes and instantly extract structured vitals, labs, body composition, medications, PROs, and adverse events. Export as CSV, JSON, or PDF.',
    featured: true,
    color: '#C8952C',
    tags: ['Auto-extraction', 'PDF export', 'IRB-ready'],
  },
  {
    href: '/forms/baseline',
    title: 'IRB — Baseline Assessment',
    subtitle: 'Patient enrollment',
    description:
      'Complete within 7 days of enrolling a patient. Captures demographics, medical history, current medications, and baseline lab values.',
    color: '#0B1F3A',
    tags: ['MMRN-001-2025'],
  },
  {
    href: '/forms/treatment-log',
    title: 'IRB — Treatment Log',
    subtitle: 'Per-visit documentation',
    description:
      'Submit after each treatment visit. Records peptide administered, dosage, route, injection site, and any immediate observations.',
    color: '#0B1F3A',
    tags: ['MMRN-001-2025'],
  },
  {
    href: '/forms/ae-sae-report',
    title: 'IRB — AE / SAE Report',
    subtitle: 'Adverse event reporting',
    description:
      'Submit within 24 hours of any adverse event. Captures severity, duration, resolution, and relatedness to study product.',
    color: '#dc2626',
    tags: ['Required within 24h'],
  },
  {
    href: '/forms/outcomes',
    title: 'Patient Outcomes',
    subtitle: 'Follow-up reporting',
    description:
      'Submit 90-day and 180-day follow-up reports. Tracks treatment efficacy, patient-reported outcomes, and long-term safety data.',
    color: '#0B1F3A',
    tags: ['90-day', '180-day'],
  },
];

export default function DataCapturePage() {
  return (
    <>
      {/* Hero */}
      <div className="py-12" style={{ background: 'var(--navy)' }}>
        <div className="container-xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--gold)' }}
            >
              Clinical Tools
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Data Capture</h1>
          <p
            className="text-sm mt-2 max-w-xl"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Structured clinical data collection for the Mortensen Medical
            Research Network. Start with the SOAP form for intelligent note
            extraction, or scroll to access IRB documentation forms.
          </p>
        </div>
      </div>

      <section className="py-12" style={{ background: 'var(--off-white)' }}>
        <div className="container-xl max-w-5xl">
          {/* Featured: SOAP */}
          {forms
            .filter((f) => f.featured)
            .map((form) => (
              <Link
                key={form.href}
                href={form.href}
                className="block rounded-2xl p-8 md:p-10 mb-10 transition-all duration-200 hover:shadow-lg group"
                style={{
                  background: 'white',
                  border: '2px solid var(--gold)',
                  boxShadow: '0 4px 24px rgba(200,149,44,0.08)',
                }}
              >
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{
                          background: 'var(--gold-pale)',
                          color: 'var(--gold)',
                        }}
                      >
                        Recommended
                      </span>
                    </div>
                    <h2
                      className="text-2xl font-bold mb-1"
                      style={{ color: 'var(--navy)' }}
                    >
                      {form.title}
                    </h2>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: 'var(--gold)' }}
                    >
                      {form.subtitle}
                    </p>
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: 'var(--text-mid)' }}
                    >
                      {form.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: 'var(--gold-pale)',
                            color: 'var(--gold)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: 'var(--gold-pale)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--gold)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-light)' }}
            >
              IRB &amp; Outcome Forms
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          {/* Other forms grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {forms
              .filter((f) => !f.featured)
              .map((form) => (
                <Link
                  key={form.href}
                  href={form.href}
                  className="block rounded-xl p-6 transition-all duration-200 hover:shadow-md group"
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          form.color === '#dc2626'
                            ? 'rgba(220,38,38,0.08)'
                            : 'rgba(11,31,58,0.06)',
                      }}
                    >
                      <svg
                        className="w-4.5 h-4.5"
                        style={{ color: form.color }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-base font-bold mb-0.5"
                        style={{ color: 'var(--navy)' }}
                      >
                        {form.title}
                      </h3>
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: 'var(--text-light)' }}
                      >
                        {form.subtitle}
                      </p>
                      <p
                        className="text-sm leading-relaxed mb-3"
                        style={{ color: 'var(--text-mid)' }}
                      >
                        {form.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{
                              background: 'var(--off-white)',
                              color: 'var(--text-light)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
                      style={{ color: 'var(--text-light)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
