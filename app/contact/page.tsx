'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your message.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          organisation: organisation.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "We couldn't send your message right now. Please try again.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "We couldn't send your message right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setOrganisation('');
    setMessage('');
    setError(null);
    setSuccess(false);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #F7F8F5)' }}>
      <GlobalHeader />

      <div className="container page-shell" style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 16px 80px' }}>
        <Link
          href="/home"
          className="nav-link muted back-row"
          style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="page-title" style={{ marginBottom: 28 }}>
          <span className="pill good" style={{ marginBottom: 8, display: 'inline-block' }}>CONTACT US</span>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: 'var(--text, #0f172a)', margin: '4px 0 8px' }}>
            Let’s talk about food safety.
          </h1>
          <p className="lead muted" style={{ fontSize: 15, margin: 0, color: 'var(--muted, #64748b)' }}>
            Tell us what you need — product information, restaurant onboarding, service-provider partnerships or operational support.
          </p>
        </div>

        <div className="grid grid2 contact-grid" style={{ gap: 24, alignItems: 'start' }}>
          {/* Information Card */}
          <section className="card" style={{ padding: '28px 24px' }}>
            <p className="eyebrow" style={{ color: '#059669', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              GET IN TOUCH
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px', color: 'var(--text, #0f172a)' }}>
              FoodSafe365
            </h2>

            <div className="contact-item" style={{ marginBottom: 16 }}>
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--text, #0f172a)' }}>Product &amp; partnerships</strong>
              <span className="muted" style={{ fontSize: 13, color: '#64748b' }}>For restaurants, grocery stores, service providers and technology partners.</span>
            </div>

            <div className="contact-item" style={{ marginBottom: 16 }}>
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--text, #0f172a)' }}>Support &amp; operations</strong>
              <span className="muted" style={{ fontSize: 13, color: '#64748b' }}>For existing FoodSafe365 kitchen supervisors, store managers, and diners.</span>
            </div>

            <div className="contact-item" style={{ marginBottom: 20 }}>
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--text, #0f172a)' }}>Official Administrator Desk</strong>
              <span style={{ fontSize: 13.5, color: '#059669', fontWeight: 600 }}>ray.health.ai@gmail.com</span>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 12.5,
              color: '#064e3b',
              lineHeight: 1.45
            }}>
              Messages submitted here are routed directly to the FoodSafe365 management desk. We respond within 24 business hours.
            </div>
          </section>

          {/* Form Card */}
          <section className="card" style={{ padding: '28px 24px' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                  Your message has been sent successfully.
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, margin: '0 0 24px' }}>
                  Thank you for contacting FoodSafe365. The management team has received your inquiry and will reply directly to <strong>{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn secondary"
                  style={{ minHeight: 44, padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p className="eyebrow" style={{ color: '#059669', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  SEND A MESSAGE
                </p>

                {error && (
                  <div
                    role="alert"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#b91c1c',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 16
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="contact-name" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #334155)' }}>
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    style={{ minHeight: 44, fontSize: 14.5, background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', border: '1.5px solid var(--border, #cbd5e1)' }}
                  />
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="contact-email" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #334155)' }}>
                    Email ID *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{ minHeight: 44, fontSize: 14.5, background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', border: '1.5px solid var(--border, #cbd5e1)' }}
                  />
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="contact-org" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #334155)' }}>
                    Restaurant / Grocery Store / Organisation (Optional)
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    className="input"
                    value={organisation}
                    onChange={e => setOrganisation(e.target.value)}
                    placeholder="Organisation or branch name"
                    style={{ minHeight: 44, fontSize: 14.5, background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', border: '1.5px solid var(--border, #cbd5e1)' }}
                  />
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="contact-subject" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #334155)' }}>
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    className="input"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Partnership inquiry, Kitchen audit help, Feedback"
                    required
                    style={{ minHeight: 44, fontSize: 14.5, background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', border: '1.5px solid var(--border, #cbd5e1)' }}
                  />
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="contact-msg" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #334155)' }}>
                    Message *
                  </label>
                  <textarea
                    id="contact-msg"
                    className="input textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us what you need..."
                    rows={4}
                    required
                    style={{ minHeight: 110, fontSize: 14.5, background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', border: '1.5px solid var(--border, #cbd5e1)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn primary"
                  style={{
                    width: '100%',
                    marginTop: 20,
                    minHeight: 48,
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 12
                  }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Sending message...' : 'Send Me Message'}</span>
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
