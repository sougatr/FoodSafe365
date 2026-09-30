'use client';
import Link from 'next/link';
import {
  QrCode,
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Wrench,
  Bot,
  Activity,
  FileCheck
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function Landing() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />

      {/* Hero Section - Zero Fluff, High Utility */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 24, textAlign: 'center', maxWidth: 880 }}>
        <span className="pill good" style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Food Safety Intelligence &amp; Kitchen Compliance OS
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', lineHeight: 1.15, margin: '14px 0 10px', fontWeight: 800 }}>
          Clean Kitchens Don’t Get Shut Down.
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', color: 'var(--text, #334155)', margin: '0 auto 24px', maxWidth: 680, lineHeight: 1.5, fontWeight: 500 }}>
          The single operational hub connecting <strong>Diners</strong>, <strong>Restaurants</strong>, and <strong>Accredited Service Providers</strong> to prevent food safety lapses and build public trust.
        </p>
      </div>

      {/* 3-Door Persona Onboarding Hub */}
      <div className="container" style={{ maxWidth: 1180, flex: 1, paddingBottom: 40 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {/* DOOR 1: GENERAL PUBLIC / DINERS */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 24,
            borderRadius: 16,
            border: '1.5px solid #cbd5e1',
            background: 'var(--surface, #ffffff)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22
                }}>
                  🍽️
                </div>
                <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  GENERAL PUBLIC / DINERS
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Rate a Restaurant</h2>
              <p className="muted" style={{ fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.5 }}>
                Verify kitchen hygiene status and rate dining safety directly from your smartphone.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>5 Food Safety Questions:</strong> Table cleanliness, staff hygiene, food freshness, safe water &amp; washrooms.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>100-Word Remarks:</strong> Submit real observations directly to restaurant management.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Verified Badge:</strong> Check today’s live FoodSafetyGreen audit badge before you order.</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border, #e2e8f0)' }}>
              <Link href="/diner" className="btn primary" style={{ width: '100%', justifyContent: 'center', background: '#2563eb', borderColor: '#1d4ed8' }}>
                <QrCode size={16} /> Enter Diner Hub
              </Link>
              <Link href="/qr/abc-restaurant" className="btn secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5 }}>
                Scan Demo Tabletop QR →
              </Link>
            </div>
          </div>

          {/* DOOR 2: RESTAURANTS & COMMERCIAL KITCHENS */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 24,
            borderRadius: 16,
            border: '2px solid #059669',
            background: 'var(--surface, #ffffff)',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.1)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: -11,
              left: 20,
              background: '#059669',
              color: '#ffffff',
              fontSize: 10.5,
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: 999,
              letterSpacing: '0.04em'
            }}>
              RECOMMENDED FOR RESTAURANTS
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 4 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22
                }}>
                  🏪
                </div>
                <span style={{ fontSize: 11, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  RESTAURANT OS
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Kitchen Operations &amp; AI</h2>
              <p className="muted" style={{ fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.5 }}>
                Conduct daily checks, detect hazards early, take fast action, and showcase your verified badge.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>1. Conduct 29 Daily Checks:</strong> Fast 15-min shift audits across 7 core zones.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>2. Analyse AI Trends:</strong> Spot temperature drifts and recurring misses before audits.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>3. Take Quick Action:</strong> Auto-generate corrective tasks with photo &amp; root-cause logs.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>4. FoodSafetyGreen Badge:</strong> Live QR decal to showcase cleanliness to customers.</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border, #e2e8f0)' }}>
              <Link href="/home" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                Open Kitchen Dashboard <ArrowRight size={16} />
              </Link>
              <Link href="/checks" className="btn secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5 }}>
                Start Today’s Checks (29 Items) →
              </Link>
            </div>
          </div>

          {/* DOOR 3: SERVICE PROVIDERS */}
          <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 24,
            borderRadius: 16,
            border: '1.5px solid #cbd5e1',
            background: 'var(--surface, #ffffff)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#fef3c7',
                  color: '#b45309',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22
                }}>
                  🛠️
                </div>
                <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  SERVICE PROVIDERS
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Accredited Partner Hub</h2>
              <p className="muted" style={{ fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.5 }}>
                List your certified services and receive direct booking requests from restaurant owners.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Pest Control Agencies:</strong> Integrated pest management, bait stations &amp; audit certs.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Food-testing laboratories:</strong> NABL accredited pathogen testing &amp; safety analysis.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Refrigeration/HVAC technicians:</strong> 24/7 chiller repair, cold-chain calibration &amp; exhaust.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text, #334155)' }}>
                  <CheckCircle2 size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Occupational health providers:</strong> 6-monthly medical check-ups, Form 1A &amp; stool tests.</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border, #e2e8f0)' }}>
              <Link href="/providers" className="btn primary" style={{ width: '100%', justifyContent: 'center', background: '#b45309', borderColor: '#92400e' }}>
                <Wrench size={16} /> Browse Services Directory
              </Link>
              <Link href="/providers?tab=register" className="btn secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 12.5 }}>
                Register as Accredited Partner →
              </Link>
            </div>
          </div>
        </div>

        {/* Crisp Utility Summary Band */}
        <div style={{
          marginTop: 28,
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green, #059669)' }}>29 Checks</div>
            <div style={{ fontSize: 12, color: 'var(--muted, #64748b)' }}>FSSAI Schedule 4 Aligned</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border, #e2e8f0)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#2563eb' }}>5 Touchpoints</div>
            <div style={{ fontSize: 12, color: 'var(--muted, #64748b)' }}>Pure Food Safety Diner Rating</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border, #e2e8f0)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#b45309' }}>6 Categories</div>
            <div style={{ fontSize: 12, color: 'var(--muted, #64748b)' }}>Accredited Service Providers</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border, #e2e8f0)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>100% Audit-Ready</div>
            <div style={{ fontSize: 12, color: 'var(--muted, #64748b)' }}>Zero Paperwork &amp; Tamper-Proof</div>
          </div>
        </div>
      </div>

      {/* Persistent Global Footer */}
      <footer style={{
        borderTop: '1px solid var(--border, #e2e8f0)',
        background: 'var(--surface, #ffffff)',
        padding: '20px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          maxWidth: 1180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
            <Link href="/about" style={{ color: 'var(--muted, #64748b)', textDecoration: 'none' }}>About Us</Link>
            <Link href="/food-safety-why" style={{ color: 'var(--muted, #64748b)', textDecoration: 'none' }}>Food Safety — Why?</Link>
            <Link href="/haccp" style={{ color: 'var(--muted, #64748b)', textDecoration: 'none' }}>HACCP Principles</Link>
            <Link href="/contact" style={{ color: 'var(--muted, #64748b)', textDecoration: 'none' }}>Contact Us</Link>
            <Link href="/privacy" style={{ color: 'var(--muted, #64748b)', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted, #64748b)' }}>
            © {new Date().getFullYear()} FoodSafe365 · Digital Food-Safety Operating System
          </div>
        </div>
      </footer>
    </main>
  );
}
