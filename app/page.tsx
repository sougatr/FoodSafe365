import Link from 'next/link';
import {
  Home,
  QrCode,
  Store,
  ShieldCheck,
  Bluetooth,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  BookOpen
} from 'lucide-react';

import ThemeToggle from '@/components/ThemeToggle';

export default function Landing() {
  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14
          }}>
            FS
          </div>
          <span>FoodSafe365</span>
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <ThemeToggle />
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Home size={14} /> Dashboard / Home
          </Link>
          <Link href="/manager/trends" className="btn secondary" style={{ color: 'var(--green)' }}>
            AI Trends
          </Link>
          <Link href="/ai-copilot" className="btn secondary" style={{ color: 'var(--green)' }}>
            AI Copilot
          </Link>
          <Link href="/providers" className="btn secondary">
            Providers
          </Link>
          <Link href="/contact" className="btn secondary">
            Contact
          </Link>
          <Link href="/login" className="btn secondary">
            Log in
          </Link>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 60 }}>
        {/* Hero Section */}
        <div style={{ maxWidth: 840 }}>
          <span className="pill good">Food Safety Intelligence &amp; Regulatory Shield</span>
          <h1 style={{ fontSize: 'clamp(38px, 6vw, 68px)', lineHeight: 1.1, margin: '20px 0 16px' }}>
            Clean Kitchens<br />Don’t Get Shut Down.
          </h1>
          <p style={{ fontSize: 21, lineHeight: 1.5, color: '#1e293b', fontWeight: 600, margin: '0 0 10px' }}>
            Keep your kitchen spotless, your cold chain unbroken, and FDA inspectors off your back.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.6 }} className="muted">
            The all-in-one compliance platform uniting daily kitchen operational discipline, on-demand accredited service providers, and verified tabletop diner trust.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link href="/onboarding">
              <button className="btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Start Free <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/home">
              <button className="btn secondary">Open Live App</button>
            </Link>
            <Link href="/diner">
              <button className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <QrCode size={15} /> Diner Trust Experience
              </button>
            </Link>
          </div>
        </div>

        {/* 3 Steps Banner */}
        <div className="grid grid3" style={{ marginTop: 56 }}>
          {['CHECK', 'CORRECT', 'IMPROVE'].map((x, i) => (
            <div className="card" key={x}>
              <div className="stat">0{i + 1}</div>
              <h3>{x}</h3>
              <p className="muted">A simple daily workflow that turns food-safety observations into verified audit records.</p>
            </div>
          ))}
        </div>

        {/* FoodSafe365's Three Key Competitive Moats */}
        <section className="section-block" style={{ marginTop: 64 }}>
          <div className="section-title" style={{ display: 'block', marginBottom: 20 }}>
            <span className="pill good" style={{ marginBottom: 8 }}>STRATEGIC ADVANTAGE</span>
            <h2 style={{ fontSize: 30, margin: '8px 0 6px' }}>FoodSafe365’s Three Competitive Moats: The Architecture of Trust</h2>
            <p className="muted" style={{ fontSize: 16, margin: 0, maxWidth: 860 }}>
              Forget clunky binder checklists and forgotten paper logs. Here is how FoodSafe365 turns invisible back-of-house hygiene into your restaurant’s most powerful business engine:
            </p>
          </div>

          <div className="grid grid3">
            {/* Moat 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e9f7ef', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                  <QrCode size={24} />
                </div>
                <span className="pill good" style={{ fontSize: 11, padding: '4px 8px' }}>MOAT 01</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>PUBLIC TRUST FLYWHEEL</p>
              <h3 style={{ fontSize: 20, margin: '0 0 10px' }}>Turning Clean Kitchens into Packed Tables</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>
                Most restaurants hide what happens behind the kitchen swing doors. FoodSafe365 turns it into your sharpest marketing edge. Diners scan a sleek tabletop QR code (<Link href="/qr/abc-restaurant" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>/qr/[outlet_id]</Link>) to verify today’s safety badge and rate table hygiene in real time. If a guest ever spots an issue—like a chipped glass or undercooked meat—they alert your General Manager directly from their phone, resolving it at the table in two minutes before it ever touches Google Reviews or Instagram.
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/diner" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Explore Diner Trust Hub <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Moat 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid rgba(22,131,91,0.25)', background: '#fbfefc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#edf8f2', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                  <Store size={24} />
                </div>
                <span className="pill good" style={{ fontSize: 11, padding: '4px 8px' }}>MOAT 02</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>ON-DEMAND ECOSYSTEM</p>
              <h3 style={{ fontSize: 20, margin: '0 0 10px' }}>The Service Marketplace (&quot;Compliance-as-a-Service&quot;)</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>
                A typical checklist app tells you what’s broken and leaves you stranded. FoodSafe365 closes the loop. The moment a refrigerator temperature drifts above 5°C, or a bi-annual medical deadline looms, our integrated marketplace connects you in one tap to accredited pros: NABL diagnostic labs for mandatory staff health & stool testing, licensed pest exterminators, 24/7 refrigeration engineers, and official FoSTaC training institutes.
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/providers" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Browse Services Marketplace <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Moat 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e9f7ef', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <span className="pill good" style={{ fontSize: 11, padding: '4px 8px' }}>MOAT 03</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>REGULATORY SHIELD</p>
              <h3 style={{ fontSize: 20, margin: '0 0 10px' }}>Bulletproof Defense: Always Inspection-Ready</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>
                Built squarely on the legal bedrock of FSSAI Schedule 4 and international HACCP standards, this isn’t guesswork or compliance theater. Every temperature probe (&lt; 5°C cold storage, &lt; −18°C deep freeze, &ge; 75°C cooking), employee medical clearance, and sanitization cycle is cryptographically logged with tamper-evident timestamps. When an FDA inspector walks in unannounced, you don&apos;t scramble—you hand them an airtight digital compliance dossier with total confidence.
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/food-safety-framework" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  View Compliance Framework <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Optional Modules */}
        <section className="section-block" style={{ marginTop: 44, background: '#f8faf9', padding: '32px 28px', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div className="section-title" style={{ display: 'block', marginBottom: 20 }}>
            <span className="pill neutral" style={{ marginBottom: 6, background: '#eef2f0', color: '#3f4f47' }}>ADVANCED WORKFLOWS</span>
            <h2 style={{ fontSize: 26, margin: '6px 0 6px' }}>Optional Modules</h2>
          </div>

          <div className="grid grid2">
            {/* Xenia Adoption 1: Unit QR Stickers */}
            <div className="card" style={{ background: '#fff', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef4ff', color: '#2f6fed', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <QrCode size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Tag Cold Units with QR Stickers</h3>
                  <span className="pill neutral" style={{ fontSize: 11, padding: '3px 7px', background: '#eef4ff', color: '#2f6fed' }}>Optional Workflow</span>
                </div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  Kitchen staff place unique QR stickers directly on walk-in chillers, reach-in freezers, and prep counters. By scanning the unit's QR tag with a smartphone camera, staff can log temperatures directly at the unit with <strong>one tap</strong>—eliminating manual menu searching or navigation delays.
                </p>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--green)' }} /> <span>Zero hardware cost; works on any staff phone</span>
                </div>
              </div>
            </div>

            {/* Xenia Adoption 2: Bluetooth Probes */}
            <div className="card" style={{ background: '#fff', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff5df', color: 'var(--amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Bluetooth size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Bluetooth IoT Temperature Probes</h3>
                  <span className="pill attention" style={{ fontSize: 11, padding: '3px 7px' }}>Optional Hardware</span>
                </div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  Optional integration with wireless handheld Bluetooth food thermometers and ambient refrigeration probes. Core food temperatures (cooking, cooling, and hot holding) sync wirelessly into the FoodSafe365 digital log in real time—eliminating pen-and-paper transcription and manual typing.
                </p>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--green)' }} /> <span>Automatic reading capture; completely optional for operations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Modules: Guide Drawer */}
          <details style={{ marginTop: 20, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 700, fontSize: 14, color: 'var(--green-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} /> Optional Modules: Architecture, Zero Hardware Mandate &amp; Deployment Guide
            </summary>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6, color: '#4a5568' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ background: '#f8faf9', padding: 14, borderRadius: 10, border: '1px solid #e2ece6' }}>
                  <strong style={{ display: 'block', color: 'var(--green-dark)', marginBottom: 6 }}>1. Zero Mandatory Hardware</strong>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    Every core FoodSafe365 feature—including daily FSSAI Schedule 4 checks, manager reviews, and diner QR audits—functions 100% in any smartphone or tablet browser. No proprietary hardware purchase is ever required.
                  </p>
                </div>
                <div style={{ background: '#f8faf9', padding: 14, borderRadius: 10, border: '1px solid #e2ece6' }}>
                  <strong style={{ display: 'block', color: 'var(--green-dark)', marginBottom: 6 }}>2. Cold Unit QR Stickers (Optional)</strong>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    Outlets can print standard QR tags from the manager portal. Placing them on chillers, freezers, and bain-maries allows staff to scan and log that exact unit’s temperature with a single tap, eliminating menu searching.
                  </p>
                </div>
                <div style={{ background: '#f8faf9', padding: 14, borderRadius: 10, border: '1px solid #e2ece6' }}>
                  <strong style={{ display: 'block', color: 'var(--green-dark)', marginBottom: 6 }}>3. Bluetooth IoT Probes (Optional)</strong>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    For high-volume cloud kitchens or hotel banquets, wireless Bluetooth core probes sync food temperatures directly into digital logs via Web Bluetooth API, avoiding manual entry errors.
                  </p>
                </div>
              </div>
            </div>
          </details>
        </section>
      </div>

      <footer className="container" style={{ borderTop: '1px solid var(--border)', marginTop: 60, paddingTop: 24, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <Link href="/home" className="muted">Dashboard / Home</Link>
        <Link href="/providers" className="muted">Providers & Vendors</Link>
        <Link href="/contact" className="muted">Contact Us</Link>
        <Link href="/diner" className="muted">Diner Hub</Link>
        <span className="muted" style={{ marginLeft: 'auto' }}>© FoodSafe365</span>
      </footer>
    </main>
  );
}
