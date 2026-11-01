'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Share2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  Calendar,
  Check,
  Edit2,
  Clock,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Send,
  AlertTriangle
} from 'lucide-react';
import {
  FOODSAFE28,
  isScheduledCheck,
  calculateDailyBadge,
  PHASE1_STORAGE_KEY,
  AppPhase1State
} from '@/lib/foodsafety28';
import GlobalHeader from '@/components/GlobalHeader';
import { useLanguage, Language } from '@/lib/vernacular';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';

export default function ShowcasePage() {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<AppPhase1State>({});
  const [restaurantName, setRestaurantName] = useState('[DEMO] Sample Demonstration Kitchen & Grill');
  const [fssaiNumber, setFssaiNumber] = useState('DEMO-SAMPLE-LIC-0000');
  const [isEditing, setIsEditing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));

      const savedName = localStorage.getItem('foodsafe_restaurant_name');
      if (savedName) setRestaurantName(savedName);

      const savedFssai = localStorage.getItem('foodsafe_fssai_lic');
      if (savedFssai) setFssaiNumber(savedFssai);
    } catch {
      // ignore
    }
  }, []);

  const scheduled = useMemo(() => FOODSAFE28.filter(isScheduledCheck), []);
  const badge = useMemo(() => {
    return calculateDailyBadge(data.checks || {}, data.issues || [], scheduled);
  }, [data, scheduled]);

  const verifiedCount = badge.counts.submitted > 0 ? badge.counts.submitted : 29;
  const totalCount = scheduled.length > 0 ? scheduled.length : 29;
  const grade = badge.tone === 'good' ? 'Grade A+' : 'In Progress';

  const todayFormatted = useMemo(() => {
    const d = new Date();
    if (lang === 'hi') {
      const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
      return `${d.getDate()} ${monthsHi[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (lang === 'mr') {
      const monthsMr = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
      return `${d.getDate()} ${monthsMr[d.getMonth()]} ${d.getFullYear()}`;
    }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [lang]);

  function handleSaveIdentity() {
    setIsEditing(false);
    try {
      localStorage.setItem('foodsafe_restaurant_name', restaurantName);
      localStorage.setItem('foodsafe_fssai_lic', fssaiNumber);
    } catch {}
  }

  function handlePrint() {
    window.print();
  }

  function handleWhatsAppShare() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.foodsafe365.in';
    const auditUrl = `${origin}/diner`;
    let msg = `🛡️ *${restaurantName} — FoodSafe365 Operational Status*\n\n` +
      `Operational status and daily safeguards preview:\n${auditUrl}\n\n` +
      `_Note: FoodSafe365 is an independent digital food-safety management platform. Operational status is not an FSSAI certification or statutory inspection._`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }

  function handleCopyShareLink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.foodsafe365.in';
    const auditUrl = `${origin}/diner`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(auditUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)' }}>
      {/* Top Navigation Bar - Hidden during printing */}
      <div className="print-hide">
        <GlobalHeader />
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 28, paddingBottom: 64 }}>
        
        {/* UNMISTAKABLE DEMO DATA NOTICE BANNER */}
        <div className="print-hide" style={{
          background: '#FFFBEB',
          border: '2px solid #F59E0B',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertTriangle size={24} style={{ color: '#D97706', flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
            <strong>DEMO DATA / SAMPLE DEMONSTRATION RECORD:</strong> The establishment details, licence numbers, and operational checklists on this showcase page are sample demonstration records for platform illustration. They do not represent genuine business records, authorized listings, official statutory inspections, or medical clearances.
          </div>
        </div>

        {/* Actions Bar / Control Center - Hidden during printing */}
        <section className="print-hide card" style={{
          marginBottom: 24,
          padding: '20px 24px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: 18,
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="pill good" style={{ fontSize: 11, padding: '3px 9px' }}>
                  ★ OPERATIONAL STATUS PREVIEW
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 6 }}>
                  DEMO RECORD
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted, #64748b)' }}>
                  {todayFormatted}
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'var(--text, #0f172a)' }}>
                FoodSafe365 Operational Status Dossier
              </h1>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                Display or print this operational status decal for front-of-house transparency and diner assurance.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="btn primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 16px', borderRadius: 12 }}
              >
                <Printer size={15} /> {lang === 'hi' ? 'प्रिंट / PDF सेव करें' : lang === 'mr' ? 'प्रिंट / PDF सेव्ह करा' : 'Print Decal / Save PDF'}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 14px', borderRadius: 12, color: '#047857' }}
              >
                <Share2 size={15} /> WhatsApp
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 14px', borderRadius: 12 }}
              >
                {shareCopied ? (lang === 'hi' ? 'लिंक कॉपी हो गया!' : lang === 'mr' ? 'लिंक कॉपी झाली!' : 'Audit Link Copied!') : (lang === 'hi' ? 'ऑडिट लिंक' : lang === 'mr' ? 'ऑडिट लिंक' : 'Copy Audit URL')}
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 12px', borderRadius: 12 }}
                title="Edit Restaurant Identity"
              >
                <Edit2 size={14} />
              </button>
            </div>
          </div>

          {/* Quick Edit Drawer for Restaurant Identity */}
          {isEditing && (
            <div style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid var(--border, #e2e8f0)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
              gap: 12,
              alignItems: 'flex-end'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted, #64748b)', marginBottom: 4 }}>
                  {lang === 'hi' ? 'रेस्तरां / आउटलेट का नाम' : lang === 'mr' ? 'रेस्टॉरंट / आउटलेटचे नाव' : 'Restaurant / Outlet Name'}
                </label>
                <input
                  type="text"
                  className="input"
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13.5 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted, #64748b)', marginBottom: 4 }}>
                  {lang === 'hi' ? 'FSSAI लाइसेंस संख्या' : lang === 'mr' ? 'FSSAI परवाना क्रमांक' : 'FSSAI License Number'}
                </label>
                <input
                  type="text"
                  className="input"
                  value={fssaiNumber}
                  onChange={e => setFssaiNumber(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13.5 }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSaveIdentity}
                  className="btn primary"
                  style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={14} /> {t('action.save')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* PRINTABLE SHOWCASE BADGE & STANDEE DECAL */}
        <div
          id="showcase-certificate"
          className="showcase-card-printable"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 40%, #ecfdf5 100%)',
            border: '3px solid #059669',
            borderRadius: 24,
            padding: '36px 36px 32px',
            boxShadow: '0 20px 50px -10px rgba(5, 150, 105, 0.18), 0 0 0 1px rgba(5, 150, 105, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* DEMO WATERMARK BADGE IN PRINT & SCREEN */}
          <div style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: '#FEF3C7',
            border: '1px solid #D97706',
            color: '#B45309',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: 6
          }}>
            DEMO DATA · SAMPLE RECORD
          </div>

          {/* Top Header: Trust Seal & Operational Status Title */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #a7f3d0',
            paddingBottom: 22,
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Emblem Stamp */}
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35), inset 0 0 0 3px #34d399, inset 0 0 0 5px #059669',
                textAlign: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={28} />
                <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>SAFE</span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#047857',
                    background: '#d1fae5',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    INDEPENDENT DIGITAL PLATFORM
                  </span>
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>
                    ★ DIGITAL AUDIT LOG
                  </span>
                </div>
                <h2 style={{
                  fontSize: 'clamp(22px, 3.2vw, 28px)',
                  fontWeight: 900,
                  margin: 0,
                  color: '#064e3b',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>
                  FoodSafe365 Operational Status
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: '#047857', fontWeight: 600 }}>
                  Active daily digital hygiene and temperature control tracking
                </p>
              </div>
            </div>

            {/* Verification Date & Stamp Badge */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #10b981',
              borderRadius: 14,
              padding: '10px 16px',
              textAlign: 'right',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.08em' }}>
                Last Updated
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                {todayFormatted}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 }}>
                <CheckCircle2 size={12} /> {grade}
              </div>
            </div>
          </div>

          {/* Restaurant Centerpiece & Verification Statement */}
          <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#047857'
            }}>
              FOOD SERVICE ESTABLISHMENT (DEMO RECORD)
            </span>
            <h1 style={{
              fontSize: 'clamp(26px, 4.2vw, 36px)',
              fontWeight: 900,
              color: '#0f172a',
              margin: '6px 0 6px',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}>
              {restaurantName}
            </h1>
            <p style={{
              margin: '0 auto',
              fontSize: 14,
              color: '#334155',
              maxWidth: 620,
              lineHeight: 1.5,
              fontWeight: 500
            }}>
              This establishment utilizes FoodSafe365 for daily operational kitchen hygiene logging, cold-chain monitoring, and supervisor review.
            </p>
            <div style={{
              marginTop: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#64748b',
              background: '#ffffff',
              padding: '4px 12px',
              borderRadius: 20,
              border: '1px solid #cbd5e1'
            }}>
              <Building size={13} style={{ color: '#059669' }} />
              <span>Lic Ref: <strong>{fssaiNumber}</strong></span>
              <span>•</span>
              <span>Audit ID: <strong>FS365-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}</strong></span>
            </div>
          </div>

          {/* FoodSafe365 Operational Status 5-Point Dashboard */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #A7F3D0',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.06)'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#064E3B' }}>
              🛡️ FoodSafe365 Operational Status
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ borderLeft: '3px solid #059669', paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 600 }}>Checks completed</span>
                <strong style={{ fontSize: 14, color: '#0F172A' }}>{verifiedCount} / {totalCount} Safeguards</strong>
              </div>
              <div style={{ borderLeft: '3px solid #059669', paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 600 }}>Manager reviewed</span>
                <strong style={{ fontSize: 14, color: '#0F172A' }}>Yes · Reviewed Today</strong>
              </div>
              <div style={{ borderLeft: `3px solid ${badge.counts.openAlerts > 0 ? '#DC2626' : '#059669'}`, paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 600 }}>Corrective actions</span>
                <strong style={{ fontSize: 14, color: badge.counts.openAlerts > 0 ? '#DC2626' : '#059669' }}>
                  {badge.counts.openAlerts === 0 ? '0 Outstanding' : `${badge.counts.openAlerts} In Progress`}
                </strong>
              </div>
              <div style={{ borderLeft: '3px solid #059669', paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 600 }}>Last updated</span>
                <strong style={{ fontSize: 14, color: '#0F172A' }}>{todayFormatted}</strong>
              </div>
              <div style={{ borderLeft: '3px solid #059669', paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 600 }}>Evidence available</span>
                <strong style={{ fontSize: 14, color: '#0F172A' }}>Digital Logs &amp; Signs</strong>
              </div>
            </div>
          </div>

          {/* The 4 Inspection Pillars Verified */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 24
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '14px 14px',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🌡️</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b' }}>
                Cold &amp; Hot Controls
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                &lt; 5°C Chilled · &gt; 75°C Cook
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ Operational Log OK
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '14px 14px',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🧼</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b' }}>
                Hygiene &amp; Fitness
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                Form 1A Clean · 20s Wash
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ Operational Log OK
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '14px 14px',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🪲</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b' }}>
                Pests &amp; Drains
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                Screening · Free-Flow Drains
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ Operational Log OK
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '14px 14px',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🥩</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b' }}>
                Cross-Contamination
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                Color Boards · FIFO Tagged
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ Operational Log OK
              </div>
            </div>
          </div>

          {/* Footer Call-to-Action with Live QR Code for Diner Audit */}
          <div style={{
            background: '#ffffff',
            border: '2px solid #a7f3d0',
            borderRadius: 18,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* QR Code Container */}
              <div style={{
                width: 90,
                height: 90,
                borderRadius: 12,
                border: '2px solid #059669',
                background: '#ffffff',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
                flexShrink: 0
              }}>
                <svg viewBox="0 0 100 100" width="76" height="76" style={{ display: 'block' }}>
                  <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                  <rect x="10" y="10" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="14" y="14" width="18" height="18" fill="#ffffff" />
                  <rect x="18" y="18" width="10" height="10" fill="#047857" />
                  <rect x="64" y="10" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="68" y="14" width="18" height="18" fill="#ffffff" />
                  <rect x="72" y="18" width="10" height="10" fill="#047857" />
                  <rect x="10" y="64" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="14" y="68" width="18" height="18" fill="#ffffff" />
                  <rect x="18" y="72" width="10" height="10" fill="#047857" />
                  <rect x="42" y="12" width="6" height="6" fill="#047857" />
                  <rect x="52" y="12" width="6" height="6" fill="#047857" />
                  <rect x="42" y="24" width="16" height="6" fill="#047857" />
                  <rect x="12" y="42" width="6" height="16" fill="#047857" />
                  <rect x="24" y="42" width="6" height="8" fill="#047857" />
                  <rect x="36" y="36" width="28" height="28" fill="#059669" rx="4" />
                  <path d="M50 42 L58 46 V53 C58 58 50 62 50 62 C50 62 42 58 42 53 V46 Z" fill="#ffffff" />
                  <rect x="70" y="42" width="8" height="8" fill="#047857" />
                  <rect x="82" y="48" width="8" height="8" fill="#047857" />
                  <rect x="42" y="70" width="8" height="8" fill="#047857" />
                  <rect x="54" y="66" width="6" height="12" fill="#047857" />
                  <rect x="66" y="74" width="12" height="6" fill="#047857" />
                  <rect x="80" y="66" width="10" height="10" fill="#047857" />
                  <rect x="74" y="82" width="8" height="8" fill="#047857" />
                </svg>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>
                  {t('badge.scanPrompt')}
                </div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                  Scan with smartphone camera to view today's daily digital operational checks and supervisor review.
                </div>
                <div style={{ marginTop: 6 }}>
                  <Link
                    href="/diner"
                    className="print-hide"
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none'
                    }}
                  >
                    Open Public Diner Audit Dossier <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Platform Reference */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                FoodSafe365 Digital Platform
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 900,
                color: '#059669',
                marginTop: 2
              }}>
                [OPERATIONAL LOGGED]
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                {verifiedCount} / {totalCount} Controls Active
              </div>
            </div>
          </div>

          {/* MANDATORY STATUTORY DISCLAIMER */}
          <div style={{
            marginTop: 20,
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid #CBD5E1',
            borderRadius: 10,
            fontSize: 11.5,
            color: '#475569',
            lineHeight: 1.5,
            textAlign: 'center'
          }}>
            <strong>Statutory Disclaimer:</strong> FoodSafe365 is an independent digital food-safety management platform. Its operational status is not an FSSAI certification, statutory inspection or guarantee of food safety.
          </div>
        </div>

        {/* Marketing & Table Placement Guide for Restaurateurs - Hidden in print */}
        <section className="print-hide card" style={{
          marginTop: 24,
          padding: '24px 28px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: 18,
          border: '1px solid var(--border, #e2e8f0)'
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 4px', color: 'var(--text, #0f172a)' }}>
            📍 Deploy Your FoodSafe365 Operational Status Across Customer Touchpoints
          </h3>
          <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
            Restaurant → FoodSafe365 → Transparent Operational Record → Consumer → Trust. Let customers scan and verify daily hygiene diligence:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {[
              { icon: '🚪', title: '1. Restaurant Entrance', desc: 'Mount an A4 plaque near your main entrance or host desk showing daily digital diligence before entering.' },
              { icon: '📋', title: '2. Dine-In Menu', desc: 'Print the QR code on the front cover or footer corner of menus so guests verify cleanliness while ordering.' },
              { icon: '🪑', title: '3. Table Tent Standee', desc: 'Slide an A5 print into clear acrylic table tents on every dining table. Diners scan to view temperatures and rate safety.' },
              { icon: '🥡', title: '4. Takeaway Packaging', desc: 'Stamp or sticker the FoodSafe365 QR onto paper takeout bags, demonstrating sanitary handling.' },
              { icon: '🛵', title: '5. Delivery Bags', desc: 'Apply a tamper-evident seal for delivery riders so online order customers know packaging was not opened in transit.' },
              { icon: '📦', title: '6. Food Containers', desc: 'Affix tamper closure tape across curry bowls and meal boxes confirming sealed kitchen prep.' },
              { icon: '🧾', title: '7. Bills & Receipts', desc: 'Configure your POS billing thermal printer to print the FoodSafe365 QR at the bottom of the bill receipt.' },
              { icon: '🌐', title: '8. Restaurant Website', desc: 'Embed the FoodSafe365 digital live operational status widget on your online ordering website.' },
              { icon: '📱', title: '9. Social Media', desc: 'Post daily food-safety check updates on Instagram & WhatsApp status to build loyal community brand trust.' },
            ].map((tp, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>{tp.icon}</span>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{tp.title}</strong>
                </div>
                <p className="muted" style={{ fontSize: 12, lineHeight: 1.45, margin: 0 }}>
                  {tp.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Print Specific CSS Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hide,
          .topbar,
          .foodsafe-chatbot-btn,
          button,
          nav,
          footer {
            display: none !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #showcase-certificate {
            box-shadow: none !important;
            border: 3px solid #059669 !important;
            border-radius: 16px !important;
            padding: 24px !important;
            page-break-inside: avoid !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </main>
  );
}
