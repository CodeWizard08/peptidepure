import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_ROUTES = new Set(['SQ', 'IM', 'oral', 'nasal', 'topical', 'nebulized', 'other']);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('patient_dosing_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  return NextResponse.json({ logs: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const peptideName = (body.peptide_name ?? '').trim();
  const doseAmount = (body.dose_amount ?? '').trim();
  const route = body.route ?? 'SQ';

  if (!peptideName || peptideName.length > 200) {
    return NextResponse.json({ error: 'peptide_name is required (max 200 chars)' }, { status: 400 });
  }
  if (!doseAmount || doseAmount.length > 100) {
    return NextResponse.json({ error: 'dose_amount is required (max 100 chars)' }, { status: 400 });
  }
  if (!VALID_ROUTES.has(route)) {
    return NextResponse.json({ error: `route must be one of: ${Array.from(VALID_ROUTES).join(', ')}` }, { status: 400 });
  }

  const sideEffects = Array.isArray(body.side_effects)
    ? body.side_effects.filter((s: unknown): s is string => typeof s === 'string' && s.length <= 200)
    : [];

  const { data, error } = await supabase
    .from('patient_dosing_logs')
    .insert({
      user_id: user.id,
      peptide_name: peptideName,
      dose_amount: doseAmount,
      route,
      injection_site: (body.injection_site ?? '').trim().slice(0, 200) || null,
      notes: (body.notes ?? '').trim().slice(0, 2000) || null,
      side_effects: sideEffects,
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('Dosing log insert error:', error);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
