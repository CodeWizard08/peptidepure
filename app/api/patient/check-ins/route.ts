import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('patient_check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  return NextResponse.json({ checkIns: data ?? [] });
}

function clamp(n: unknown, min: number, max: number): number | null {
  if (typeof n !== 'number' || isNaN(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const energy = clamp(body.energy_level, 1, 10);
  const sleep = clamp(body.sleep_quality, 1, 10);
  const mood = clamp(body.mood, 1, 10);
  const pain = clamp(body.pain_level, 1, 10);

  if (energy === null || sleep === null || mood === null || pain === null) {
    return NextResponse.json(
      { error: 'energy_level, sleep_quality, mood, and pain_level are required (1-10)' },
      { status: 400 }
    );
  }

  const weightLbs = typeof body.weight_lbs === 'number' && !isNaN(body.weight_lbs)
    ? Math.round(body.weight_lbs * 10) / 10
    : null;

  const { data, error } = await supabase
    .from('patient_check_ins')
    .insert({
      user_id: user.id,
      energy_level: energy,
      sleep_quality: sleep,
      mood,
      pain_level: pain,
      weight_lbs: weightLbs,
      notes: (body.notes ?? '').trim().slice(0, 2000) || null,
      goals_progress: (body.goals_progress ?? '').trim().slice(0, 2000) || null,
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('Check-in insert error:', error);
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
