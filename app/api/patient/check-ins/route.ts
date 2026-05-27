import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function score(n: unknown): number | null {
  if (!Number.isInteger(n)) return null;
  return (n as number) >= 1 && (n as number) <= 10 ? (n as number) : null;
}

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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const energy = score(body.energy_level);
  const sleep = score(body.sleep_quality);
  const mood = score(body.mood);
  const pain = score(body.pain_level);

  if (energy === null || sleep === null || mood === null || pain === null) {
    return NextResponse.json(
      { error: 'energy_level, sleep_quality, mood, and pain_level must be integers 1-10' },
      { status: 400 }
    );
  }

  let weightLbs: number | null = null;
  if (body.weight_lbs != null) {
    const w = typeof body.weight_lbs === 'number' ? body.weight_lbs : parseFloat(body.weight_lbs);
    if (isNaN(w) || w < 50 || w > 1000) {
      return NextResponse.json({ error: 'weight_lbs must be between 50 and 1000' }, { status: 400 });
    }
    weightLbs = Math.round(w * 10) / 10;
  }

  const { data, error } = await supabase
    .from('patient_check_ins')
    .insert({
      user_id: user.id,
      energy_level: energy,
      sleep_quality: sleep,
      mood,
      pain_level: pain,
      weight_lbs: weightLbs,
      notes: text(body.notes).slice(0, 2000) || null,
      goals_progress: text(body.goals_progress).slice(0, 2000) || null,
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('Check-in insert error:', error);
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
