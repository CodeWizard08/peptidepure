'use client';

import { useState } from 'react';
import type { ContactPageContent } from '@/lib/content-types';

const contactIcons = [
  // Phone
  <svg key="phone" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>,
  // Email
  <svg key="email" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  // Shipping
  <svg key="shipping" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
];

export default function ContactForm({ content }: { content: ContactPageContent }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    credential: '',
    npi: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'contact', data: form }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="container-xl text-center">
          <span className="section-label text-yellow-300">{content.hero.sectionLabel}</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">{content.hero.heading}</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <span className="section-label">{content.sidebar.sectionLabel}</span>
                <h2 className="text-2xl font-bold mt-2 mb-4" style={{ color: 'var(--navy)' }}>
                  {content.sidebar.heading}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                  {content.sidebar.description}
                </p>
              </div>

              {content.sidebar.contactItems.map((item: { title: string; detail: string; sub: string }, i: number) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gold-pale)', color: 'var(--gold)', border: '1px solid rgba(200,149,44,0.3)' }}>
                    {contactIcons[i]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{item.title}</p>
                    <p className="text-sm" style={{ color: 'var(--text-dark)' }}>{item.detail}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{item.sub}</p>
                  </div>
                </div>
              ))}

              {/* Note */}
              <div className="p-5 rounded-2xl" style={{ background: 'var(--navy)' }}>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">Access Note:</strong> {content.sidebar.accessNote}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="h-full flex items-center justify-center text-center p-12 rounded-2xl" style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
                  <div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(200,149,44,0.1)', border: '2px solid var(--gold)' }}>
                      <svg className="w-8 h-8" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--navy)' }}>{content.successMessage.heading}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                      {content.successMessage.text}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border)' }}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--navy)' }}>{content.form.heading}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                        placeholder="doctor@clinic.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                        placeholder="(555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                        Credential Type *
                      </label>
                      <select
                        name="credential"
                        required
                        value={form.credential}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: form.credential ? 'var(--text-dark)' : 'var(--text-light)' }}
                      >
                        <option value="">Select credential...</option>
                        {content.form.credentialOptions.map((opt: string) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                        NPI Number
                      </label>
                      <input
                        type="text"
                        name="npi"
                        value={form.npi}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                        Subject *
                      </label>
                      <select
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                        style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: form.subject ? 'var(--text-dark)' : 'var(--text-light)' }}
                      >
                        <option value="">Select subject...</option>
                        {content.form.subjectOptions.map((opt: string) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-mid)' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none resize-none"
                      style={{ background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}
                      placeholder="How can we help you?"
                    />
                  </div>
                  {error && (
                    <div className="p-4 rounded-xl text-sm mb-5" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                      {error}
                    </div>
                  )}
                  <button type="submit" className="btn-primary w-full justify-center text-base py-3.5" disabled={submitting}>
                    {submitting ? 'Sending...' : content.form.submitLabel}
                  </button>
                  <p className="text-xs text-center mt-4" style={{ color: 'var(--text-light)' }}>
                    {content.form.disclaimer}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
