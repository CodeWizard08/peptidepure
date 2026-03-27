'use client';

import React, { useState, useEffect, useRef } from 'react';
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

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--navy)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.4-7a2.5 2.5 0 0 1 .23-1.55" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5" />
          <path d="M20 7H4" />
        </svg>
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: '#F1F4F8', maxWidth: '80%' }}
      >
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
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--navy)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.4-7a2.5 2.5 0 0 1 .23-1.55" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5" />
            <path d="M20 7H4" />
          </svg>
        </div>
      )}
      <div
        className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          background: isUser ? 'var(--navy)' : '#F1F4F8',
          color: isUser ? 'white' : 'var(--navy)',
          maxWidth: '80%',
          borderBottomRightRadius: isUser ? '4px' : undefined,
          borderBottomLeftRadius: !isUser ? '4px' : undefined,
        }}
      >
        {msg.content}
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

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnread(false);
    }
  }, [open]);

  if (!loggedIn) return null;

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
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
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
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
        {
          role: 'assistant',
          content: err instanceof Error ? `Error: ${err.message}` : 'Something went wrong. Please try again.',
        },
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
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94A3B8;
          display: inline-block;
          animation: typing-bounce 1.2s infinite ease-in-out;
        }
        @keyframes chat-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-panel {
          animation: chat-slide-up 0.22s ease-out forwards;
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .unread-pulse::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--gold);
          animation: pulse-ring 1.5s ease-out infinite;
          z-index: -1;
        }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open PeptidePure AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
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
                className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white unread-pulse"
                style={{ background: 'var(--gold)', position: 'absolute' }}
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
            bottom: '88px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0"
            style={{ background: 'var(--navy)', borderBottom: '2px solid var(--gold)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(200,149,44,0.2)', border: '1px solid var(--gold)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.4-7a2.5 2.5 0 0 1 .23-1.55" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5" />
                <path d="M20 7H4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm leading-tight">PeptidePure AI</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {streaming ? 'Typing…' : 'Clinical peptide assistant'}
              </div>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Clear conversation"
              className="text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
            {isEmpty && (
              <div className="flex flex-col items-center text-center pt-4 pb-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(11,31,58,0.06)', border: '1.5px solid var(--border)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.4-7a2.5 2.5 0 0 1 .23-1.55" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5" />
                    <path d="M20 7H4" />
                  </svg>
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--navy)' }}>PeptidePure AI</p>
                <p className="text-xs mb-5" style={{ color: 'var(--text-light)' }}>
                  Ask me about peptide protocols, dosing, reconstitution, or clinical stacks.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-transparent"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--navy)',
                        background: 'white',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--navy)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'white';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--navy)';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {streaming && messages[messages.length - 1]?.role === 'user' && (
              <TypingIndicator />
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="shrink-0 px-3 py-3"
            style={{ borderTop: '1px solid var(--border)', background: '#FAFBFC' }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{ background: 'white', border: '1.5px solid var(--border)' }}
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
                style={{
                  color: 'var(--navy)',
                  maxHeight: '100px',
                  minHeight: '22px',
                  overflowY: 'auto',
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-30"
                style={{ background: 'var(--navy)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-light)' }}>
              For licensed clinicians only · Not medical advice
            </p>
          </div>
        </div>
      )}
    </>
  );
}
