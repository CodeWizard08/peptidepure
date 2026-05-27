'use client';

import { useState, useCallback } from 'react';

const INPUT_CLS = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none';
const INPUT_STYLE: React.CSSProperties = { background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--navy)' };

type CheckIn = { id: string; created_at: string; energy_level: number; sleep_quality: number; mood: number; pain_level: number; weight_lbs: number | null; notes: string | null; goals_progress: string | null };

function ScaleInput({ label, value, onChange, lowLabel, highLabel }: {
  label: string; value: number; onChange: (n: number) => void; lowLabel: string; highLabel: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-mid)' }}>
        {label}: <strong style={{ color: 'var(--navy)' }}>{value}</strong>
      </label>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-[var(--gold)]"
      />
      <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-light)' }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default function CheckInForm({ onCheckedIn }: { onCheckedIn: (entry: CheckIn) => void }) {
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [mood, setMood] = useState(5);
  const [pain, setPain] = useState(1);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [goals, setGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const reset = () => {
    setEnergy(5); setSleep(5); setMood(5); setPain(1);
    setWeight(''); setNotes(''); setGoals(''); setError('');
  };

  const submit = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/patient/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energy_level: energy,
          sleep_quality: sleep,
          mood,
          pain_level: pain,
          weight_lbs: weight ? parseFloat(weight) : undefined,
          notes: notes || undefined,
          goals_progress: goals || undefined,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Failed to save');
      }
      const data = await res.json();
      onCheckedIn({
        id: data.id,
        created_at: data.created_at,
        energy_level: energy,
        sleep_quality: sleep,
        mood,
        pain_level: pain,
        weight_lbs: weight ? parseFloat(weight) : null,
        notes: notes || null,
        goals_progress: goals || null,
      });
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [energy, sleep, mood, pain, weight, notes, goals, onCheckedIn]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
            Weekly check-in
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
            How are you feeling?
          </p>
        </div>
        <svg
          className="w-4 h-4 transition-transform shrink-0"
          style={{ color: 'var(--text-light)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="pt-4 space-y-4">
            <ScaleInput label="Energy" value={energy} onChange={setEnergy} lowLabel="Exhausted" highLabel="Boundless" />
            <ScaleInput label="Sleep quality" value={sleep} onChange={setSleep} lowLabel="Terrible" highLabel="Perfect" />
            <ScaleInput label="Mood" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
            <ScaleInput label="Pain level" value={pain} onChange={setPain} lowLabel="None" highLabel="Severe" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
                Weight (lbs, optional)
              </label>
              <input
                type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 185" className={INPUT_CLS} style={INPUT_STYLE}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
              How are your goals progressing?
            </label>
            <textarea
              rows={2} value={goals} onChange={(e) => setGoals(e.target.value)}
              placeholder="What's improving? What's still hard?" className={INPUT_CLS} style={INPUT_STYLE}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
              Anything else to note?
            </label>
            <textarea
              rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Side effects, milestones, questions for your clinician..." className={INPUT_CLS} style={INPUT_STYLE}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626' }}>
              {error}
            </p>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary text-sm w-full sm:w-auto"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Saving...' : 'Submit check-in'}
          </button>
        </div>
      )}
    </div>
  );
}
