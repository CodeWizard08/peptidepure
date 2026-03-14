import Link from 'next/link';

type CategoryConfig = Record<string, { color: string; subtitle: string }>;

export default function CategorySidebar({
  categoryMap,
  CATEGORY_CONFIG,
}: {
  categoryMap: Map<string, { id: string; name: string; slug: string }[]>;
  CATEGORY_CONFIG: CategoryConfig;
}) {
  return (
    <aside className="lg:w-64 shrink-0">
      <div className="sticky top-20">
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ background: 'var(--navy)' }}>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Categories</h3>
          </div>
          <div className="bg-white divide-y divide-gray-100">
            {Array.from(categoryMap.entries()).map(([category, items]) => {
              const config = CATEGORY_CONFIG[category] ?? { color: 'var(--navy)', subtitle: category };
              return (
                <div key={category} className="px-5 py-4">
                  <p className="text-sm font-bold mb-1" style={{ color: config.color }}>
                    {category}
                  </p>
                  <p className="text-xs italic mb-2" style={{ color: 'var(--text-light)' }}>
                    ({config.subtitle})
                  </p>
                  <ul className="space-y-1">
                    {items.map((product) => (
                      <li key={product.id}>
                        <Link href={`/peptides/${product.slug}`} className="text-xs hover:underline" style={{ color: 'var(--text-mid)' }}>
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
