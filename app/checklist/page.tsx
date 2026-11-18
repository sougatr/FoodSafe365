'use client';
import Link from 'next/link';
import { ArrowRight, Bluetooth, BookOpen, CheckCircle2, ChevronLeft, QrCode, ShieldCheck } from 'lucide-react';
import { FOODSAFE28, CRITICAL_CCP_ITEMS } from '@/lib/foodsafety28';
import GlobalHeader from '@/components/GlobalHeader';

export default function Checklist() {
  return (
    <main>
      <GlobalHeader />
      <div className="container manager-shell" style={{ marginTop: 20 }}>
        <Link href="/" className="nav-link muted back-row">
          <ChevronLeft size={17} /> Back to Home
        </Link>

        <div className="page-title">
          <p className="eyebrow">FOODSAFE365 OPERATIONAL PROTOCOL</p>
          <h1>{CRITICAL_CCP_ITEMS.length} Critical Daily Kitchen Safeguards</h1>
          <p className="lead">
            Streamlined to {CRITICAL_CCP_ITEMS.length} critical daily kitchen controls — covering temperature control for receiving fresh rations, cold storage, deep freezer &amp; thawing, internal cooking, hot holding &amp; blast chilling, FIFO &amp; expired rations, frying oil TPC meters, raw/cooked segregation, potable water, pest control, staff medical fitness (Form 1A), and general kitchen hygiene.
          </p>
        </div>

        <div className="grid grid2 education-links">
          <Link href="/food-safety-why" className="card link-card">
            <ShieldCheck />
            <div>
              <p className="eyebrow">LEARN FIRST</p>
              <h2>FoSTaC Learning Hub</h2>
              <p className="muted">Learn practical food safety controls, contamination prevention, and operational standards before daily checks.</p>
            </div>
            <ArrowRight />
          </Link>
          <Link href="/food-safety-framework" className="card link-card">
            <BookOpen />
            <div>
              <p className="eyebrow">UNDERSTAND THE SYSTEM</p>
              <h2>Food Safety Framework</h2>
              <p className="muted">See how the {CRITICAL_CCP_ITEMS.length} critical daily safeguards, temperature controls and HACCP fit together.</p>
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
            <h2>FoodSafe365 Operational Status</h2>
            <p className="muted">Operational status is based on actual completed critical checks, manager review, and open corrective actions.</p>
          </div>
          <Link className="btn primary" href="/checks">
            Start today’s 12 checks <ArrowRight size={17} />
          </Link>
        </div>

        <section className="section-block" style={{ marginTop: 24, marginBottom: 28 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, margin: 0, color: '#0f172a' }}>The 12 Critical Daily Kitchen Checks</h2>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                Can be completed manually by the shift supervisor or pre-drafted via AI Agent sensors/OCR for manager sign-off.
              </p>
            </div>
            <Link
              href="/checks"
              className="btn secondary"
              style={{ fontSize: 12.5, padding: '6px 14px', whiteSpace: 'nowrap' }}
            >
              Launch Daily Checks ({CRITICAL_CCP_ITEMS.length}) <ArrowRight size={14} />
            </Link>
          </div>
          <div className="checklist-library" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CRITICAL_CCP_ITEMS.map(ccp => {
              const x = FOODSAFE28.find(item => item.code === ccp.code);
              if (!x) return null;
              return (
                <Link
                  href={`/checks?code=${x.code}`}
                  key={ccp.code}
                  className="card library-row"
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}
                >
                  <div className="library-number" style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 900 }}>
                    #{ccp.ccpNumber}
                  </div>
                  <div className="library-main">
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                      <span className="eyebrow" style={{ margin: 0, fontSize: 10, color: '#991b1b' }}>{ccp.categoryTag}</span>
                      <span style={{
                        fontSize: 10,
                        background: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 700
                      }}>
                        Target: {ccp.criticalLimit}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: '2px 0 4px', color: '#0f172a' }}>{ccp.shortTitle}</h3>
                    <p style={{ margin: '0 0 4px', fontSize: 12.5, color: '#475569' }}>
                      {x.title}
                    </p>
                    <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                      🤖 {ccp.aiSensorSource} · {x.input === 'temperature' ? 'Temperature measurement' : '1–5 Qualitative Rating'}
                    </p>
                  </div>
                  <ArrowRight size={18} style={{ color: '#94a3b8' }} />
                </Link>
              );
            })}
          </div>
        </section>

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
