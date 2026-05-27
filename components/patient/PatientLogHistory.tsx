'use client';

import { useState, useEffect } from 'react';

type DosingLog = {
  id: string;
  created_at: string;
  peptide_name: string;
  dose_amount: string;
  route: string;
  side_effects: string[];
};

type CheckIn = {
  id: string;
  created_at: string;
  energy_level: number;
  sleep_quality: number;
  mood: number;
  pain_level: number;
  weight_lbs: number | null;
  notes: string | null;
  goals_progress: string | null;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function ScoreDot({ value, label }: { value: number; label: string }) {
  const pct = (value / 10) * 100;
  const color = value >= 7 ? '#10B981' : value >= 4 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] w-10" style={{ color: 'var(--text-light)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold w-4 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

export default function PatientLogHistory({
  newLogs,
  newCheckIns,
}: {
  newLogs: DosingLog[];
  newCheckIns: CheckIn[];
}) {
  const [logs, setLogs] = useState<DosingLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/patient/dosing-logs').then((r) => r.ok ? r.json() : { logs: [] }),
      fetch('/api/patient/check-ins').then((r) => r.ok ? r.json() : { checkIns: [] }),
    ]).then(([logsData, checkInsData]) => {
      setLogs(logsData.logs ?? []);
      setCheckIns(checkInsData.checkIns ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const allLogs = [...newLogs, ...logs.filter((l) => !newLogs.some((n) => n.id === l.id))].slice(0, 5);
  const allCheckIns = [...newCheckIns, ...checkIns.filter((c) => !newCheckIns.some((n) => n.id === c.id))].slice(0, 5);

  if (loading) return null;
  if (allLogs.length === 0 && allCheckIns.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      {allLogs.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
            Recent doses
          </h3>
          <div className="space-y-2">
            {allLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 text-xs py-2"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span className="shrink-0 font-semibold" style={{ color: 'var(--navy)' }}>
                  {log.peptide_name}
                </span>
                <span style={{ color: 'var(--text-mid)' }}>{log.dose_amount}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  style={{ background: 'var(--off-white)', color: 'var(--text-light)' }}
                >
                  {log.route}
                </span>
                {log.side_effects.length > 0 && (
                  <span className="text-[10px]" style={{ color: '#DC2626' }}>
                    {log.side_effects.join(', ')}
                  </span>
                )}
                <span className="ml-auto shrink-0" style={{ color: 'var(--text-light)' }}>
                  {fmtDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allCheckIns.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'white', border: '1px solid var(--border)' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-light)' }}>
            Recent check-ins
          </h3>
          <div className="space-y-4">
            {allCheckIns.map((ci) => (
              <div key={ci.id} className="pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-[10px] mb-2" style={{ color: 'var(--text-light)' }}>
                  {fmtDate(ci.created_at)}
                  {ci.weight_lbs && <> · {ci.weight_lbs} lbs</>}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <ScoreDot value={ci.energy_level} label="Energy" />
                  <ScoreDot value={ci.sleep_quality} label="Sleep" />
                  <ScoreDot value={ci.mood} label="Mood" />
                  <ScoreDot value={ci.pain_level} label="Pain" />
                </div>
                {ci.goals_progress && (
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-mid)' }}>
                    {ci.goals_progress}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
