'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GROCERY_OPERATIONAL_CHECKS } from '@/lib/grocery-checklist-data';

export default function GroceryDailyCheckPage() {
  const [checks] = useState(GROCERY_OPERATIONAL_CHECKS);
  const [responses, setResponses] = useState<Record<string, { conforming: boolean; notes: string }>>({});
  const [supervisorName, setSupervisorName] = useState('Rajesh Nair (Store Supervisor)');
  const [expandedCodes, setExpandedCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  useEffect(() => {
    // Initialize default responses: all conforming
    const initial: Record<string, { conforming: boolean; notes: string }> = {};
    for (const c of GROCERY_OPERATIONAL_CHECKS) {
      initial[c.code] = { conforming: true, notes: '' };
    }
    setResponses(initial);
  }, []);

  const toggleConforming = (code: string) => {
    setResponses(prev => ({
      ...prev,
      [code]: {
        conforming: !prev[code]?.conforming,
        notes: prev[code]?.notes || ''
      }
    }));
  };

  const handleNotesChange = (code: string, text: string) => {
    setResponses(prev => ({
      ...prev,
      [code]: {
        conforming: prev[code]?.conforming ?? true,
        notes: text
      }
    }));
  };

  const toggleExpand = (code: string) => {
    setExpandedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch('/api/v1/grocery/daily-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          supervisorName,
          responses
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmittedResult(json.data);
      } else {
        alert(json.message || 'Failed to submit daily checks');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting check');
    } finally {
      setSubmitting(false);
    }
  };

  const nonConformingCount = Object.values(responses).filter(r => !r.conforming).length;
  const conformingCount = Object.values(responses).filter(r => r.conforming).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {/* Banner with Required Philosophy Label */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#059669',
                  background: 'rgba(5, 150, 105, 0.12)',
                  padding: '3px 8px',
                  borderRadius: 6
                }}>
                  DAILY SUPERVISOR AUDIT
                </span>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  22 Operational Checkpoints
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F2922', margin: '4px 0' }}>
                FoodSafe365 Grocery Store Operational Check
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: '#475569', maxWidth: 700 }}>
                FSSAI-aligned food-safety practices adapted for routine operational monitoring.
              </p>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '12px 16px',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>Check Progress</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
                <span style={{ color: '#059669' }}>{conformingCount} Conforming</span> · <span style={{ color: nonConformingCount > 0 ? '#dc2626' : '#64748B' }}>{nonConformingCount} Issues</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation State */}
        {submittedResult ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #059669',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)',
            marginBottom: 32
          }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F2922', margin: '0 0 6px' }}>
              Daily Operational Check Recorded!
            </h2>
            <p style={{ fontSize: 14, color: '#475569', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Check session <strong>{submittedResult.id}</strong> logged by {submittedResult.supervisorName}.
              {submittedResult.nonConformingCount > 0 && (
                <span> <strong>{submittedResult.nonConformingCount} Corrective Action(s)</strong> have been automatically logged for required kitchen / floor remediation.</span>
              )}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                href="/grocery"
                className="btn primary"
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                Back to Dashboard
              </Link>
              {submittedResult.nonConformingCount > 0 && (
                <Link
                  href="/actions"
                  className="btn secondary"
                  style={{
                    color: '#dc2626',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    padding: '10px 20px',
                    fontSize: 14,
                    textDecoration: 'none'
                  }}
                >
                  Review Action Register →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Supervisor Info Input */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Auditing Supervisor / Responsible Person:
                </label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={e => setSupervisorName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ fontSize: 12, color: '#64748B', maxWidth: 380 }}>
                ℹ️ Each check provides the operational 4-part rationale: <strong>WHY</strong>, <strong>WHAT</strong>, <strong>STANDARD</strong>, and <strong>ACTION</strong>.
              </div>
            </div>

            {/* THE 22 OPERATIONAL CHECKS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {checks.map(check => {
                const response = responses[check.code] || { conforming: true, notes: '' };
                const isConforming = response.conforming;
                const isExpanded = expandedCodes.includes(check.code);

                return (
                  <div
                    key={check.code}
                    style={{
                      background: '#ffffff',
                      border: isConforming ? '1px solid #E2E8F0' : '1.5px solid #ef4444',
                      borderRadius: 14,
                      padding: '18px 20px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Check Header & Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: '#F1F5F9',
                            color: '#475569'
                          }}>
                            {check.code}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{check.category}</span>
                        </div>
                        <strong style={{ fontSize: 15.5, color: '#0F172A', display: 'block' }}>
                          {check.number}. {check.title}
                        </strong>
                      </div>

                      {/* Conforming / Non-conforming Buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setResponses(prev => ({ ...prev, [check.code]: { ...prev[check.code], conforming: true } }))}
                          style={{
                            background: isConforming ? '#059669' : '#ffffff',
                            color: isConforming ? '#ffffff' : '#059669',
                            border: '1.5px solid #059669',
                            borderRadius: 8,
                            padding: '7px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <CheckCircle2 size={14} /> Conforming
                        </button>
                        <button
                          type="button"
                          onClick={() => setResponses(prev => ({ ...prev, [check.code]: { ...prev[check.code], conforming: false } }))}
                          style={{
                            background: !isConforming ? '#dc2626' : '#ffffff',
                            color: !isConforming ? '#ffffff' : '#dc2626',
                            border: '1.5px solid #dc2626',
                            borderRadius: 8,
                            padding: '7px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <AlertTriangle size={14} /> Issue Detected
                        </button>
                      </div>
                    </div>

                    {/* Non-conformance observation notes input */}
                    {!isConforming && (
                      <div style={{
                        marginTop: 14,
                        padding: '12px 14px',
                        background: '#fef2f2',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 10
                      }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                          Non-Conformance Note &amp; Assigned Action:
                        </label>
                        <input
                          type="text"
                          value={response.notes}
                          onChange={e => handleNotesChange(check.code, e.target.value)}
                          placeholder="Describe observed defect (e.g. ice buildup on door gasket, expired batch found on front shelf)"
                          required={!isConforming}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #f87171', fontSize: 13, boxSizing: 'border-box' }}
                        />
                      </div>
                    )}

                    {/* Operational Philosophy Accordion (WHY / WHAT / STANDARD / ACTION) */}
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => toggleExpand(check.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#0284c7',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide standard details' : 'View WHY, WHAT, STANDARD & ACTION'}
                      </button>

                      {isExpanded && (
                        <div style={{
                          marginTop: 10,
                          padding: '12px 16px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 10,
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8
                        }}>
                          <div>
                            <strong style={{ color: '#0F2922' }}>WHY: </strong>
                            <span style={{ color: '#475569' }}>{check.why}</span>
                          </div>
                          <div>
                            <strong style={{ color: '#0F2922' }}>WHAT: </strong>
                            <span style={{ color: '#475569' }}>{check.what}</span>
                          </div>
                          <div>
                            <strong style={{ color: '#0F2922' }}>STANDARD: </strong>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{check.standard}</span>
                          </div>
                          <div>
                            <strong style={{ color: '#dc2626' }}>ACTION: </strong>
                            <span style={{ color: '#991b1b' }}>{check.action}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
              position: 'sticky',
              bottom: 20,
              zIndex: 30
            }}>
              <div>
                <strong style={{ fontSize: 15, color: '#0F2922' }}>
                  {conformingCount} of 22 Conforming
                </strong>
                {nonConformingCount > 0 && (
                  <span style={{ fontSize: 13, color: '#dc2626', marginLeft: 8, fontWeight: 700 }}>
                    ({nonConformingCount} corrective action(s) will be created)
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn primary"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                }}
              >
                {submitting ? 'Recording Check...' : 'Submit Daily Check'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
