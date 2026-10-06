'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  Layers,
  Thermometer,
  Sparkles,
  Bug,
  RotateCw,
  FileText,
  User,
  Calendar,
  Check,
  X
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GROCERY_OPERATIONAL_CHECKS } from '@/lib/grocery-checklist-data';

interface SectionDef {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: any;
  codes: string[];
}

export default function GroceryDailyCheckFrontlinePage() {
  const [responses, setResponses] = useState<Record<string, { conforming: boolean; notes: string }>>({});
  const [supervisorName, setSupervisorName] = useState('Rajesh Nair');
  const [expandedWhy, setExpandedWhy] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Group the 22 checks into simple frontline sections mapping exactly to the existing 22 checks
  const SECTIONS: SectionDef[] = [
    {
      id: 'receiving',
      number: 1,
      title: 'RECEIVING',
      subtitle: 'Deliveries received safely from approved suppliers',
      icon: Truck,
      codes: ['GR22-08', 'GR22-09']
    },
    {
      id: 'storage',
      number: 2,
      title: 'STORAGE & SEPARATION',
      subtitle: 'Food stored off the floor, raw separated from ready-to-eat',
      icon: Layers,
      codes: ['GR22-05', 'GR22-13', 'GR22-14', 'GR22-16', 'GR22-18']
    },
    {
      id: 'temperature',
      number: 3,
      title: 'TEMPERATURE',
      subtitle: 'Chillers and freezers checked and operating within safe limits',
      icon: Thermometer,
      codes: ['GR22-06', 'GR22-10', 'GR22-20']
    },
    {
      id: 'hygiene',
      number: 4,
      title: 'HYGIENE & PREMISES',
      subtitle: 'Store aisles clean, well-lit, and properly ventilated',
      icon: Sparkles,
      codes: ['GR22-02', 'GR22-03', 'GR22-04']
    },
    {
      id: 'cleaning',
      number: 5,
      title: 'CLEANING & CHEMICALS',
      subtitle: 'Waste bins pedal-closed and cleaning chemicals locked',
      icon: ShieldCheck,
      codes: ['GR22-07', 'GR22-19']
    },
    {
      id: 'pest',
      number: 6,
      title: 'PEST PREVENTION',
      subtitle: 'Zero signs of pests; traps and monitoring active',
      icon: Bug,
      codes: ['GR22-17']
    },
    {
      id: 'stock',
      number: 7,
      title: 'STOCK & PACKAGING',
      subtitle: 'No expired food, intact packaging, and FEFO stock rotation',
      icon: RotateCw,
      codes: ['GR22-11', 'GR22-12', 'GR22-15']
    },
    {
      id: 'records',
      number: 8,
      title: 'RECORDS & STATUTORY',
      subtitle: 'FSSAI certificate displayed, daily logs and action follow-up',
      icon: FileText,
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

    if (typeof window !== 'undefined') {
      const savedManager = localStorage.getItem('foodsafe365_grocery_manager_name');
      if (savedManager) setSupervisorName(savedManager);
    }
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

  // Gather flagged items for result presentation
  const flaggedChecks = GROCERY_OPERATIONAL_CHECKS.filter(chk => responses[chk.code] && !responses[chk.code].conforming);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 920, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* ==================================================== */}
        {/* CHECK RESULT SCREENS */}
        {/* ==================================================== */}
        {result ? (
          <div>
            {issueCount === 0 ? (
              /* SATISFACTORY RESULT */
              <div style={{
                background: '#ffffff',
                borderRadius: 22,
                padding: '40px 32px',
                border: '2px solid #10B981',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ✓ FOOD SAFETY CHECK COMPLETE
                </div>
                <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 30px)', fontWeight: 900, color: '#0F172A', margin: '8px 0 6px' }}>
                  Everything looks good today.
                </h1>
                <p style={{ fontSize: 15, color: '#64748B', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.5 }}>
                  All 22 routine checks verified by <strong>{supervisorName}</strong> today. Verified and saved to your store records.
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 24px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 14,
                  marginBottom: 32
                }}>
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#059669' }}>22 / 22</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginLeft: 8 }}>Checks Passed</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/grocery"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      padding: '13px 28px',
                      borderRadius: 12,
                      fontSize: 14.5,
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <span>Back to Grocery Home</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/grocery/actions"
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '13px 22px',
                      borderRadius: 12,
                      fontSize: 14.5,
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    View Store Actions
                  </Link>
                </div>
              </div>
            ) : (
              /* NON-SATISFACTORY RESULT */
              <div style={{
                background: '#ffffff',
                borderRadius: 22,
                padding: '36px 30px',
                border: '2px solid #F59E0B',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)'
              }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <AlertTriangle size={34} />
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ⚠ SOMETHING NEEDS ATTENTION
                  </div>
                  <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 30px)', fontWeight: 900, color: '#0F172A', margin: '8px 0 6px' }}>
                    What needs to be corrected?
                  </h1>
                  <p style={{ fontSize: 14.5, color: '#64748B', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
                    {flaggedChecks.length} item{flaggedChecks.length > 1 ? 's' : ''} flagged during today's check. Corrective action tickets have been assigned below.
                  </p>
                </div>

                {/* List of Flagged Issues with: ISSUE -> ACTION -> RESPONSIBLE PERSON -> DUE DATE -> VERIFY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                  {flaggedChecks.map((chk, idx) => {
                    const note = responses[chk.code]?.notes;
                    return (
                      <div
                        key={chk.code}
                        style={{
                          background: '#FFFBEB',
                          border: '1.5px solid #FCD34D',
                          borderRadius: 16,
                          padding: '18px 22px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 900, background: '#D97706', color: '#ffffff', padding: '2px 8px', borderRadius: 6 }}>
                            ISSUE {idx + 1}
                          </span>
                          <strong style={{ fontSize: 16, color: '#92400E' }}>
                            {chk.title}
                          </strong>
                        </div>

                        {/* Step Sequence: ISSUE -> ACTION -> RESPONSIBLE PERSON -> DUE DATE -> VERIFY */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 12,
                          background: '#ffffff',
                          borderRadius: 12,
                          padding: '14px 16px',
                          border: '1px solid #FDE68A',
                          fontSize: 13,
                          lineHeight: 1.45
                        }}>
                          <div>
                            <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: 2 }}>
                              ISSUE
                            </span>
                            <span style={{ color: '#451A03' }}>
                              {chk.what}
                              {note && <span style={{ display: 'block', fontStyle: 'italic', marginTop: 4, color: '#78350F' }}>Note: “{note}”</span>}
                            </span>
                          </div>

                          <div>
                            <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: 2 }}>
                              ACTION
                            </span>
                            <span style={{ color: '#0369a1' }}>
                              {chk.action}
                            </span>
                          </div>

                          <div>
                            <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 2 }}>
                              RESPONSIBLE PERSON
                            </span>
                            <span style={{ color: '#5b21b6', fontWeight: 700 }}>
                              {supervisorName}
                            </span>
                          </div>

                          <div>
                            <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: 2 }}>
                              DUE DATE
                            </span>
                            <span style={{ color: '#991b1b', fontWeight: 700 }}>
                              Immediate (Today)
                            </span>
                          </div>

                          <div>
                            <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: 2 }}>
                              VERIFY
                            </span>
                            <span style={{ color: '#065F46', fontWeight: 700 }}>
                              Awaiting Resolution
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Result CTA Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/grocery/actions"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#ffffff',
                      padding: '13px 26px',
                      borderRadius: 12,
                      fontSize: 14.5,
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)'
                    }}
                  >
                    <span>View Actions &amp; Verify</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/grocery"
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '13px 22px',
                      borderRadius: 12,
                      fontSize: 14.5,
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Back to Grocery Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ==================================================== */
          /* DAILY CHECK FORM */
          /* ==================================================== */
          <form onSubmit={handleSubmit}>
            {/* Header Hero */}
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
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: 8
                  }}>
                    <Clock size={12} />
                    <span>TODAY'S FOOD SAFETY CHECK · 22 CHECKS</span>
                  </div>
                  <h1 style={{ fontSize: 'clamp(22px, 3.2vw, 28px)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    Today's Food Safety Check
                  </h1>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#a7f3d0' }}>
                    Walk your store and check each item. Tap YES if all is well, or NO if attention is needed.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: 11, color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>
                    Progress
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

            {/* 8 GROUPED FRONTLINE SECTIONS MAPPED TO 22 CHECKS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {SECTIONS.map(sec => {
                const sectionChecks = GROCERY_OPERATIONAL_CHECKS.filter(c => sec.codes.includes(c.code));
                const SectionIcon = sec.icon;

                return (
                  <div
                    key={sec.id}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 18,
                      padding: '22px 24px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'rgba(5, 150, 105, 0.1)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900
                      }}>
                        <SectionIcon size={18} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          {sec.number}. {sec.title}
                        </h2>
                        <div style={{ fontSize: 12.5, color: '#64748B' }}>
                          {sec.subtitle} ({sectionChecks.length} checks)
                        </div>
                      </div>
                    </div>

                    {/* Check items in this section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {sectionChecks.map(chk => {
                        const isConforming = responses[chk.code]?.conforming ?? true;
                        const isExpanded = expandedWhy.includes(chk.code);

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
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                                  {chk.title}
                                </div>
                                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.45 }}>
                                  {chk.what}
                                </div>
                              </div>

                              {/* Large Frontline Buttons: YES — OK / NO — ATTENTION */}
                              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => handleChoice(chk.code, true)}
                                  style={{
                                    padding: '9px 16px',
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
                                  <Check size={16} />
                                  <span>YES — OK</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleChoice(chk.code, false)}
                                  style={{
                                    padding: '9px 16px',
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
                                  <X size={16} />
                                  <span>NO — ATTENTION</span>
                                </button>
                              </div>
                            </div>

                            {/* Optional Expandable: "Why does this matter?" */}
                            <div style={{ marginTop: 8 }}>
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

                            {/* ==================================================== */}
                            {/* ACTION PANEL IF NO — ATTENTION IS SELECTED */}
                            {/* Shows: ISSUE -> ACTION -> RESPONSIBLE PERSON -> DUE DATE -> VERIFY */}
                            {/* ==================================================== */}
                            {!isConforming && (
                              <div style={{
                                marginTop: 14,
                                background: '#FFFBEB',
                                border: '1.5px solid #F59E0B',
                                borderRadius: 12,
                                padding: '16px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B45309', fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>
                                  <AlertTriangle size={17} />
                                  <span>SOMETHING NEEDS ATTENTION</span>
                                </div>

                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                  gap: 10,
                                  background: '#ffffff',
                                  borderRadius: 10,
                                  padding: '12px',
                                  border: '1px solid #FDE68A',
                                  marginBottom: 10,
                                  fontSize: 12.5
                                }}>
                                  <div>
                                    <strong style={{ display: 'block', color: '#B45309', textTransform: 'uppercase', fontSize: 11 }}>
                                      ISSUE
                                    </strong>
                                    <span style={{ color: '#78350F' }}>{chk.title}</span>
                                  </div>
                                  <div>
                                    <strong style={{ display: 'block', color: '#0284c7', textTransform: 'uppercase', fontSize: 11 }}>
                                      ACTION
                                    </strong>
                                    <span style={{ color: '#0369a1' }}>{chk.action}</span>
                                  </div>
                                  <div>
                                    <strong style={{ display: 'block', color: '#7c3aed', textTransform: 'uppercase', fontSize: 11 }}>
                                      RESPONSIBLE
                                    </strong>
                                    <span style={{ color: '#5b21b6', fontWeight: 700 }}>{supervisorName}</span>
                                  </div>
                                  <div>
                                    <strong style={{ display: 'block', color: '#dc2626', textTransform: 'uppercase', fontSize: 11 }}>
                                      DUE DATE
                                    </strong>
                                    <span style={{ color: '#991b1b', fontWeight: 700 }}>Immediate (Today)</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    value={responses[chk.code]?.notes || ''}
                                    onChange={e => handleNotes(chk.code, e.target.value)}
                                    placeholder="Add quick notes (e.g. wet floor at aisle 3, restocked soap)..."
                                    style={{
                                      flex: 1,
                                      padding: '8px 12px',
                                      borderRadius: 8,
                                      border: '1px solid #FCD34D',
                                      fontSize: 12.5
                                    }}
                                  />
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
