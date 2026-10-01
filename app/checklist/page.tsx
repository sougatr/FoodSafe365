'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ArrowRight, Bluetooth, BookOpen, CheckCircle2, ChevronLeft, Home, QrCode, ShieldCheck } from 'lucide-react';
import { FOODSAFE28, SHIFT_DEFINITIONS, OperationalShift } from '@/lib/foodsafety28';
import GlobalHeader from '@/components/GlobalHeader';

export default function Checklist() {
  const [selectedShift, setSelectedShift] = useState<OperationalShift | 'all'>('all');

  return (
    <main>
      <GlobalHeader />
      <div className="container manager-shell" style={{ marginTop: 20 }}>
        <Link href="/home" className="nav-link muted back-row">
          <ChevronLeft size={17} /> Back to Home
        </Link>

        <div className="page-title">
          <p className="eyebrow">FOODSAFE365 OPERATIONAL PROTOCOL</p>
          <h1>{FOODSAFE28.length} Essential Kitchen &amp; Specialized Safeguards</h1>
          <p className="lead">
            {FOODSAFE28.length} essential operational safeguards engineered for daily kitchen discipline, zero contamination, and continuous audit readiness — covering general kitchen operations, bars &amp; breweries, cloud kitchens, and catering services.
          </p>
        </div>

        <div className="grid grid2 education-links">
          <Link href="/food-safety-why" className="card link-card">
            <ShieldCheck />
            <div>
              <p className="eyebrow">LEARN FIRST</p>
              <h2>Food Safety — Why?</h2>
              <p className="muted">Understand why the supervisor checks these controls and how a missed control can affect food safety.</p>
            </div>
            <ArrowRight />
          </Link>
          <Link href="/food-safety-framework" className="card link-card">
            <BookOpen />
            <div>
              <p className="eyebrow">UNDERSTAND THE SYSTEM</p>
              <h2>Food Safety Framework</h2>
              <p className="muted">See how the {FOODSAFE28.length} essential safeguards, temperature controls and HACCP fit together.</p>
            </div>
            <ArrowRight />
          </Link>
        </div>

        <div className="card badge-preview">
          <div className="badge-icon">
            <CheckCircle2 />
          </div>
          <div>
            <p className="eyebrow">END-OF-DAY OUTPUT</p>
            <h2>FoodSafe365 Daily Food Safety Badge</h2>
            <p className="muted">The badge will be based on actual completed checks and real unresolved issues—not an arbitrary score.</p>
          </div>
          <Link className="btn primary" href="/checks">
            Start today’s checks <ArrowRight size={17} />
          </Link>
        </div>

        {/* Shift Filter Tabs (White background, green active tabs, black font) */}
        <div className="shift-tabs-bar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, margin: '24px 0 16px' }}>
          {[
            { id: 'all', icon: '📑', label: 'All 29 Controls', time: '', count: 29 },
            { id: 'opening', icon: '🌅', label: 'Opening Shift', time: '2–3m', count: 7 },
            { id: 'active', icon: '🍳', label: 'Active Service', time: '2–3m', count: 6 },
            { id: 'closing', icon: '🌙', label: 'Closing Shift', time: '2–3m', count: 8 },
            { id: 'specialized', icon: '🏢', label: 'Specialized', time: '1–2m', count: 6 },
            { id: 'monthly_audit', icon: '📋', label: "Manager's Audit", time: '5m', count: 2 },
          ].map(s => {
            const isActive = selectedShift === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`shift-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedShift(s.id as any)}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                {s.time && (
                  <span style={{
                    fontSize: 10.5,
                    padding: '1px 6px',
                    borderRadius: 6,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#e0f2fe',
                    color: isActive ? '#ffffff' : '#0369a1',
                    fontWeight: 700
                  }}>
                    {s.time}
                  </span>
                )}
                <span className="tab-badge">{s.count}</span>
              </button>
            );
          })}
        </div>

        {/* If 'all' is selected: Render sections for each shift */}
        {selectedShift === 'all' ? (
          (['opening', 'active', 'closing', 'specialized', 'monthly_audit'] as OperationalShift[]).map(shiftKey => {
            const def = SHIFT_DEFINITIONS[shiftKey];
            const items = FOODSAFE28.filter(x => x.shift === shiftKey);
            return (
              <section key={shiftKey} className="section-block" style={{ marginBottom: 28 }}>
                <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 20 }}>{def.icon}</span>
                      <h2 style={{ fontSize: 20, margin: 0, color: '#0f172a' }}>{def.name} — {def.subtitle}</h2>
                      <span style={{ fontSize: 11, background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>
                        ⏱️ {def.duration}
                      </span>
                    </div>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                      {def.description}
                    </p>
                  </div>
                  <Link
                    href={`/checks?shift=${shiftKey}`}
                    className="btn secondary"
                    style={{ fontSize: 12.5, padding: '6px 14px', whiteSpace: 'nowrap' }}
                  >
                    Launch Shift ({items.length} checks) <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="checklist-library" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(x => (
                    <Link
                      href={`/checks?check=${x.id}`}
                      key={x.id}
                      className="card library-row"
                      style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}
                    >
                      <div className="library-number" style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                        {x.id}
                      </div>
                      <div className="library-main">
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                          <span className="eyebrow" style={{ margin: 0, fontSize: 10 }}>{x.category}</span>
                          {x.severity && (
                            <span style={{
                              fontSize: 9.5,
                              background: x.severity === 'Critical' ? '#fef2f2' : x.severity === 'Major' ? '#fffbeb' : '#f0fdf4',
                              color: x.severity === 'Critical' ? '#dc2626' : x.severity === 'Major' ? '#b45309' : '#16a34a',
                              border: `1px solid ${x.severity === 'Critical' ? '#fecaca' : x.severity === 'Major' ? '#fde68a' : '#bbf7d0'}`,
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontWeight: 700
                            }}>
                              [{x.severity}]
                            </span>
                          )}
                          {x.complianceRequirement === 'desirable' && (
                            <span style={{ fontSize: 9.5, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              DESIRABLE (OPTIONAL)
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '2px 0 4px', color: '#0f172a' }}>{x.title}</h3>
                        {x.target && (
                          <p style={{ margin: '0 0 4px', fontSize: 12.5, color: '#475569' }}>
                            <strong>Target:</strong> {x.target}
                          </p>
                        )}
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                          ⏱️ {x.timeEstimate} · {x.frequency} · {x.input === 'temperature' ? 'Temperature measurement' : '1–5 Qualitative Rating'}
                        </p>
                      </div>
                      <ArrowRight size={18} style={{ color: '#94a3b8' }} />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          /* Single Selected Shift View */
          <section className="section-block">
            {SHIFT_DEFINITIONS[selectedShift] && (
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #a7f3d0',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 30 }}>{SHIFT_DEFINITIONS[selectedShift].icon}</span>
                  <div>
                    <h2 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 2px', color: '#0f172a' }}>
                      {SHIFT_DEFINITIONS[selectedShift].name} — {SHIFT_DEFINITIONS[selectedShift].subtitle}
                    </h2>
                    <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                      {SHIFT_DEFINITIONS[selectedShift].description}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/checks?shift=${selectedShift}`}
                  className="btn primary"
                  style={{ fontSize: 13, padding: '8px 18px', whiteSpace: 'nowrap' }}
                >
                  Start This Shift (2-3 min) <ArrowRight size={15} />
                </Link>
              </div>
            )}
            <div className="checklist-library" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FOODSAFE28.filter(x => x.shift === selectedShift).map(x => (
                <Link
                  href={`/checks?check=${x.id}`}
                  key={x.id}
                  className="card library-row"
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}
                >
                  <div className="library-number" style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                    {x.id}
                  </div>
                  <div className="library-main">
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                      <span className="eyebrow" style={{ margin: 0, fontSize: 10 }}>{x.category}</span>
                      {x.severity && (
                        <span style={{
                          fontSize: 9.5,
                          background: x.severity === 'Critical' ? '#fef2f2' : x.severity === 'Major' ? '#fffbeb' : '#f0fdf4',
                          color: x.severity === 'Critical' ? '#dc2626' : x.severity === 'Major' ? '#b45309' : '#16a34a',
                          border: `1px solid ${x.severity === 'Critical' ? '#fecaca' : x.severity === 'Major' ? '#fde68a' : '#bbf7d0'}`,
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontWeight: 700
                        }}>
                          [{x.severity}]
                        </span>
                      )}
                      {x.complianceRequirement === 'desirable' && (
                        <span style={{ fontSize: 9.5, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                          DESIRABLE (OPTIONAL)
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: '2px 0 4px', color: '#0f172a' }}>{x.title}</h3>
                    {x.target && (
                      <p style={{ margin: '0 0 4px', fontSize: 12.5, color: '#475569' }}>
                        <strong>Target:</strong> {x.target}
                      </p>
                    )}
                    <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                      ⏱️ {x.timeEstimate} · {x.frequency} · {x.input === 'temperature' ? 'Temperature measurement' : '1–5 Qualitative Rating'}
                    </p>
                  </div>
                  <ArrowRight size={18} style={{ color: '#94a3b8' }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Optional Modules (Moved from Home Page) */}
        <section className="section-block" style={{ marginTop: 36, background: '#ffffff', padding: '28px 24px', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="section-title" style={{ display: 'block', marginBottom: 18 }}>
            <span className="pill neutral" style={{ marginBottom: 6 }}>ADVANCED WORKFLOWS (OPTIONAL)</span>
            <h2 style={{ fontSize: 24, margin: '6px 0 6px' }}>Optional Modules</h2>
            <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
              These enhancements are completely optional. All core checklists operate 100% on any smartphone browser without extra hardware.
            </p>
          </div>

          <div className="grid grid2">
            {/* Unit QR Stickers */}
            <div className="card" style={{ background: '#f8fafc', display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef4ff', color: '#2563eb', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <QrCode size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Tag Cold Units with QR Stickers</h3>
                  <span className="pill neutral" style={{ fontSize: 10, padding: '3px 7px', background: '#eef4ff', color: '#2563eb' }}>Optional Workflow</span>
                </div>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Kitchen staff place unique QR stickers directly on walk-in chillers, reach-in freezers, and prep counters. By scanning the unit&apos;s QR tag with a smartphone camera, staff log temperatures directly at the unit with <strong>one tap</strong>—eliminating manual menu searching.
                </p>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--green)' }} /> <span>Zero hardware cost; works on any staff phone</span>
                </div>
              </div>
            </div>

            {/* Bluetooth Probes */}
            <div className="card" style={{ background: '#f8fafc', display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid #e2e8f0' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Bluetooth size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Bluetooth IoT Temperature Probes</h3>
                  <span className="pill attention" style={{ fontSize: 10, padding: '3px 7px' }}>Optional Hardware</span>
                </div>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Optional integration with wireless handheld Bluetooth food thermometers and ambient refrigeration probes. Core food temperatures (cooking, cooling, and hot holding) sync wirelessly into the FoodSafe365 digital log in real time—eliminating pen-and-paper transcription.
                </p>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--green)' }} /> <span>Automatic reading capture; completely optional for operations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guide Drawer */}
          <details style={{ marginTop: 20, background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} /> Optional Modules: Architecture, Zero Hardware Mandate &amp; Deployment Guide
            </summary>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13.5, lineHeight: 1.6, color: '#4a5568' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2ece6' }}>
                  <strong style={{ display: 'block', color: 'var(--green-dark)', marginBottom: 6 }}>1. Zero Mandatory Hardware</strong>
                  <p style={{ margin: 0, fontSize: 12.5 }}>
                    Every core FoodSafe365 feature—including daily FSSAI Schedule 4 checks, manager reviews, and diner QR audits—functions 100% in any smartphone or tablet browser. No proprietary hardware purchase is ever required.
                  </p>
                </div>
                <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2ece6' }}>
                  <strong style={{ display: 'block', color: 'var(--green-dark)', marginBottom: 6 }}>2. Cold Unit QR Stickers (Optional)</strong>
                  <p style={{ margin: 0, fontSize: 12.5 }}>
                    Outlets can print standard QR tags from the manager portal. Placing them on chillers, freezers, and bain-maries allows staff to scan and log that exact unit’s temperature with a single tap, eliminating menu searching.
                  </p>
                </div>
                <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2ece6' }}>
                  <strong style={{ display: 'block', color: 'var(--green-dark)', marginBottom: 6 }}>3. Bluetooth IoT Probes (Optional)</strong>
                  <p style={{ margin: 0, fontSize: 12.5 }}>
                    For high-volume cloud kitchens or hotel banquets, wireless Bluetooth core probes sync food temperatures directly into digital logs via Web Bluetooth API, avoiding manual entry errors.
                  </p>
                </div>
              </div>
            </div>
          </details>
        </section>

        <div className="card source-note" style={{ marginTop: 24 }}>
          <BookOpen size={19} />
          <div>
            <strong>Source note</strong>
            <p className="muted">
              FoodSafe365 retains the exact FSSAI Schedule 4 source and guidance applicable to each control. Some controls are process-based or periodic rather than literally daily; the supervisor’s “Today” list is automatically generated based on frequency and outlet applicability.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
