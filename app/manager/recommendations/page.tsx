'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldCheck,
  Wrench,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { sprint19 as d } from '@/lib/sprint19-demo';

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  next: string;
  confidence: string;
  type: string;
}

interface ReviewDecision {
  acknowledgedAt: string;
  note: string;
}

export default function Recommendations() {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [managerNote, setManagerNote] = useState('');
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, ReviewDecision>>({});

  function handleOpenReview(r: Recommendation) {
    setSelectedRec(r);
    setManagerNote(reviewDecisions[r.id]?.note || '');
  }

  function handleAcknowledge() {
    if (!selectedRec) return;
    setReviewDecisions(prev => ({
      ...prev,
      [selectedRec.id]: {
        acknowledgedAt: new Date().toISOString(),
        note: managerNote.trim() || 'Reviewed and acknowledged by manager.'
      }
    }));
    setSelectedRec(null);
    setManagerNote('');
  }

  function getEvidenceLink(id: string) {
    switch (id) {
      case 'rec-ref':
        return '/manager/risk/refrigeration';
      case 'rec-training':
        return '/manager/people';
      case 'rec-doc':
      default:
        return '/manager/documents';
    }
  }

  return (
    <main>
      <GlobalHeader />

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> › <Link href="/manager"><ArrowLeft size={16} /> Manager overview</Link> › Recommendations
        </div>

        <p className="eyebrow">FOODSAFE365 RECOMMENDATIONS</p>
        <h1>What should you consider next?</h1>
        <p className="lead">
          Recommendations are generated from recorded patterns and documents. A manager reviews and decides what to do.
        </p>

        <div className="notice info">
          <Info size={18} />
          <span>
            <strong>Human decision required.</strong> FoodSafe365 recommends; it does not automatically declare a food-safety violation or diagnose a cause. Recommendations are advisory signals and do not replace formal corrective action verification.
          </span>
        </div>

        <div className="recommendation-list">
          {d.recommendations.map(r => {
            const decision = reviewDecisions[r.id];
            return (
              <div className="card recommendation-row" key={r.id}>
                <div className="recommendation-icon">
                  <Lightbulb />
                </div>
                <div className="recommendation-main" style={{ flex: 1 }}>
                  <div className="recommendation-meta" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="pill good">{r.type}</span>
                    <span className="muted" style={{ fontSize: 12 }}>Confidence: {r.confidence}</span>
                    {decision && (
                      <span className="pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                        ✓ Reviewed by Manager
                      </span>
                    )}
                  </div>

                  <h2 style={{ margin: '8px 0 4px 0', fontSize: 17 }}>{r.title}</h2>
                  <p style={{ margin: '0 0 6px 0', fontSize: 13.5 }}>
                    <strong>Why:</strong> {r.reason}
                  </p>
                  <p className="muted" style={{ margin: '0 0 12px 0', fontSize: 13 }}>
                    <strong>Suggested next step:</strong> {r.next}
                  </p>

                  {decision && (
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12.5, color: '#475569' }}>
                      <strong>Manager Decision Note:</strong> {decision.note}
                    </div>
                  )}

                  <div className="action-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenReview(r)}
                      className="btn primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      aria-label={`Review recommendation ${r.title}`}
                    >
                      <CheckCircle2 size={17} />
                      <span>{decision ? 'Update review' : 'Review recommendation'}</span>
                    </button>
                    <Link
                      href={getEvidenceLink(r.id)}
                      className="btn secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      <span>View evidence</span>
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessible Review Recommendation Modal */}
      {selectedRec && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => setSelectedRec(null)}
        >
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              borderRadius: 12,
              maxWidth: 580,
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span className="eyebrow" style={{ margin: 0 }}>MANAGER DECISION WORKFLOW</span>
                <h2 id="review-dialog-title" style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>
                  Review: {selectedRec.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRec(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4
                }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
              <p style={{ margin: '0 0 6px 0', color: '#334155' }}>
                <strong>Observed Pattern:</strong> {selectedRec.reason}
              </p>
              <p style={{ margin: 0, color: '#64748b' }}>
                <strong>Suggested Action:</strong> {selectedRec.next}
              </p>
            </div>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 14px', marginBottom: 18, fontSize: 12.5, color: '#065f46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                <ShieldCheck size={16} />
                <span>Advisory Decision vs. Corrective Action</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.4 }}>
                Recommendations are advisory patterns. If immediate food-safety risk exists, create a formal corrective action in the Actions register.
              </p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label htmlFor="manager-review-note" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Manager Decision Note (Optional):
              </label>
              <textarea
                id="manager-review-note"
                value={managerNote}
                onChange={e => setManagerNote(e.target.value)}
                placeholder="e.g., Assigned supervisor to inspect refrigerator gaskets during 3 PM check."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <Link
                href="/actions"
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}
              >
                <Wrench size={14} />
                <span>Open Actions Register</span>
                <ExternalLink size={13} />
              </Link>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedRec(null)}
                  className="btn secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAcknowledge}
                  className="btn primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <CheckCircle2 size={16} />
                  <span>Acknowledge &amp; Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
