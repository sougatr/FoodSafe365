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
  Home as HomeIcon,
  QrCode,
  Store,
  Wrench,
  Award
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
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/vernacular';
import GlobalHeader from '@/components/GlobalHeader';

export default function Home() {
  const { lang, t } = useLanguage();
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
      <GlobalHeader />
      {/* Kitchen Operations Sub-bar */}
      <div style={{ background: 'var(--surface, #ffffff)', borderBottom: '1px solid var(--border, #e2e8f0)', padding: '10px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text, #0f172a)' }}>Kitchen Operations</span>
            <span className="pill good" style={{ fontSize: 10.5, padding: '2px 8px' }}>
              {t('nav.fssaiLive')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/checks" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px' }}>
              {t('nav.checks')}
            </Link>
            <Link href="/showcase" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px', color: 'var(--green-dark)', fontWeight: 700 }}>
              <Award size={13} style={{ marginRight: 4, display: 'inline' }} /> {t('nav.showcase')}
            </Link>
            <Link href="/manager" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px' }}>
              {t('nav.manager')}
            </Link>
            <Link href="/manager/trends" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px', color: 'var(--green)' }}>
              {t('nav.aiTrends')}
            </Link>
            <Link href="/ai-copilot" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px', color: 'var(--green)' }}>
              {t('nav.aiCopilot')}
            </Link>
            <Link href="/actions" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px' }}>
              {t('nav.actions')}
            </Link>
            <Link href="/records" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px' }}>
              {t('nav.records')}
            </Link>
            <Link href="/providers" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px' }}>
              {t('nav.providers')}
            </Link>
          </div>
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
              {t('hero.title1')} <br />
              <span style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{t('hero.title2')}</span>
            </h1>

            <p className="lead" style={{ fontSize: 18, color: 'var(--text-body)', fontWeight: 600, lineHeight: 1.5, margin: '0 0 10px' }}>
              {t('hero.subtitle')}
            </p>

            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6, maxWidth: 620, margin: '0 0 24px' }}>
              {lang === 'hi'
                ? 'FoodSafe365 सरकारी खाद्य सुरक्षा नियमों को आसान दैनिक आदतों में बदल देता है—ताकि आपका रेस्तरां हमेशा खुला रहे और ग्राहक सुरक्षित रहें।'
                : lang === 'mr'
                ? 'FoodSafe365 शासकीय अन्न सुरक्षा नियमांचे सोप्या दैनंदिन सवयींमध्ये रूपांतर करते—जेणेकरून तुमचे स्वयंपाकघर नेहमी सुरू राहील आणि ग्राहक सुरक्षित राहतील.'
                : 'FoodSafe365 transforms statutory food safety mandates into effortless daily habits—protecting your diners, preserving your brand reputation, and keeping your dining room doors open every single day.'}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn primary" href="/checks">
                {t('action.startToday')} <ArrowRight size={16} />
              </Link>
              <Link className="btn secondary" href="/manager">
                {t('action.managerReview')}
              </Link>
              <Link className="btn secondary" href="/records">
                {t('nav.records')}
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

            <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>{t('hero.dailyStatus')}</p>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>{badge.status}</h2>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: '0 0 16px' }}>{badge.explanation}</p>

            {/* Submission Mini Progress */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                <span>{lang === 'hi' ? 'शिफ्ट प्रगति' : lang === 'mr' ? 'शिफ्ट प्रगती' : 'Shift Completion'}</span>
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
              <span>{lang === 'hi' ? 'जमा जांच:' : lang === 'mr' ? 'सादर तपासणी:' : 'Submitted:'} <strong style={{ color: '#0f172a' }}>{badge.counts.submitted}/{badge.counts.scheduled}</strong></span>
              <span>{lang === 'hi' ? 'खुले अलर्ट:' : lang === 'mr' ? 'सक्रिय अलर्ट:' : 'Open alerts:'} <strong style={{ color: badge.counts.openAlerts > 0 ? '#dc2626' : '#059669' }}>{badge.counts.openAlerts}</strong></span>
            </div>

            {/* Link to FoodSafetyGreen Showcase Badge */}
            <div style={{ marginTop: 16 }}>
              <Link
                href="/showcase"
                className="btn primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 13,
                  padding: '9px 14px',
                  borderRadius: 12,
                  textDecoration: 'none'
                }}
              >
                <Award size={15} />
                {t('action.viewBadge')}
              </Link>
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
              Core Purpose · Food Safety In Action
            </span>
          </div>

          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: '#1e293b', fontWeight: 600, margin: '0 0 16px' }}>
            Behind every safe meal is a kitchen that gets the small things right, every day. FoodSafe365 turns food-safety practices into simple daily actions—helping businesses deliver safer, more wholesome food to the community.
          </p>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>💡</span>
              <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
                <strong>{lang === 'hi' ? 'दैनिक अनुशासन:' : lang === 'mr' ? 'दैनिक शिस्त:' : 'Daily Discipline:'}</strong>{' '}
                {lang === 'hi'
                  ? '29 आवश्यक परिचालन सुरक्षा उपाय हर दिन आपकी रसोई को स्वच्छ और ऑडिट के लिए तैयार रखते हैं।'
                  : lang === 'mr'
                  ? '२९ आवश्यक परिचालन सुरक्षा उपाय दररोज तुमचे किचन स्वच्छ आणि ऑडिटसाठी सज्ज ठेवतात.'
                  : '29 operational safeguards engineered for daily kitchen discipline, zero contamination, and continuous audit readiness.'}
              </span>
            </div>
            <Link href="/checklist" className="btn secondary" style={{ fontSize: 13, padding: '8px 18px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View 29 Operational Safeguards <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Operational Shift Fast-Track Checklists (2-3 Minutes Each — Designed to Match Kitchen Rhythm) */}
        <section className="section-block" style={{ marginTop: 36 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div>
              <span className="pill good" style={{ marginBottom: 6 }}>TIME-PHASED WORKFLOW</span>
              <h2 style={{ fontSize: 24, margin: '6px 0 4px', color: '#0f172a' }}>
                Operational Shift Checklists · 2 to 3 Minutes Each
              </h2>
              <p className="muted" style={{ fontSize: 14.5, margin: 0 }}>
                Split naturally across kitchen hours. Floor supervisors only spend 2–3 minutes at specific times of the day.
              </p>
            </div>
            <Link href="/checks" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
              Open Full Checklist Hub <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid3" style={{ gap: 16 }}>
            {/* Shift 1: The Opening Shift */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#ecfdf5',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    🌅
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0'
                  }}>
                    ⏱️ 2–3 mins · Morning
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  1. The Opening Shift
                </h3>
                <p style={{ fontSize: 13, color: '#059669', fontWeight: 700, margin: '0 0 10px' }}>
                  Pre-Service Readiness (7 Checks)
                </p>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 14px' }}>
                  Completed in the morning before food preparation begins. Ensures clean counters, stocked sinks, cold refrigeration (&lt;5°C / &lt;−18°C), and zero pest signs.
                </p>
                <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>Staff uniforms, aprons & hairnets (Item 6)</li>
                  <li>Hand-wash sinks with soap & tissue (Item 5)</li>
                  <li>Fridges (&lt;5°C) & freezers (&lt;−18°C) (Items 17, 18)</li>
                  <li>Doors closed & zero pest signs (Items 3, 21)</li>
                  <li>Clean counters & floors (Item 1)</li>
                </ul>
              </div>
              <Link
                href="/checks?shift=opening"
                className="btn primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  padding: '9px 14px'
                }}
              >
                Start Opening Shift (2-3 min) <ArrowRight size={15} />
              </Link>
            </div>

            {/* Shift 2: Active Service */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#eff6ff',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    🍳
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe'
                  }}>
                    ⏱️ 2–3 mins · Mid-Day
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  2. Active Service
                </h3>
                <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, margin: '0 0 10px' }}>
                  Prep &amp; Cooking Stations (6 Checks)
                </p>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 14px' }}>
                  Completed during service or delegated to station chefs (Chef de Partie). Rapid visual sweep on receiving, cross-contamination, and cooking temperatures.
                </p>
                <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>Receiving raw materials inspection (Item 9)</li>
                  <li>Washing fruits & vegetables (Item 13)</li>
                  <li>Colored cutting boards & hand washing (Items 4, 14)</li>
                  <li>Cooking core temp ≥ 75°C (Item 19)</li>
                  <li>Service protection: covered preps (Item 16)</li>
                </ul>
              </div>
              <Link
                href="/checks?shift=active"
                className="btn primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  padding: '9px 14px'
                }}
              >
                Start Active Service (2-3 min) <ArrowRight size={15} />
              </Link>
            </div>

            {/* Shift 3: The Closing Shift */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#f5f3ff',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    🌙
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#f5f3ff',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe'
                  }}>
                    ⏱️ 2–3 mins · Night
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  3. The Closing Shift
                </h3>
                <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700, margin: '0 0 10px' }}>
                  Shutdown &amp; Reset (8 Checks)
                </p>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 14px' }}>
                  Completed at the end of the night. Secures leftovers in shallow pans, safely segregates raw meat, rotates FIFO inventory, and guards against overnight pests.
                </p>
                <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>Cooling leftovers in shallow pans (Item 20)</li>
                  <li>Raw meat on bottom shelves (Item 10)</li>
                  <li>FIFO inventory dated & 6" off floor (Items 11, 12)</li>
                  <li>Sanitizing shared blenders & slicers (Item 15)</li>
                  <li>Covered pedal bins & free drains (Items 2, 23)</li>
                  <li>Fly-killers on & bait stations intact (Item 22)</li>
                </ul>
              </div>
              <Link
                href="/checks?shift=closing"
                className="btn primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  padding: '9px 14px'
                }}
              >
                Start Closing Shift (2-3 min) <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Conditional Specialized & Manager Audit Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 14,
            marginTop: 16
          }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🏢</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    4. Specialized Stations (Conditional)
                  </h4>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
                    Bar &amp; Draught Beer (2) · Cloud Delivery Hub (2) · Outdoor Catering (2)
                  </p>
                </div>
              </div>
              <Link
                href="/checks?shift=specialized"
                className="btn secondary"
                style={{ fontSize: 12.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                View Stations <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    5. Manager's Monthly Admin Audit
                  </h4>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
                    FoSTaC Supervisor Training (Item 7) &amp; 6-Monthly Staff Medical Form 1A (Item 8)
                  </p>
                </div>
              </div>
              <Link
                href="/manager"
                className="btn secondary"
                style={{ fontSize: 12.5, padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                Open Admin Audit <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* FoodSafe365 Passport: The Architecture of Trust & 9 Customer Touchpoints */}
        <section className="section-block" style={{ marginTop: 44 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <span className="pill good" style={{ marginBottom: 6 }}>FOODSAFE365 PASSPORT · THE FLYWHEEL OF TRUST</span>
              <h2 style={{ fontSize: 26, margin: '6px 0 4px', color: '#0f172a' }}>
                FoodSafe365 Passport: Show Customers How You Manage Food Safety
              </h2>
              <p className="muted" style={{ fontSize: 14.5, margin: 0, maxWidth: 840 }}>
                Restaurant Daily Checks → FoodSafe365 Verification → Visible Food-Safety Record (Passport) → Consumer → Trust.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/showcase" className="btn primary" style={{ fontSize: 13, padding: '7px 16px' }}>
                <Award size={15} /> Preview FoodSafe365 Passport
              </Link>
              <Link href="/qr/abc-restaurant" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
                <QrCode size={15} /> Test Diner QR Flow
              </Link>
            </div>
          </div>

          {/* 9 Customer Touchpoints Deployment Grid */}
          <div className="card" style={{ background: '#ffffff', border: '1.5px solid #a7f3d0', borderRadius: 18, padding: '24px 28px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📍</span>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Deploy Your FoodSafe365 Passport QR Across 9 Customer Touchpoints
                </h3>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                  Let customers scan and see your verified daily food-safety discipline at every stage of their dining journey:
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {[
                { icon: '🚪', title: '1. Restaurant Entrance', desc: 'Door decal or window plaque reassuring guests before they step in.' },
                { icon: '📋', title: '2. Dine-In Menu', desc: 'Front page or footer QR corner so guests verify hygiene while choosing dishes.' },
                { icon: '🪑', title: '3. Table Tent', desc: 'Acrylic standee on every table for instant diner safety rating & reviews.' },
                { icon: '🥡', title: '4. Takeaway Packaging', desc: 'Stamp or sticker on carryout bags signaling kitchen cleanliness to go.' },
                { icon: '🛵', title: '5. Delivery Bags', desc: 'Tamper-evident seal for Zomato & Swiggy orders guaranteeing safe transit.' },
                { icon: '📦', title: '6. Food Containers', desc: 'Individual meal container lid seal certifying sealed, uncontaminated prep.' },
                { icon: '🧾', title: '7. Bills & Receipts', desc: 'Printed at the bottom of the POS receipt with link to rate food safety.' },
                { icon: '🌐', title: '8. Restaurant Website', desc: 'Live digital trust widget embedded directly on your ordering page.' },
                { icon: '📱', title: '9. Social Media', desc: 'Instagram bio stamp and WhatsApp broadcast proof of daily audit passes.' },
              ].map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <strong style={{ fontSize: 13.5, color: '#0f172a' }}>{t.title}</strong>
                  </div>
                  <p className="muted" style={{ fontSize: 12, lineHeight: 1.45, margin: 0 }}>
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#047857', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Over 140+ verified diners rate restaurants monthly through FoodSafe365 tabletop QR codes.</span>
              </div>
              <Link href="/showcase" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 14px' }}>
                Print Official FoodSafe365 QR Passport Kit →
              </Link>
            </div>
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
