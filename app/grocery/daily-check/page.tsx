'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GROCERY_OPERATIONAL_CHECKS } from '@/lib/grocery-checklist-data';

interface SectionDef {
  id: string;
  title: string;
  subtitle: string;
  codes: string[];
}

export default function GroceryDailyCheckFrontlinePage() {
  const [responses, setResponses] = useState<Record<string, { conforming: boolean; notes: string }>>({});
  const [createdActions, setCreatedActions] = useState<Record<string, boolean>>({});
  const [supervisorName, setSupervisorName] = useState('Duty Supervisor');
  const [expandedWhy, setExpandedWhy] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Group the 22 checks into the 5 requested frontline sections
  const SECTIONS: SectionDef[] = [
    {
      id: 'clean_hygiene',
      title: '1. CLEAN & HYGIENE',
      subtitle: 'Premises, handwashing, staff grooming, and sanitization SOPs',
      codes: ['GR22-02', 'GR22-03', 'GR22-04', 'GR22-14', 'GR22-15', 'GR22-16', 'GR22-20']
    },
    {
      id: 'storage',
      title: '2. STORAGE & SEPARATION',
      subtitle: 'Shelving capacity, raw vs ready segregation, and packaging seals',
      codes: ['GR22-05', 'GR22-07', 'GR22-08', 'GR22-11', 'GR22-12', 'GR22-13']
    },
    {
      id: 'temperature',
      title: '3. TEMPERATURE',
      subtitle: 'Chillers, freezers, incoming chilled deliveries, and daily logging',
      codes: ['GR22-06', 'GR22-09', 'GR22-10']
    },
    {
      id: 'pest_waste',
      title: '4. PEST & WASTE',
      subtitle: 'Traps, insect screens, garbage bins, and potable water safety',
      codes: ['GR22-17', 'GR22-18', 'GR22-19']
    },
    {
      id: 'management',
      title: '5. MANAGEMENT & RECORDS',
      subtitle: 'FSSAI certificate display, staff hygiene training, and daily logs',
      codes: ['GR22-01', 'GR22-21', 'GR22-22']
    }
  ];

  useEffect(() => {
    // Initialize default responses: all OK
    const initial: Record<string, { conforming: boolean; notes: string }> = {};
    for (const c of GROCERY_OPERATIONAL_CHECKS) {
      initial[c.code] = { conforming: true, notes: '' };
    }
    setResponses(initial);
  }, []);

  const handleChoice = (code: string, isOk: boolean) => {
    setResponses(prev => ({
      ...prev,
      [code]: {
        conforming: isOk,
        notes: prev[code]?.notes || ''
      }
    }));
  };

  const handleNotes = (code: string, text: string) => {
    setResponses(prev => ({
      ...prev,
      [code]: {
        conforming: prev[code]?.conforming ?? true,
        notes: text
      }
    }));
  };

  const toggleWhy = (code: string) => {
    setExpandedWhy(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const markActionCreated = (code: string) => {
    setCreatedActions(prev => ({ ...prev, [code]: true }));
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
      if (res.ok && (json.success || json.data)) {
        setResult(json.data || json);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(json.message || 'Unable to record daily check. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Unable to record daily check. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalChecks = GROCERY_OPERATIONAL_CHECKS.length;
  const okCount = Object.values(responses).filter(r => r.conforming).length;
  const issueCount = Object.values(responses).filter(r => !r.conforming).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* COMPLETION SUCCESS SCREEN */}
        {result ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '36px 32px',
            border: '2px solid #10B981',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CHECK RECORDED SUCCESSFULLY
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '8px 0 6px' }}>
              Daily Food Safety Check Complete
            </h1>
            <p style={{ fontSize: 14.5, color: '#64748B', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.5 }}>
              Checked by <strong>{supervisorName}</strong> today. Verified and saved to your store records.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 20,
              padding: '16px',
              background: '#F8FAFC',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              maxWidth: 420,
              margin: '0 auto 28px'
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#059669' }}>{result.check?.conformingCount ?? okCount}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Checks OK</div>
              </div>
              <div style={{ width: 1, background: '#CBD5E1' }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: issueCount > 0 ? '#ea580c' : '#059669' }}>
                  {result.check?.nonConformingCount ?? issueCount}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Needed Attention</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/grocery/actions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: 'none'
                }}
              >
                <span>View Actions</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/grocery"
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* FRONTLINE HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
              borderRadius: 20,
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: 24,
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
                    ROUTINE CHECK · 22 CHECKS
                  </span>
                  <h1 style={{ fontSize: 'clamp(22px, 3.2vw, 28px)', fontWeight: 900, margin: '8px 0 4px' }}>
                    Daily Food Safety Check
                  </h1>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#a7f3d0' }}>
                    Walk the store, check each item, and tap YES or NO. Takes about 5 minutes.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>
                    Status
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {okCount} OK · {issueCount} Need Action
                  </div>
                </div>
              </div>

              {/* Inspector Name field */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, color: '#d1fae5', fontWeight: 600 }}>Checked By:</span>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={e => setSupervisorName(e.target.value)}
                  placeholder="e.g. Rajesh Nair"
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0F2922',
                    minWidth: 200
                  }}
                />
              </div>
            </div>

            {/* 5 GROUPED FRONTLINE SECTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {SECTIONS.map((sec, secIdx) => {
                const sectionChecks = GROCERY_OPERATIONAL_CHECKS.filter(c => sec.codes.includes(c.code));
                return (
                  <div key={sec.id} style={{
                    background: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 18,
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    {/* Section Header */}
                    <div style={{ marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
                      <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 2px' }}>
                        {sec.title}
                      </h2>
                      <div style={{ fontSize: 12.5, color: '#64748B' }}>
                        {sec.subtitle} ({sectionChecks.length} checks)
                      </div>
                    </div>

                    {/* Check items in this section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {sectionChecks.map(chk => {
                        const isConforming = responses[chk.code]?.conforming ?? true;
                        const isExpanded = expandedWhy.includes(chk.code);
                        const isActionSaved = createdActions[chk.code];

                        return (
                          <div
                            key={chk.code}
                            style={{
                              border: isConforming ? '1px solid #E2E8F0' : '1.5px solid #f97316',
                              background: isConforming ? '#ffffff' : 'rgba(249, 115, 22, 0.03)',
                              borderRadius: 14,
                              padding: '16px 18px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {/* Check Title & Yes/No Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                              <div style={{ flex: 1, minWidth: 260 }}>
                                <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                                  {chk.title}
                                </div>
                                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.45 }}>
                                  {chk.what}
                                </div>
                              </div>

                              {/* Big Touch Buttons: YES — OK / NO — ISSUE */}
                              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => handleChoice(chk.code, true)}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    border: isConforming ? '2px solid #059669' : '1.5px solid #CBD5E1',
                                    background: isConforming ? 'rgba(5, 150, 105, 0.12)' : '#ffffff',
                                    color: isConforming ? '#059669' : '#64748B',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <span>✓ YES — OK</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleChoice(chk.code, false)}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: 10,
                                    border: !isConforming ? '2px solid #ea580c' : '1.5px solid #CBD5E1',
                                    background: !isConforming ? 'rgba(234, 88, 12, 0.12)' : '#ffffff',
                                    color: !isConforming ? '#ea580c' : '#64748B',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <span>✕ NO — ISSUE</span>
                                </button>
                              </div>
                            </div>

                            {/* Optional Expandable: "Why does this matter?" */}
                            <div style={{ marginTop: 10 }}>
                              <button
                                type="button"
                                onClick={() => toggleWhy(chk.code)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: '#0284c7',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <span>Why does this matter?</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>

                              {isExpanded && (
                                <div style={{
                                  marginTop: 8,
                                  background: '#F0F9FF',
                                  border: '1px solid #BAE6FD',
                                  borderRadius: 10,
                                  padding: '12px 14px',
                                  fontSize: 12.5,
                                  color: '#0c4a6e',
                                  lineHeight: 1.45
                                }}>
                                  <div style={{ marginBottom: 4 }}>
                                    <strong>Why:</strong> {chk.why}
                                  </div>
                                  <div>
                                    <strong>Standard:</strong> {chk.standard}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ACTION PANEL IF NO — ISSUE IS SELECTED */}
                            {!isConforming && (
                              <div style={{
                                marginTop: 14,
                                background: '#FFFBEB',
                                border: '1.5px solid #F59E0B',
                                borderRadius: 12,
                                padding: '14px 16px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B45309', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                                  <AlertTriangle size={16} />
                                  <span>Something needs attention</span>
                                </div>

                                <div style={{ fontSize: 12.5, color: '#78350F', lineHeight: 1.45, marginBottom: 10 }}>
                                  <strong>What to do:</strong> {chk.action}
                                </div>

                                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#92400E', marginBottom: 10 }}>
                                  <span><strong>Who:</strong> Duty Supervisor / Staff</span>
                                  <span>•</span>
                                  <span><strong>When:</strong> Immediate (Within shift)</span>
                                </div>

                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <input
                                    type="text"
                                    value={responses[chk.code]?.notes || ''}
                                    onChange={e => handleNotes(chk.code, e.target.value)}
                                    placeholder="Add quick notes (e.g. wet floor at aisle 3, restocked soap)..."
                                    style={{
                                      flex: 1,
                                      minWidth: 200,
                                      padding: '7px 10px',
                                      borderRadius: 8,
                                      border: '1px solid #FCD34D',
                                      fontSize: 12.5
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => markActionCreated(chk.code)}
                                    style={{
                                      background: isActionSaved ? '#059669' : '#D97706',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: 8,
                                      padding: '7px 14px',
                                      fontSize: 12,
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isActionSaved ? '✓ Action Flagged' : '+ Flag Action'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FINAL SUBMIT BUTTON BAR */}
            <div style={{
              marginTop: 32,
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div>
                <strong style={{ fontSize: 15, color: '#0F172A', display: 'block' }}>
                  {totalChecks} Checks Reviewed
                </strong>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                  {okCount} OK · {issueCount} will generate action items
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  href="/grocery"
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  {submitting ? 'Recording Check...' : 'Save Today\'s Daily Check →'}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
