'use client';

import { useState, useCallback, useRef } from 'react';

/* ── Types ──────────────────────────────────────────────── */
type CoaRecord = {
  compound: string;
  peptide: string;
  lab: string;
  purity: string;
  batch: string;
  date: string;
  pdf: string;
};

type SummaryEntry = {
  compound: string;
  date: string;
  purity: number;
  lab?: string;
};

type ExtractedData = {
  record: CoaRecord;
  summaryChart: SummaryEntry[];
};

type ExistingData = {
  records: CoaRecord[];
  summaryChart: SummaryEntry[];
};

/* ── Helpers ─────────────────────────────────────────────── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeInUp_0.3s_ease]"
      style={{
        background: type === 'success' ? '#065F46' : '#991B1B',
        color: 'white',
      }}
    >
      {type === 'success' ? (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
        </svg>
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminCoaPanel() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [labName, setLabName] = useState('');
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [pdfPath, setPdfPath] = useState('');
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<ExistingData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load existing COA data on first render
  const loadExisting = useCallback(async () => {
    try {
      const res = await fetch('/api/content?page=coa');
      if (res.ok) {
        const data = await res.json();
        setExisting({ records: data.records || [], summaryChart: data.summaryChart || [] });
      }
    } catch { /* silent */ }
  }, []);

  // Load on mount
  useState(() => { loadExisting(); });

  /* ── Upload & Extract ─────────────────────────────────── */
  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      showToast('Please upload a PDF file', 'error');
      return;
    }

    setUploading(true);
    setExtracted(null);

    const form = new FormData();
    form.append('pdf', file);
    if (labName.trim()) form.append('lab', labName.trim());

    try {
      const res = await fetch('/api/admin/coa-extract', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Upload failed', 'error');
        setUploading(false);
        return;
      }

      setExtracted(data.extracted);
      setPdfPath(data.pdfPath);
      showToast('PDF extracted successfully — review the data below', 'success');
    } catch {
      showToast('Network error during upload', 'error');
    }
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  /* ── Edit extracted data ──────────────────────────────── */
  const updateRecord = (field: keyof CoaRecord, value: string) => {
    if (!extracted) return;
    setExtracted({
      ...extracted,
      record: { ...extracted.record, [field]: value },
    });
  };

  const updateSummary = (index: number, field: keyof SummaryEntry, value: string | number) => {
    if (!extracted) return;
    const updated = [...extracted.summaryChart];
    updated[index] = { ...updated[index], [field]: field === 'purity' ? parseFloat(value as string) || 0 : value };
    setExtracted({ ...extracted, summaryChart: updated });
  };

  const removeSummary = (index: number) => {
    if (!extracted) return;
    setExtracted({
      ...extracted,
      summaryChart: extracted.summaryChart.filter((_, i) => i !== index),
    });
  };

  const addSummary = () => {
    if (!extracted) return;
    setExtracted({
      ...extracted,
      summaryChart: [
        ...extracted.summaryChart,
        { compound: '', date: extracted.record.date || '', purity: 0, lab: extracted.record.lab || '' },
      ],
    });
  };

  /* ── Save to coa.json ─────────────────────────────────── */
  const handleSave = async () => {
    if (!extracted) return;
    setSaving(true);

    try {
      // Get current coa.json
      const getRes = await fetch('/api/content?page=coa');
      if (!getRes.ok) throw new Error('Failed to load COA data');
      const coaData = await getRes.json();

      // Append new record and summary entries
      coaData.records = [extracted.record, ...(coaData.records || [])];
      coaData.summaryChart = [...(extracted.summaryChart || []), ...(coaData.summaryChart || [])];

      // Save back
      const putRes = await fetch('/api/content?page=coa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coaData),
      });

      if (!putRes.ok) throw new Error('Failed to save');

      showToast('COA data saved successfully', 'success');
      setExtracted(null);
      setPdfPath('');
      loadExisting();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    }
    setSaving(false);
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>
          Quality Assurance
        </p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
          COA Manager
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
          Upload a COA PDF and AI will extract the purity data. Review, edit, then save.
        </p>
      </div>

      {/* Lab name input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
          Lab / Source Name (optional — helps AI identify the source)
        </label>
        <input
          type="text"
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
          placeholder="e.g. Freedom Diagnostics, MZ BioLabs, Vanguard Laboratory"
          className="w-full max-w-md px-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--navy)' }}
        />
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{
          border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--border)'}`,
          background: dragOver ? 'var(--gold-pale)' : 'white',
        }}
      >
        <input ref={fileRef} type="file" accept=".pdf" onChange={onFileChange} className="hidden" />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid var(--border)', borderTopColor: 'var(--gold)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--navy)' }}>
              Extracting data from PDF…
            </p>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              Parsing text and running AI extraction
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--gold-pale)' }}
            >
              <svg width="28" height="28" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>
                Drop a COA PDF here or click to browse
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                The file will be saved to /public/coa/ and data extracted automatically
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Extracted Data Review ──────────────────────── */}
      {extracted && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
              Extracted Data — Review & Edit
            </h2>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#ECFDF5', color: '#065F46' }}>
              PDF saved to {pdfPath}
            </span>
          </div>

          {/* Record fields */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-mid)' }}>
              COA Record (batch-level entry)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                ['compound', 'Compound Description'],
                ['peptide', 'Peptide / Filter Name'],
                ['lab', 'Lab Name'],
                ['purity', 'Overall Purity'],
                ['batch', 'Batch Number'],
                ['date', 'Date (YYYY-MM-DD)'],
                ['pdf', 'PDF Path'],
              ] as const).map(([field, label]) => (
                <div key={field} className={field === 'compound' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={extracted.record[field]}
                    onChange={(e) => updateRecord(field, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--navy)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary Chart entries */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'white', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-mid)' }}>
                Individual Compound Purity ({extracted.summaryChart.length} entries)
              </h3>
              <button
                onClick={addSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 5v14m7-7H5" />
                </svg>
                Add Entry
              </button>
            </div>

            <div className="space-y-3">
              {extracted.summaryChart.map((entry, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px_auto] gap-3 items-end p-3 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                      Compound
                    </label>
                    <input
                      type="text"
                      value={entry.compound}
                      onChange={(e) => updateSummary(i, 'compound', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                      style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--navy)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                      Date
                    </label>
                    <input
                      type="text"
                      value={entry.date}
                      onChange={(e) => updateSummary(i, 'date', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                      style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--navy)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-light)' }}>
                      Purity %
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={entry.purity}
                      onChange={(e) => updateSummary(i, 'purity', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                      style={{
                        border: '1px solid var(--border)',
                        background: 'white',
                        color: entry.purity >= 99 ? '#065F46' : entry.purity >= 98 ? '#92400E' : '#991B1B',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeSummary(i)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                    style={{ color: '#EF4444' }}
                    title="Remove entry"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save / Discard */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving…' : 'Save to COA Data'}
            </button>
            <button
              onClick={() => { setExtracted(null); setPdfPath(''); }}
              className="btn-outline"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Existing Records ──────────────────────────── */}
      {existing && existing.records.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--navy)' }}>
            Existing COA Records ({existing.records.length})
          </h2>
          <div className="space-y-2">
            {existing.records.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--navy)' }}
                >
                  <svg width="18" height="18" fill="none" stroke="var(--gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--navy)' }}>
                    {r.lab}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-light)' }}>
                    {r.compound}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: '#065F46' }}>{r.purity}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-light)' }}>{r.date}</p>
                </div>
                <a
                  href={r.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: 'var(--text-mid)' }}
                  title="View PDF"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
