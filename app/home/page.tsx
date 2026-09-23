'use client';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Mail,
  ShieldCheck,
  Thermometer,
  Users,
  AlertTriangle,
  History,
  Home as HomeIcon,
  Sparkles,
  QrCode,
  Store,
  Wrench,
  Bluetooth,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import {
  FOODSAFE28,
  AppPhase1State,
  PHASE1_STORAGE_KEY,
  isScheduledCheck,
  calculateDailyBadge,
  BadgeResult
} from '@/lib/foodsafety28';
import ThemeToggle from '@/components/ThemeToggle';

const learning = [
  {
    href: '/providers',
    icon: Sparkles,
    eyebrow: 'ON-DEMAND PARTNERS',
    title: 'FoodSafe Services Hub',
    text: 'On-demand compliance partners: Book 6-monthly medical & stool test camps, FoSTaC training, pest control, and HVAC repair.',
    bg: '#ecfdf5',
    color: '#059669'
  },
  {
    href: '/checklist',
    icon: ClipboardCheck,
    eyebrow: 'DAILY PROTOCOL',
    title: '29 Essential Safeguards',
    text: '29 operational safeguards engineered for daily kitchen discipline, zero contamination, and continuous audit readiness.',
    bg: '#f0fdf4',
    color: '#16a34a'
  },
  {
    href: '/food-safety-why',
    icon: ShieldCheck,
    eyebrow: 'LEARN WHY',
    title: 'Food Safety — Why?',
    text: 'Understand why each control matters and how missing a control can affect food safety.',
    bg: '#eff6ff',
    color: '#2563eb'
  },
  {
    href: '/food-safety-framework',
    icon: BookOpen,
    eyebrow: 'UNDERSTAND THE SYSTEM',
    title: 'Food Safety Framework',
    text: 'See how operational checks, temperature controls and HACCP fit together.',
    bg: '#faf5ff',
    color: '#7c3aed'
  },
  {
    href: '/temperature-controls',
    icon: Thermometer,
    eyebrow: 'TEMPERATURE',
    title: 'Temperature Controls',
    text: 'Understand safe storage, cooking, cooling, reheating and holding controls.',
    bg: '#fffbeb',
    color: '#d97706'
  },
  {
    href: '/haccp',
    icon: ShieldCheck,
    eyebrow: 'HAZARD CONTROL',
    title: 'HACCP Principles',
    text: 'Learn the international framework used to identify and control food-safety hazards.',
    bg: '#fef2f2',
    color: '#dc2626'
  },
  {
    href: '/records',
    icon: History,
    eyebrow: 'AUDIT EVIDENCE',
    title: 'Records & History',
    text: 'Review daily checks, manager reviews, corrective actions, and verifiable audit trail.',
    bg: '#f8fafc',
    color: '#475569'
  },
];

