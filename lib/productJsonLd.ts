import type { ProductRow } from './peptideConfig';

export function buildProductJsonLd(product: ProductRow, slug: string, baseName: string) {
  const meta = product.metadata ?? {};
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${baseName} — clinical-grade ${product.category} peptide.`,
    image: product.image_url ?? undefined,
    sku: product.sku ?? undefined,
    brand: { '@type': 'Brand', name: 'PeptidePure™' },
    category: product.category,
    url: `https://peptidepure.com/peptides/${slug}`,
    ...(product.price_cents > 0 ? {
      offers: {
        '@type': 'Offer',
        price: (product.price_cents / 100).toFixed(2),
        priceCurrency: 'USD',
        availability: (meta as any).inventory_status === 'oos' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'PeptidePure™' },
      },
    } : {}),
  };
}

export function buildBreadcrumbJsonLd(slug: string, baseName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://peptidepure.com' },
      { '@type': 'ListItem', position: 2, name: 'All Peptides', item: 'https://peptidepure.com/peptides' },
      { '@type': 'ListItem', position: 3, name: baseName, item: `https://peptidepure.com/peptides/${slug}` },
    ],
  };
}
