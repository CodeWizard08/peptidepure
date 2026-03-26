import PageHero from '@/components/sections/PageHero';

interface ShippingSection {
  type: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  extra?: string;
  columns?: string[];
  rows?: string[][];
}

export default function ShippingContent({ content }: { content: any }) {
  return (
    <>
      <PageHero sectionLabel={content.hero.sectionLabel} heading={content.hero.heading} subtitle={content.hero.subtitle} />

      <section className="py-16">
        <div className="container-xl max-w-3xl">
          <div className="space-y-10">
            {content.sections.map((section: ShippingSection, i: number) => (
              <div key={i}>
                {!section.paragraphs && !section.items && !section.columns ? (
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{section.title}</h2>
                ) : (
                  <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--gold)' }}>{section.title}</h2>
                )}

                {section.paragraphs && (
                  <div className="space-y-3">
                    {section.paragraphs.map((p: string, j: number) => (
                      <p key={j} className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}
                        dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="underline" style="color: var(--navy); font-weight: 700;">$1</strong>') }}
                      />
                    ))}
                  </div>
                )}

                {section.columns && section.rows && (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: 'var(--navy)' }}>
                          {section.columns.map((col: string, j: number) => (
                            <th key={j} className="text-left px-4 py-3 text-white font-semibold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row: string[], j: number) => (
                          <tr key={j} className={j % 2 === 0 ? 'bg-gray-50' : 'bg-white'} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            {row.map((cell: string, k: number) => (
                              <td key={k} className="px-4 py-3" style={{ color: k === 2 ? 'var(--gold)' : 'var(--text-mid)' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.items && (
                  <ul className="space-y-1.5 mt-3 ml-1">
                    {section.items.map((item: string, j: number) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--gold)' }} />
                        <span className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.extra && (
                  <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--text-mid)' }}>{section.extra}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
