import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getContent, writeContent } from '@/lib/content';
import { isAuthenticated } from '@/lib/admin-auth';
import { VALID_CONTENT_PAGES } from '@/lib/content-types';

// Map content-page slugs to the public routes they back, so saving via the
// admin panel busts the static cache on those routes immediately.
const PAGE_TO_ROUTES: Record<string, string[]> = {
  home: ['/'],
  'hero-slider': ['/'],
  footer: ['/'], // footer renders on every page
  peptides: ['/peptides'],
  'how-it-works': ['/how-it-works'],
  'our-company': ['/our-company'],
  coa: ['/coa'],
  contact: ['/contact'],
  privacy: ['/privacy'],
  terms: ['/terms'],
  legality: ['/legality'],
  'irb-consent': ['/irb-consent'],
  shipping: ['/shipping'],
  refunds: ['/refunds'],
  accessibility: ['/accessibility'],
  'peptide-dosing-safety': ['/peptide-dosing-safety'],
  'how-to-get-started': ['/how-to-get-started'],
  inventory: ['/inventory'],
};

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = request.nextUrl.searchParams.get('page');
  if (!page || !VALID_CONTENT_PAGES.includes(page as (typeof VALID_CONTENT_PAGES)[number])) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
  }

  try {
    const data = await getContent(page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = request.nextUrl.searchParams.get('page');
  if (!page || !VALID_CONTENT_PAGES.includes(page as (typeof VALID_CONTENT_PAGES)[number])) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
  }

  try {
    const body = await request.json();
    await writeContent(page, body);
    for (const route of PAGE_TO_ROUTES[page] ?? []) revalidatePath(route);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Content write error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Write failed', detail: message }, { status: 500 });
  }
}
