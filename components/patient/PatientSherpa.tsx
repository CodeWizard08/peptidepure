'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'What is the STARTED protocol?',
  'How do I start the 12-Week Rollout?',
  'What should I eat to feel better?',
  'Why is sunlight so important?',
  'What labs should I ask my doctor about?',
  'How does cold exposure help?',
  'Tell me about Fabricated Adversity',
];

export default function PatientSherpa() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const wasStreamingRef = useRef(false);
  useEffect(() => {
    if (wasStreamingRef.current && !streaming) inputRef.current?.focus();
    wasStreamingRef.current = streaming;
  }, [streaming]);

  const ask = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || inFlightRef.current) return;
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
      const res = await fetch('/api/patient-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Your session has expired. [Sign in again](/p/intake) to keep going.');
        }
        const raw = await res.text().catch(() => '');
        let message = raw || `Error ${res.status}`;
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.error) message = parsed.error;
        } catch { /* not JSON */ }
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
      if ((err as Error).name !== 'AbortError') {
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setError(msg);
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

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    setStreaming(false);
    setMessages([]);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); ask(input); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); }
  };

  const hasConversation = messages.length > 0;
  const lastUserPrompt = useMemo(() => {
    if (!streaming || messages.length < 2) return '';
    const prev = messages[messages.length - 2];
    return prev.role === 'user' ? prev.content : '';
  }, [streaming, messages]);

  return (
    <div
      className="rounded-2xl p-5 sm:p-7"
      style={{ background: 'white', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--gold)' }}>
            Your Health Guide
          </p>
          <h3 className="text-lg font-bold" style={{ color: 'var(--navy)' }}>
            Ask me anything
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
            Grounded in The Cockroach Diet. Not medical advice — always check with your clinician.
          </p>
        </div>
        {hasConversation && (
          <button
            onClick={reset}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
            style={{ color: 'var(--text-mid)', border: '1px solid var(--border)' }}
          >
            New chat
          </button>
        )}
      </div>

      {/* Suggestions */}
      {!hasConversation && (
        <div className="flex flex-wrap gap-2 mb-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              disabled={streaming}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-gray-50"
              style={{
                background: 'var(--off-white)',
                color: 'var(--text-mid)',
                border: '1px solid var(--border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Transcript */}
      {hasConversation && (
        <div
          ref={transcriptRef}
          className="rounded-xl p-4 mb-4 overflow-y-auto"
          style={{ background: 'var(--off-white)', border: '1px solid var(--border)', maxHeight: '50vh' }}
        >
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isStreamingHere = streaming && isLast && m.role === 'assistant';
            return (
              <div key={i} className="mb-5 last:mb-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: m.role === 'user' ? 'var(--text-light)' : 'var(--gold)' }}>
                  {m.role === 'user' ? 'You' : 'Health Guide'}
                </p>
                {m.role === 'user' ? (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--navy)' }}>{m.content}</p>
                ) : m.content ? (
                  <div className="prose-product text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>Thinking...</span>
                  </div>
                )}
              </div>
            );
          })}
          {error && (
            <div className="text-sm rounded-lg p-3 mt-3" style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{error}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      {streaming ? (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: 'var(--gold)' }} />
          <p className="text-xs flex-1 truncate" style={{ color: 'var(--text-light)' }}>
            {lastUserPrompt || 'Thinking...'}
          </p>
          <button
            onClick={() => abortRef.current?.abort()}
            className="text-xs font-semibold px-2.5 py-1 rounded-md"
            style={{ color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            Stop
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex gap-2 rounded-xl p-1.5"
          style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            aria-label="Ask a question"
            className="flex-1 bg-transparent text-sm px-3 py-2 focus:outline-none"
            style={{ color: 'var(--navy)', minHeight: '24px', maxHeight: '120px', resize: 'none' }}
            placeholder="Ask about your health journey..."
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0"
            style={{
              background: !input.trim() ? 'var(--border)' : 'var(--gold)',
              color: !input.trim() ? 'var(--text-light)' : 'var(--navy)',
            }}
          >
            Ask
          </button>
        </form>
      )}
    </div>
  );
}
