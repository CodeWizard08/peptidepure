import Link from 'next/link';

/**
 * Anonymous-visitor variant of the Sherpa hero on /protocols. Matches the
 * dark gold-bordered framing of SherpaConsole but replaces the live input
 * with a sign-in CTA. We never render the input for anon users because the
 * /api/chat endpoint requires an authenticated session — a stub input would
 * just produce a 401 on submit.
 */
export default function SherpaSignedOut() {
  return (
    <section style={{ background: '#06112E' }} aria-labelledby="sherpa-signed-out-heading">
      <div className="container-xl py-10 lg:py-14">
        <div
          className="relative rounded-2xl p-6 sm:p-10 lg:p-14"
          style={{
            background: 'linear-gradient(180deg, rgba(11,31,58,0.85) 0%, rgba(6,17,46,0.95) 100%)',
            border: '1.5px solid var(--gold)',
            boxShadow: '0 0 0 1px rgba(200,149,44,0.18), 0 30px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] font-mono" style={{ color: 'var(--gold)' }}>
              {'// SHERPA · RAG AI'}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.5)' }} aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Sign in to use
              </span>
            </div>
          </div>

          <h2
            id="sherpa-signed-out-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
          >
            ASK THE SHERPA.
          </h2>

          <p className="text-sm sm:text-base leading-relaxed max-w-3xl mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            AI Sherpa is a clinician-only research assistant grounded in the Peptide Pure protocol library. Ask about a symptom, a stack, a reconstitution, or a contraindication — Sherpa answers with citations back to the underlying protocols. Sign in with your verified clinician account to use it.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              href="/account?next=/protocols"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            >
              Sign in to clinician account →
            </Link>
            <Link
              href="/account?next=/protocols#register-form"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              Apply for verified access
            </Link>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.22em] font-mono pt-4" style={{ color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            Sherpa is a research assistant for licensed clinicians — not a substitute for medical judgment. Emergencies → call 911.
          </p>
        </div>
      </div>
    </section>
  );
}
