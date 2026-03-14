import Link from 'next/link';

export default function ProtocolsSection({ content }: { content: any }) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)' }}>{content.heading}</h2>
        <p className="text-sm" style={{ color: 'var(--text-light)' }}>
          {content.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {content.items.map((protocol: any, i: number) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="h-44 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              <div className="flex flex-col items-center gap-3 relative z-10">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5" className="opacity-60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Protocol Bundle</span>
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
    </>
  );
}
