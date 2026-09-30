'use client';
import Link from 'next/link';
import { ArrowRight, Bluetooth, BookOpen, CheckCircle2, ChevronLeft, Home, QrCode, ShieldCheck } from 'lucide-react';
import { FOODSAFE28 } from '@/lib/foodsafety28';
import GlobalHeader from '@/components/GlobalHeader';

export default function Checklist() {
  const groups = Array.from(new Set(FOODSAFE28.map(x => x.category)));

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

        {groups.map(g => (
          <section key={g} className="section-block">
            <div className="section-title">
              <div>
                <h2>{g}</h2>
                <p className="muted">{FOODSAFE28.filter(x => x.category === g).length} controls</p>
              </div>
            </div>
            <div className="checklist-library">
              {FOODSAFE28.filter(x => x.category === g).map(x => (
                <Link href={`/checks?check=${x.id}`} key={x.id} className="card library-row">
                  <div className="library-number">{x.id}</div>
                  <div className="library-main">
                    <h3>{x.title}</h3>
                    <p className="muted">
                      {x.frequency} · {x.input === 'temperature' ? 'Temperature measurement' : '1–5 Qualitative Rating'}
                    </p>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              ))}
            </div>
          </section>
        ))}

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
