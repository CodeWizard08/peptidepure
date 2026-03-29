import type { HowItWorksContent } from '@/lib/content-types';

export default function EducationalFocus({ content }: { content: HowItWorksContent }) {
  return (
    <section className="py-16" style={{ background: 'var(--off-white)' }}>
      <div className="container-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Educational */}
          <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--gold-pale)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--navy)' }}>{content.educationalFocus.heading}</h3>
            <ul className="space-y-2.5">
              {content.educationalFocus.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            {/* Create Account */}
            <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--gold-pale)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--navy)' }}>{content.createAccount.heading}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                {content.createAccount.description}
              </p>
            </div>
            {/* After Verification */}
            <div className="rounded-2xl p-8" style={{ background: 'var(--navy)' }}>
              <h3 className="text-lg font-bold mb-4 text-white">{content.afterVerification.heading}</h3>
              <ul className="space-y-2">
                {content.afterVerification.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