export default function Home() {
  const [data, setData] = useState<AppPhase1State>({});

  useEffect(() => {
    const read = () => {
      try {
        const d = JSON.parse(localStorage.getItem(PHASE1_STORAGE_KEY) || '{}');
        setData(d);
      } catch {
        setData({});
      }
    };
    read();
    window.addEventListener('foodsaf365:update', read);
    return () => window.removeEventListener('foodsaf365:update', read);
  }, []);

  const scheduled = useMemo(() => FOODSAFE28.filter(isScheduledCheck), []);
  const badge: BadgeResult = useMemo(() => {
    return calculateDailyBadge(data.checks || {}, data.issues || [], scheduled);
  }, [data, scheduled]);

  const badgeIcon = badge.tone === 'good' ? <CheckCircle2 size={26} /> : <AlertTriangle size={26} />;
  const progressPercent = scheduled.length > 0 ? Math.round((badge.counts.submitted / scheduled.length) * 100) : 0;

  return (
    <main>
      {/* Translucent Glassmorphic Topbar (Zomato / Swiggy standard) */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/home" className="brand">
            <span style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              display: 'inline-grid',
              placeItems: 'center',
              fontSize: 16,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
            }}>🛡️</span>
            FoodSafe365
          </Link>
          <span className="pill good" style={{ fontSize: 10.5, padding: '3px 9px', letterSpacing: '0.04em' }}>
            ● FSSAI Live
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px', borderRadius: 10 }}>
            <HomeIcon size={14} /> Home
          </Link>
          <Link href="/checks" className="nav-link">Checks</Link>
          <Link href="/manager" className="nav-link">Manager</Link>
          <Link href="/manager/trends" className="nav-link" style={{ color: 'var(--green)' }}>AI Trends</Link>
          <Link href="/ai-copilot" className="nav-link" style={{ color: 'var(--green)' }}>AI Copilot</Link>
          <Link href="/actions" className="nav-link">Actions</Link>
          <Link href="/records" className="nav-link">Records</Link>
          <Link href="/providers" className="nav-link">Providers</Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="container manager-shell" style={{ paddingTop: 32, paddingBottom: 64 }}>
        
        {/* Hero Section */}
        <section className="home-hero">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="pill good" style={{ fontSize: 11, padding: '4px 10px' }}>
                FOOD SAFETY INTELLIGENCE &amp; COMPLIANCE
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(34px, 4.8vw, 54px)',
              lineHeight: 1.12,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              margin: '0 0 14px',
              color: 'var(--text)'
            }}>
              Clean Kitchens <br />
              <span style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Don’t Get Shut Down.</span>
            </h1>

            <p className="lead" style={{ fontSize: 18, color: 'var(--text-body)', fontWeight: 600, lineHeight: 1.5, margin: '0 0 10px' }}>
              Keep your kitchen spotless, your cold chain unbroken, and FDA inspectors off your back.
            </p>

            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: 620, margin: '0 0 24px' }}>
              FoodSafe365 transforms statutory food safety mandates into effortless daily habits—protecting your diners, preserving your brand reputation, and keeping your dining room doors open every single day.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn primary" href="/checks">
                Start Today’s Checks <ArrowRight size={16} />
              </Link>
              <Link className="btn secondary" href="/manager">
                Manager Review
              </Link>
              <Link className="btn secondary" href="/records">
                Records &amp; Audit Dossier
              </Link>
            </div>
          </div>

          {/* Daily Badge Card (Zomato Gold / Swiggy Assured style) */}
          <div className="card home-badge-card" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
            border: badge.tone === 'good' ? '2px solid #a7f3d0' : '2px solid #fde68a',
            boxShadow: '0 10px 28px -4px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className={`badge-icon ${badge.tone === 'good' ? '' : 'badge-icon-attention'}`}>
                {badgeIcon}
              </div>
              <span className={`pill ${badge.tone === 'good' ? 'good' : 'attention'}`} style={{ fontSize: 11 }}>
                {badge.status}
              </span>
            </div>

            <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>DAILY VERIFIED STATUS</p>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>{badge.status}</h2>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: '0 0 16px' }}>{badge.explanation}</p>

            {/* Submission Mini Progress */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                <span>Shift Completion</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress" style={{ height: 7, margin: 0 }}>
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div style={{
              marginTop: 12,
              borderTop: '1px solid #e2ece6',
              paddingTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12.5,
              color: '#475569'
            }}>
              <span>Submitted: <strong style={{ color: '#0f172a' }}>{badge.counts.submitted}/{badge.counts.scheduled}</strong></span>
              <span>Open alerts: <strong style={{ color: badge.counts.openAlerts > 0 ? '#dc2626' : '#059669' }}>{badge.counts.openAlerts}</strong></span>
            </div>
          </div>
        </section>

        {/* Investigative Feature Box: The Mumbai FDA Crackdown */}
        <section className="card" style={{
          marginTop: 20,
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid #cbd5e1',
          borderLeft: '5px solid #059669',
          borderRadius: 18,
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{
              background: '#059669',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '4px 10px',
              borderRadius: 20,
              textTransform: 'uppercase'
            }}>
              Investigative Dispatch · Food Safety Reality Check
            </span>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Special Feature for Restaurateurs &amp; Operators</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.3 }}>
            The Mumbai Wake-Up Call: Why Even Iconic Kitchens Face Sudden FDA Padlocks
          </h2>

          <div style={{ fontSize: 15, lineHeight: 1.7, color: '#334155' }}>
            <p style={{ margin: '0 0 12px' }}>
              When the Maharashtra FDA swept through Mumbai’s dining hubs—serving suspension notices and temporary closures to century-old heritage landmarks in Colaba, high-profile fine dines in Mahalaxmi, exclusive sports clubs, and buzzing cloud kitchens—the shockwaves reverberated across the industry.
            </p>
            <p style={{ margin: '0 0 12px' }}>
              Yet, read through the inspectors&apos; official charge sheets and an unsettling truth becomes clear: <strong>not a single establishment was shut down because their chef lacked culinary flair or their recipes disappointed patrons.</strong>
            </p>
            <p style={{ margin: '0 0 14px' }}>
              They were padlocked over mundane, preventable back-of-house breakdowns: reach-in chillers running at a lukewarm 8°C to 10°C (straight into the danger zone); live cockroach trails nesting behind motor housings; waterlogged, grease-choked floor drains; open waste bins; and kitchen handlers working without mandatory 6-month medical check-ups (Form 1A), stool pathogen clearances, or certified FoSTaC supervisors.
            </p>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>💡</span>
                <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
                  <strong>The Industry Reality:</strong> In today’s viral digital era, an FDA suspension notice doesn’t just pause table covers; it obliterates decades of guest trust in a single two-minute headline. <em>FoodSafe365 turns daily kitchen discipline into an ironclad shield.</em>
                </span>
              </div>
              <Link href="/checklist" className="btn secondary" style={{ fontSize: 13, padding: '8px 18px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                View 29 Operational Safeguards <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* FoodSafe365's Three Key Competitive Moats */}
        <section className="section-block" style={{ marginTop: 44 }}>
          <div className="section-title" style={{ display: 'block', marginBottom: 22 }}>
            <span className="pill good" style={{ marginBottom: 8 }}>STRATEGIC ADVANTAGE</span>
            <h2 style={{ fontSize: 28, margin: '8px 0 6px' }}>FoodSafe365’s Three Competitive Moats: The Architecture of Trust</h2>
            <p className="muted" style={{ fontSize: 15.5, margin: 0, maxWidth: 840 }}>
              Forget clunky binder checklists and forgotten paper logs. Here is how FoodSafe365 turns invisible back-of-house hygiene into your restaurant’s most powerful business engine:
            </p>
          </div>

          <div className="grid grid3">
            {/* Moat 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="icon-tile" style={{ width: 44, height: 44, borderRadius: 12, background: '#e9f7ef', color: 'var(--green)' }}>
                  <QrCode size={22} />
                </div>
                <span className="pill good" style={{ fontSize: 11, padding: '4px 8px' }}>MOAT 01</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>PUBLIC TRUST FLYWHEEL</p>
              <h3 style={{ fontSize: 19, margin: '0 0 10px', color: '#0f172a' }}>Turning Clean Kitchens into Packed Tables</h3>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, flex: 1 }}>
                Most restaurants hide what happens behind the kitchen swing doors. FoodSafe365 turns it into your sharpest marketing edge. Diners scan a sleek tabletop QR code to verify today’s safety badge and rate table hygiene in real time. If a guest ever spots an issue, they alert your General Manager directly from their phone, resolving it at the table in two minutes before it ever touches Google Reviews or Instagram.
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/diner" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
                  Explore Diner Trust Hub <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Moat 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', border: '2px solid rgba(22,131,91,0.25)', background: '#fbfefc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="icon-tile" style={{ width: 44, height: 44, borderRadius: 12, background: '#edf8f2', color: 'var(--green)' }}>
                  <Store size={22} />
                </div>
                <span className="pill good" style={{ fontSize: 11, padding: '4px 8px' }}>MOAT 02</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>ON-DEMAND ECOSYSTEM</p>
              <h3 style={{ fontSize: 19, margin: '0 0 10px', color: '#0f172a' }}>The Service Marketplace (&quot;Compliance-as-a-Service&quot;)</h3>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, flex: 1 }}>
                A typical checklist app tells you what’s broken and leaves you stranded. FoodSafe365 closes the loop. The moment a refrigerator temperature drifts above 5°C, or a bi-annual medical deadline looms, our integrated marketplace connects you in one tap to accredited pros: NABL diagnostic labs for staff health, licensed pest exterminators, 24/7 refrigeration engineers, and official FoSTaC training institutes.
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/providers" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
                  Browse Services Marketplace <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Moat 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="icon-tile" style={{ width: 44, height: 44, borderRadius: 12, background: '#e9f7ef', color: 'var(--green)' }}>
                  <ShieldCheck size={22} />
                </div>
                <span className="pill good" style={{ fontSize: 11, padding: '4px 8px' }}>MOAT 03</span>
              </div>
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>REGULATORY SHIELD</p>
              <h3 style={{ fontSize: 19, margin: '0 0 10px', color: '#0f172a' }}>Bulletproof Defense: Always Inspection-Ready</h3>
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, flex: 1 }}>
                Built squarely on the legal bedrock of FSSAI Schedule 4 and international HACCP standards. Every temperature probe (&lt; 5°C cold storage, &lt; −18°C deep freeze, &ge; 75°C cooking), employee medical clearance, and sanitization cycle is cryptographically logged with tamper-evident timestamps. When an FDA inspector walks in unannounced, you hand them an airtight digital dossier with total confidence.
              </p>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/food-safety-framework" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
                  View Compliance Framework <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Optional Modules */}
        <section className="section-block" style={{ marginTop: 36, background: '#ffffff', padding: '28px 24px', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="section-title" style={{ display: 'block', marginBottom: 18 }}>
            <span className="pill neutral" style={{ marginBottom: 6 }}>ADVANCED WORKFLOWS</span>
            <h2 style={{ fontSize: 24, margin: '6px 0 6px' }}>Optional Modules</h2>
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

        {/* Learning Cards (Swiggy / Urban Company Service Tiles) */}
        <section className="section-block">
          <div className="section-title">
            <div>
              <p className="eyebrow">START HERE</p>
              <h2>Food safety learning &amp; controls</h2>
              <p className="muted">Everything the supervisor and team need to understand what to check and why.</p>
            </div>
          </div>
          <div className="grid grid2">
            {learning.map(({ href, icon: Icon, eyebrow, title, text, bg, color }) => (
              <Link href={href} className="card link-card interactive" key={href} style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                padding: '20px 22px'
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: bg,
                  color: color,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>{eyebrow}</p>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16.5, fontWeight: 800, color: '#0f172a' }}>{title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>{text}</p>
                </div>
                <ChevronRight size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </section>

        {/* The 5-Step Operational Flow */}
        <section className="card home-flow" style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: 20
        }}>
          <div>
            <p className="eyebrow">THE FOODSAFE365 OPERATIONAL WORKFLOW</p>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>Understand → Check → Correct → Verify → Record</h2>
            <p className="muted" style={{ fontSize: 14, maxWidth: 600 }}>
              The platform helps the supervisor detect problems early, ensures manager review confirms real alerts, drives restaurant corrective action, and archives verifiable records.
            </p>
          </div>
          <Link className="btn secondary" href="/food-safety-framework">
            See the framework <ArrowRight size={16} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <Link href="/providers">Providers &amp; Vendors</Link>
          <Link href="/contact">Contact Us</Link>
          <a href="mailto:ray.health.ai@gmail.com">ray.health.ai@gmail.com</a>
          <span style={{ marginLeft: 'auto', color: 'var(--muted)' }}>© FoodSafe365 · All Rights Reserved</span>
        </footer>
      </div>
    </main>
  );
}
