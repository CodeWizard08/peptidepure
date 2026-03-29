import { NextRequest, NextResponse } from 'next/server';
import { getContent, writeContent } from '@/lib/content';
import { isAuthenticated } from '@/lib/admin-auth';
import { VALID_CONTENT_PAGES } from '@/lib/content-types';

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
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Content write error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Write failed', detail: message }, { status: 500 });
  }
}
