'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'BPC-157 for shoulder pain',
  'I tore my rotator cuff, what now?',
  'What does GHK-Cu actually do?',
  'Reconstitute a 10mg vial',
  "What's the cleanest GLP alternative?",
  'Post-op healing stack',
  'Tirz vs Reta for weight loss',
];

const PHASE2 = [
  { label: 'DROP LABS (PDF/IMG)', sub: 'Bloodwork, DEXA, imaging reports', tag: 'PHASE 2' },
  { label: 'VOICE QUERY', sub: 'Talk it out. Transcribed + answered.', tag: 'PHASE 2' },
  { label: 'SAVE TO CHART', sub: 'Build a private, clinician-only record.', tag: 'SOON' },
];

export default function SherpaConsole() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Synchronous in-flight guard. React state updates are async, so back-to-back
  // submits could otherwise both pass `streaming === false` and race to write
  // to the same assistant message slot.
  const inFlightRef = useRef(false);

  // Auto-scroll transcript on new content while streaming.
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const ask = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Synchronous double-submit guard (the state-based `streaming` flag races
    // because setState is async).
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setError(null);
    const userMessage: Message = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        // Session expired mid-conversation — send the user back to login
        // and preserve return-to-Sherpa via ?next=.
        if (res.status === 401) {
          throw new Error('Your session has expired. [Sign in again](/account?next=/ai-sherpa) to keep going.');
        }
        // The chat route returns JSON error bodies for non-streaming failures
        // and plain text for streaming. Parse JSON when present so the user
        // doesn't see raw `{"error":"..."}` in the error bar.
        const raw = await res.text().catch(() => '');
        let message = raw || `Chat error ${res.status}`;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.error === 'string') message = parsed.error;
        } catch { /* not JSON — keep raw */ }
        throw new Error(message);
      }
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const out = [...prev];
          out[out.length - 1] = { role: 'assistant', content: assistantText };
          return out;
        });
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // user canceled — no error toast
      } else {
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setError(msg);
        // Remove the empty assistant placeholder if the request failed before any text streamed.
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          if (last.role === 'assistant' && last.content === '') return prev.slice(0, -1);
          return prev;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      inFlightRef.current = false;
    }
  }, [messages]);

  const stop = () => {
    abortRef.current?.abort();
  };

  const reset = () => {
    // Tear down any in-flight request and clear the UI in one synchronous
    // handler — don't wait for the aborted fetch's finally{} to flip flags.
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    setStreaming(false);
    setMessages([]);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  const hasConversation = messages.length > 0;

  return (
    <div style={{ background: '#06112E', minHeight: '100vh' }}>
      <div className="container-xl py-10 lg:py-14">
        <div
          className="relative rounded-2xl p-6 sm:p-10 lg:p-14"
          style={{
            background: 'linear-gradient(180deg, rgba(11,31,58,0.85) 0%, rgba(6,17,46,0.95) 100%)',
            border: '1.5px solid var(--gold)',
            boxShadow: '0 0 0 1px rgba(200,149,44,0.18), 0 30px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] font-mono" style={{ color: 'var(--gold)' }}>
              {'// SHERPA · RAG AI'}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] font-mono" style={{ color: '#22c55e' }}>Online</span>
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
          >
            ASK THE SHERPA.
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-3xl mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Drop a symptom. Ask about a stack. Get a protocol summary. AI Sherpa is grounded in the Peptide Pure protocol library, IRB-aligned research, and house clinical knowledge. It answers questions, surfaces protocols, and flags when you should escalate to a colleague. Logged queries are used to improve the model — not to track you.
          </p>

          {/* Query input */}
          <form
            onSubmit={onSubmit}
            className="flex flex-col sm:flex-row gap-3 mb-6 rounded-xl p-2"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--gold)' }}
          >
            <div className="flex items-start gap-3 flex-1 px-3 py-2">
              <span className="font-mono text-lg pt-0.5" style={{ color: 'var(--gold)' }}>{'>'}</span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                disabled={streaming}
                aria-label="Ask AI Sherpa"
                className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder:text-white/40 focus:outline-none resize-none font-mono"
                style={{ minHeight: '24px', maxHeight: '180px', lineHeight: 1.5 }}
                placeholder="e.g. patient is 52F with persistent rotator-cuff pain post-op, what's the highest-evidence protocol?"
              />
            </div>
            <div className="flex gap-2">
              {streaming && (
                <button
                  type="button"
                  onClick={stop}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                  style={{ background: 'rgba(220,38,38,0.18)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.5)' }}
                >
                  STOP
                </button>
              )}
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: streaming || !input.trim() ? 'rgba(200,149,44,0.35)' : 'var(--gold)',
                  color: 'var(--navy)',
                }}
              >
                {streaming ? 'THINKING…' : 'ASK →'}
              </button>
            </div>
          </form>

          {/* Suggestions */}
          {!hasConversation && (
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] font-mono mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {'// TRY ONE OF THESE'}
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    disabled={streaming}
                    className="px-3.5 py-2 rounded-lg text-xs font-mono transition-all hover:bg-white/10"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transcript */}
          {hasConversation && (
            <div
              ref={transcriptRef}
              className="rounded-xl p-5 mb-6 overflow-y-auto"
              style={{
                background: 'rgba(0,0,0,0.32)',
                border: '1px solid rgba(255,255,255,0.08)',
                maxHeight: '60vh',
              }}
            >
              {messages.map((m, i) => (
                <div key={i} className="mb-6 last:mb-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] font-mono mb-2" style={{ color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--gold)' }}>
                    {m.role === 'user' ? `${'//'} YOU` : `${'//'} SHERPA`}
                  </p>
                  {m.role === 'user' ? (
                    <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="sherpa-md text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.92)' }}>
                      {m.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      ) : (
                        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>retrieving protocol context…</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {error && (
                <div className="sherpa-md text-sm rounded-lg p-3 mt-3" style={{ background: 'rgba(220,38,38,0.12)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.35)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{error}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {hasConversation && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 text-xs font-mono">
              <button
                type="button"
                onClick={reset}
                className="px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                ↻ NEW SESSION
              </button>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                Responses cite [/protocols/&lt;slug&gt;] inline. Open in new tab to read the full protocol.
              </span>
            </div>
          )}

          {/* Phase 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {PHASE2.map((p) => (
              <div
                key={p.label}
                role="group"
                aria-disabled="true"
                aria-label={`${p.label} — coming soon`}
                className="rounded-xl p-4 flex items-start justify-between gap-3 cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  opacity: 0.55,
                }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {p.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.sub}</p>
                </div>
                <span
                  className="shrink-0 text-[9px] font-bold uppercase tracking-[0.16em] font-mono px-2 py-0.5 rounded"
                  style={{ background: 'rgba(200,149,44,0.14)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}
                >
                  {p.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Footer disclaimer */}
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] font-mono pt-4" style={{ color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            Sherpa is a research assistant for licensed clinicians — not a substitute for medical judgment. Emergencies → call 911.
          </p>
        </div>
      </div>

      {/* Scoped markdown styles for the dark transcript */}
      <style>{`
        .sherpa-md p { margin: 0 0 0.85em; }
        .sherpa-md p:last-child { margin-bottom: 0; }
        .sherpa-md h1, .sherpa-md h2, .sherpa-md h3, .sherpa-md h4 {
          color: white;
          font-weight: 700;
          margin: 1.2em 0 0.5em;
          font-family: var(--font-display);
        }
        .sherpa-md h2 { font-size: 1.05rem; }
        .sherpa-md h3 { font-size: 0.95rem; }
        .sherpa-md ul, .sherpa-md ol { margin: 0 0 0.85em 1.2em; }
        .sherpa-md li { margin: 0.25em 0; }
        .sherpa-md code {
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.10);
          padding: 0.08em 0.4em;
          border-radius: 4px;
          font-size: 0.85em;
          color: var(--gold);
        }
        .sherpa-md pre {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.10);
          padding: 0.85em 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 0 0 0.85em;
        }
        .sherpa-md pre code { background: none; border: none; padding: 0; color: rgba(255,255,255,0.9); }
        .sherpa-md a {
          color: var(--gold);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .sherpa-md a:hover { color: #f0c264; }
        .sherpa-md strong { color: white; }
        .sherpa-md blockquote {
          border-left: 2px solid var(--gold);
          padding-left: 0.85em;
          margin: 0 0 0.85em;
          color: rgba(255,255,255,0.75);
        }
        .sherpa-md table {
          border-collapse: collapse;
          width: 100%;
          margin: 0 0 0.85em;
          font-size: 0.85em;
        }
        .sherpa-md th, .sherpa-md td {
          border: 1px solid rgba(255,255,255,0.12);
          padding: 0.45em 0.7em;
          text-align: left;
        }
        .sherpa-md th { background: rgba(255,255,255,0.05); color: var(--gold); }
      `}</style>
    </div>
  );
}
