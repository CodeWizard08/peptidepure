import Link from 'next/link';

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: string;
};

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="container-xl py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="section-label">More from this category</span>
          <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--navy)' }}>Related Products</h2>
        </div>
        <Link href="/peptides" className="text-sm font-medium hover:underline hidden sm:block" style={{ color: 'var(--gold)' }}>
          View all peptides &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/peptides/${item.slug}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col group"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="h-44 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0B1F3A, #1a3a6b)' }}>
              <img
                src={item.image_url || '/images/oral-peptides.png'}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--navy)' }}>{item.name}</h3>
              {item.description && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-mid)' }}>
                  {item.description}
                </p>
              )}
              <span
                className="mt-auto text-center py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
                style={{ background: 'var(--navy)' }}
              >
                View Details
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
