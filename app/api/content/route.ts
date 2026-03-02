import { NextRequest, NextResponse } from 'next/server';
import { getContent, writeContent } from '@/lib/content';

const VALID_PAGES = [
  'home', 'hero-slider', 'peptides', 'how-it-works',
  'our-company', 'coa', 'contact', 'footer',
];

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const page = request.nextUrl.searchParams.get('page');
  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
  }

  try {
    const data = getContent(page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }

  const page = request.nextUrl.searchParams.get('page');
  if (!page || !VALID_PAGES.includes(page)) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
  }

  try {
    const body = await request.json();
    writeContent(page, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 });
  }
}
