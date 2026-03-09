export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatOrderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
