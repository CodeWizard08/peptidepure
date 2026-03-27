'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'BPC-157 dosing protocol',
  'Reconstitution formula',
  'TIRZ + semaglutide stack',
  'TB-500 injection site',
  'CJC-1295 vs Ipamorelin',
];

const BOT_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <path d="M8 15h.01M12 15h.01M16 15h.01" />
  </svg>
);

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--navy)' }}>
        {BOT_ICON}
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: '#F1F5F9' }}>
        <span className="flex gap-1 items-center h-4">
          <span className="typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot" style={{ animationDelay: '150ms' }} />
          <span className="typing-dot" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2.5 mb-5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'var(--navy)' }}>
          {BOT_ICON}
        </div>
      )}
      <div
        className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: isUser ? 'var(--navy)' : '#F1F5F9',
          color: isUser ? 'white' : 'var(--navy)',
          maxWidth: '82%',
          borderBottomRightRadius: isUser ? '4px' : undefined,
          borderBottomLeftRadius: !isUser ? '4px' : undefined,
        }}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <div className="chat-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [unread, setUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnread(false);
    }
  }, [open]);

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;
    if (!loggedIn) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Request failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }

      if (!open) setUnread(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof Error ? `**Error:** ${err.message}` : 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #94A3B8; display: inline-block;
          animation: typing-bounce 1.2s infinite ease-in-out;
        }
        @keyframes chat-slide-up {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .chat-panel { animation: chat-slide-up 0.22s ease-out forwards; }

        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        .unread-pulse::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: var(--gold);
          animation: pulse-ring 1.5s ease-out infinite; z-index: -1;
        }

        /* ── Markdown styles inside chat bubbles ── */
        .chat-md { font-size: 0.8125rem; line-height: 1.6; color: var(--navy); }
        .chat-md p { margin: 0 0 0.55em; }
        .chat-md p:last-child { margin-bottom: 0; }
        .chat-md strong { font-weight: 650; color: var(--navy); }
        .chat-md em { font-style: italic; }
        .chat-md ul, .chat-md ol { margin: 0.4em 0 0.55em 1.1em; padding: 0; }
        .chat-md li { margin-bottom: 0.2em; }
        .chat-md ul li { list-style-type: disc; }
        .chat-md ol li { list-style-type: decimal; }
        .chat-md h1, .chat-md h2, .chat-md h3 {
          font-weight: 700; margin: 0.7em 0 0.3em;
          color: var(--navy); line-height: 1.3;
        }
        .chat-md h1 { font-size: 1em; }
        .chat-md h2 { font-size: 0.9375em; }
        .chat-md h3 { font-size: 0.875em; }
        .chat-md code {
          font-family: ui-monospace, monospace;
          font-size: 0.8em;
          background: rgba(11,31,58,0.07);
          border-radius: 4px;
          padding: 0.1em 0.35em;
          color: var(--navy);
        }
        .chat-md pre {
          background: rgba(11,31,58,0.06);
          border-radius: 8px;
          padding: 0.75em 1em;
          overflow-x: auto;
          margin: 0.5em 0;
        }
        .chat-md pre code {
          background: none; padding: 0; font-size: 0.8125em;
        }
        .chat-md blockquote {
          border-left: 3px solid var(--gold);
          margin: 0.5em 0;
          padding: 0.25em 0.75em;
          background: rgba(200,149,44,0.06);
          border-radius: 0 6px 6px 0;
          color: var(--text-mid);
          font-style: italic;
        }
        .chat-md hr {
          border: none; border-top: 1px solid var(--border);
          margin: 0.6em 0;
        }
        .chat-md table {
          width: 100%; border-collapse: collapse;
          font-size: 0.8em; margin: 0.5em 0;
        }
        .chat-md th {
          background: rgba(11,31,58,0.07);
          padding: 0.3em 0.6em;
          text-align: left; font-weight: 600;
          border: 1px solid var(--border);
        }
        .chat-md td {
          padding: 0.3em 0.6em;
          border: 1px solid var(--border);
        }
        .chat-md tr:nth-child(even) td { background: rgba(11,31,58,0.03); }
        .chat-md a { color: var(--gold); text-decoration: underline; }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open PeptidePure AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'var(--navy)', border: '2px solid var(--gold)' }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {unread && (
              <span
                className="unread-pulse"
                style={{ position: 'absolute', top: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gold)', border: '2px solid white' }}
              />
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="chat-panel fixed z-40 flex flex-col shadow-2xl"
          style={{
            bottom: '92px',
            right: '24px',
            width: '460px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 112px)',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{ background: 'var(--navy)', borderBottom: '2px solid var(--gold)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(200,149,44,0.18)', border: '1.5px solid var(--gold)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <path d="M8 15h.01M12 15h.01M16 15h.01" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm leading-tight tracking-wide">PeptidePure AI</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {streaming ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Typing…
                  </span>
                ) : 'Clinical peptide assistant'}
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Clear conversation"
              className="text-xs px-2.5 py-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
            {isEmpty && (
              <div className="flex flex-col items-center text-center pt-6 pb-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(11,31,58,0.06)', border: '1.5px solid var(--border)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <path d="M8 15h.01M12 15h.01M16 15h.01" />
                  </svg>
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--navy)' }}>PeptidePure AI</p>
                <p className="text-xs mb-6 max-w-xs" style={{ color: 'var(--text-light)' }}>
                  Ask me about peptide protocols, dosing, reconstitution, or clinical stacks.
                </p>
                {loggedIn ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3.5 py-1.5 rounded-full border transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--navy)', background: 'white' }}
                        onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = 'var(--navy)'; b.style.color = 'white'; b.style.borderColor = 'var(--navy)'; }}
                        onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = 'white'; b.style.color = 'var(--navy)'; b.style.borderColor = 'var(--border)'; }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-3.5 py-1.5 rounded-full border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-light)', background: 'white', opacity: 0.5 }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {streaming && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>

          {/* Input / Login prompt */}
          <div className="shrink-0 px-4 py-3.5" style={{ borderTop: '1px solid var(--border)', background: '#F8FAFC' }}>
            {loggedIn ? (
              <>
                <div
                  className="flex items-end gap-2 rounded-xl px-3.5 py-2.5"
                  style={{ background: 'white', border: '1.5px solid var(--border)', transition: 'border-color 0.15s' }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--navy)')}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about peptide protocols…"
                    rows={1}
                    disabled={streaming}
                    className="flex-1 resize-none text-sm outline-none bg-transparent leading-relaxed"
                    style={{ color: 'var(--navy)', maxHeight: '120px', minHeight: '22px', overflowY: 'auto' }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || streaming}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-25"
                    style={{ background: 'var(--navy)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: 'var(--text-light)' }}>
                  For licensed clinicians only · Not medical advice
                </p>
              </>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs mb-3" style={{ color: 'var(--text-mid)' }}>
                  Sign in to chat with our clinical AI assistant.
                </p>
                <a
                  href="/account"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: 'var(--navy)', color: 'white' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
