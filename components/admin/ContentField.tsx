'use client';

export function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

export function updateAtPath(obj: any, path: string[], value: unknown): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const idx = parseInt(head, 10);
    const newArr = [...obj];
    newArr[idx] = updateAtPath(obj[idx], rest, value);
    return newArr;
  }
  return { ...obj, [head]: updateAtPath(obj?.[head], rest, value) };
}

export default function ContentField({ label, path, value, onChange, depth = 0 }: {
  label: string; path: string[]; value: unknown; onChange: (path: string[], value: unknown) => void; depth?: number;
}) {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') {
    const isLong = value.length > 80;
    return (
      <div className="mb-3">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>{label}</label>
        {isLong ? (
          <textarea value={value} onChange={(e) => onChange(path, e.target.value)} rows={Math.min(6, Math.ceil(value.length / 80))} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }} />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(path, e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }} />
        )}
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="mb-3">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-mid)' }}>{label}</label>
        <input type="number" value={value} onChange={(e) => onChange(path, Number(e.target.value))} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)', maxWidth: '200px' }} />
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="mb-3 flex items-center gap-2">
        <input type="checkbox" checked={value} onChange={(e) => onChange(path, e.target.checked)} className="w-4 h-4 rounded" />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-mid)' }}>{label}</label>
      </div>
    );
  }

  if (Array.isArray(value) && (value.length === 0 || typeof value[0] === 'string')) {
    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-mid)' }}>{label} ({value.length} items)</label>
        <div className="space-y-1.5">
          {value.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={item} onChange={(e) => onChange([...path, String(i)], e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg text-sm focus:outline-none" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-dark)' }} />
              <button onClick={() => onChange(path, value.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded" title="Remove">✕</button>
            </div>
          ))}
        </div>
        <button onClick={() => onChange(path, [...value, ''])} className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)', background: 'var(--gold-pale)' }}>+ Add Item</button>
      </div>
    );
  }

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-mid)' }}>{label} ({value.length} items)</label>
        <div className="space-y-3">
          {value.map((item: any, i: number) => (
            <div key={i} className="rounded-xl p-4 relative" style={{ background: depth % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'var(--off-white)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: 'var(--navy)' }}>#{i + 1}</span>
                <button onClick={() => onChange(path, value.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded" title="Remove">✕ Remove</button>
              </div>
              {Object.entries(item).map(([k, v]) => (
                <ContentField key={k} label={humanize(k)} path={[...path, String(i), k]} value={v} onChange={onChange} depth={depth + 1} />
              ))}
            </div>
          ))}
        </div>
        <button onClick={() => { const template = Object.fromEntries(Object.entries(value[0]).map(([k, v]) => [k, typeof v === 'string' ? '' : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : Array.isArray(v) ? [] : v])); onChange(path, [...value, template]); }} className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)', background: 'var(--gold-pale)' }}>+ Add Entry</button>
      </div>
    );
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <details className="mb-4" open={depth < 2}>
        <summary className="cursor-pointer text-sm font-bold mb-3 select-none flex items-center gap-2" style={{ color: 'var(--navy)' }}>
          <span className="text-xs" style={{ color: 'var(--gold)' }}>▸</span>{label}
        </summary>
        <div className="pl-4 ml-2 rounded-lg" style={{ borderLeft: '2px solid rgba(200,149,44,0.2)' }}>
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <ContentField key={k} label={humanize(k)} path={[...path, k]} value={v} onChange={onChange} depth={depth + 1} />
          ))}
        </div>
      </details>
    );
  }

  return null;
}
