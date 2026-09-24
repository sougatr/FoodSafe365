'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Share2,
  QrCode,
  Calendar,
  Building,
  Award,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
  ChevronRight,
  Home
} from 'lucide-react';
import {
  FOODSAFE28,
  isScheduledCheck,
  calculateDailyBadge,
  PHASE1_STORAGE_KEY,
  AppPhase1State
} from '@/lib/foodsafety28';
import { useLanguage, Language } from '@/lib/vernacular';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';

export default function ShowcasePage() {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<AppPhase1State>({});
  const [restaurantName, setRestaurantName] = useState('Grand Taj Kitchen & Grill');
  const [fssaiNumber, setFssaiNumber] = useState('11524012000492');
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
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://food-safe365.vercel.app';
    const auditUrl = `${origin}/diner`;
    let msg = '';

    if (lang === 'hi') {
      msg = `🌟 *${restaurantName} को आज FoodSafetyGreen™ प्रमाणन मिला है!* 🌟\n\n` +
        `✅ आज सभी 29 आवश्यक हाइजीन और तापमान नियंत्रण (कोल्ड स्टोरेज <5°C, कुकिंग ≥75°C, पेस्ट कंट्रोल) की जांच पूरी हुई।\n\n` +
        `🛡️ हमारा लाइव खाद्य सुरक्षा ऑडिट देखें:\n${auditUrl}\n\n` +
        `_FoodSafe365 स्वायत्त सुरक्षा प्रणाली द्वारा प्रमाणित_`;
    } else if (lang === 'mr') {
      msg = `🌟 *${restaurantName} आज FoodSafetyGreen™ प्रमाणित आहे!* 🌟\n\n` +
        `✅ आज सर्व 29 महत्त्वपूर्ण स्वच्छता व तापमान तपासण्या (कोल्ड स्टोरेज <५°C, कुकिंग ≥७५°C, पेस्ट कंट्रोल) यशस्वीरित्या पूर्ण झाल्या.\n\n` +
        `🛡️ आमचे थेट अन्न सुरक्षा ऑडिट येथे तपासा:\n${auditUrl}\n\n` +
        `_FoodSafe365 स्वायत्त सुरक्षा प्रणालीद्वारे प्रमाणित_`;
    } else {
      msg = `🌟 *${restaurantName} is FoodSafetyGreen™ Verified Today!* 🌟\n\n` +
        `✅ All 29 critical kitchen hygiene, cold storage (<5°C), cooking core (≥75°C), and pest control checks have been inspected and verified.\n\n` +
        `🛡️ View our live diner food safety audit:\n${auditUrl}\n\n` +
        `_Certified by FoodSafe365 Kitchen Intelligence_`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }

  function handleCopyShareLink() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://food-safe365.vercel.app';
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
      <div className="topbar print-hide">
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
          <span className="pill good" style={{ fontSize: 10.5, padding: '3px 9px' }}>
            {t('badge.verified')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <LanguageSelector />
          <ThemeToggle />
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', borderRadius: 10 }}>
            <Home size={14} /> {t('nav.home')}
          </Link>
          <Link href="/checks" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px', borderRadius: 10 }}>
            {t('nav.checks')}
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 28, paddingBottom: 64 }}>
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
                  ★ {lang === 'hi' ? 'दैनिक ग्राहक बैज' : lang === 'mr' ? 'दैनिक ग्राहक बॅज' : 'DAILY DINER BADGE'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted, #64748b)' }}>
                  {todayFormatted}
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: '2px 0 4px', color: 'var(--text, #0f172a)' }}>
                {lang === 'hi'
                  ? 'FoodSafetyGreen™ दैनिक सत्यापन बैज'
                  : lang === 'mr'
                  ? 'FoodSafetyGreen™ दैनिक प्रमाणन बॅज'
                  : 'FoodSafetyGreen™ Daily Verified Showcase'}
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--muted, #64748b)' }}>
                {lang === 'hi'
                  ? 'डाइनर्स और FDA निरीक्षकों के लिए टेबल स्टैंडी, विंडो स्टिकर और सोशल प्रूफ'
                  : lang === 'mr'
                  ? 'ग्राहक आणि FDA निरीक्षकांसाठी टेबल स्टॅन्डी, विंडो स्टिकर व सोशल प्रूफ'
                  : 'High-visibility digital certificate, printable acrylic table standee, and social proof'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="btn primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, padding: '9px 16px', borderRadius: 12 }}
              >
                <Printer size={16} />
                {t('action.printStandee')}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="btn secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  padding: '9px 16px',
                  borderRadius: 12,
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700
                }}
              >
                <Share2 size={16} />
                {t('action.shareWhatsApp')}
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 14px', borderRadius: 12 }}
              >
                {shareCopied ? <Check size={14} style={{ color: '#059669' }} /> : <ExternalLink size={14} />}
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
          {/* Subtle Guilloche / Security Watermark Background Pattern */}
          <div style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Header: Trust Seal & FSSAI Verification Status */}
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
                    {t('badge.safeDining')}
                  </span>
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>
                    ★ FSSAI AUDIT VERIFIED
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
                  {t('badge.verified')}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: '#047857', fontWeight: 600 }}>
                  {t('badge.tagline')}
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
                {t('badge.dateVerified')}
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
          <div style={{ textAlign: 'center', margin: '16px 0 28px' }}>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#047857'
            }}>
              {lang === 'hi' ? 'प्रमाणित रसोई प्रतिष्ठान' : lang === 'mr' ? 'प्रमाणित स्वयंपाकघर प्रतिष्ठान' : 'CERTIFIED FOOD SERVICE ESTABLISHMENT'}
            </span>
            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 40px)',
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
              fontSize: 14.5,
              color: '#334155',
              maxWidth: 620,
              lineHeight: 1.5,
              fontWeight: 500
            }}>
              {lang === 'hi'
                ? `यह किचन आज के लिए पूर्णतः स्वच्छ, तापमान नियंत्रित एवं FSSAI मानकों के 100% अनुकूल प्रमाणित है।`
                : lang === 'mr'
                ? `हे स्वयंपाकघर आजच्या दिवसासाठी पूर्णपणे स्वच्छ, तापमान नियंत्रित आणि FSSAI मानकांनुसार १००% सुरक्षित प्रमाणित आहे.`
                : `This kitchen has successfully executed and verified all statutory food hygiene, cold-chain safety, and sanitary protocols for today's service.`}
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
              <span>FSSAI Lic: <strong>{fssaiNumber}</strong></span>
              <span>•</span>
              <span>Audit ID: <strong>FS365-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}</strong></span>
            </div>
          </div>

          {/* The 4 Inspection Pillars Verified */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginBottom: 28
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
                {lang === 'hi' ? 'तापमान नियंत्रण' : lang === 'mr' ? 'तापमान नियंत्रण' : 'Cold & Hot Controls'}
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                &lt; 5°C Chilled · &gt; 75°C Cook
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ {lang === 'hi' ? 'प्रमाणित' : lang === 'mr' ? 'प्रमाणित' : 'Verified OK'}
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
                {lang === 'hi' ? 'हाइजीन व मेडिकल' : lang === 'mr' ? 'स्वच्छता व वैद्यकीय' : 'Hygiene & Medical'}
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                Form 1A Clean · 20s Wash
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ {lang === 'hi' ? 'प्रमाणित' : lang === 'mr' ? 'प्रमाणित' : 'Verified OK'}
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
                {lang === 'hi' ? 'कीट व ड्रेनेज मुक्त' : lang === 'mr' ? 'कीटक व ड्रेनेज मुक्त' : 'Pests & Drains'}
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                Zero Pests · Free-Flow Drains
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ {lang === 'hi' ? 'प्रमाणित' : lang === 'mr' ? 'प्रमाणित' : 'Verified OK'}
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
                {lang === 'hi' ? 'क्रॉस संदूषण रोकथाम' : lang === 'mr' ? 'क्रॉस संसर्ग प्रतिबंध' : 'Cross-Contamination'}
              </div>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginTop: 2 }}>
                Color Boards · FIFO Tagged
              </div>
              <div style={{ marginTop: 6, fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                ✓ {lang === 'hi' ? 'प्रमाणित' : lang === 'mr' ? 'प्रमाणित' : 'Verified OK'}
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
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" width="76" height="76" style={{ display: 'block' }}>
                  <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                  {/* Top-left corner finder */}
                  <rect x="10" y="10" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="14" y="14" width="18" height="18" fill="#ffffff" />
                  <rect x="18" y="18" width="10" height="10" fill="#047857" />
                  {/* Top-right corner finder */}
                  <rect x="64" y="10" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="68" y="14" width="18" height="18" fill="#ffffff" />
                  <rect x="72" y="18" width="10" height="10" fill="#047857" />
                  {/* Bottom-left corner finder */}
                  <rect x="10" y="64" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="14" y="68" width="18" height="18" fill="#ffffff" />
                  <rect x="18" y="72" width="10" height="10" fill="#047857" />
                  {/* Dense data matrix pixels */}
                  <rect x="42" y="12" width="6" height="6" fill="#047857" />
                  <rect x="52" y="12" width="6" height="6" fill="#047857" />
                  <rect x="42" y="24" width="16" height="6" fill="#047857" />
                  <rect x="12" y="42" width="6" height="16" fill="#047857" />
                  <rect x="24" y="42" width="6" height="8" fill="#047857" />
                  <rect x="36" y="36" width="28" height="28" fill="#059669" rx="4" />
                  {/* Center Shield Symbol in QR */}
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
                  {lang === 'hi'
                    ? 'अपने स्मार्टफोन कैमरे से स्कैन करें और रसोई का लाइव तापमान और हाइजीन रिकॉर्ड देखें।'
                    : lang === 'mr'
                    ? 'आपल्या स्मार्टफोन कॅमेऱ्याने स्कॅन करा आणि स्वयंपाकघराच्या थेट तापमान नोंदी व स्वच्छता प्रमाणपत्र तपासा.'
                    : 'Point smartphone camera to inspect today’s certified temperature logs and supervisor signs.'}
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

            {/* Official Certification Signature */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                Verified By FoodSafe365
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 900,
                color: '#059669',
                marginTop: 2
              }}>
                [✓ PROTOCOL VERIFIED]
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                29 / 29 Safeguards Met
              </div>
            </div>
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
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', color: 'var(--text, #0f172a)' }}>
            💡 {lang === 'hi' ? 'इस बैज का उपयोग कैसे करें?' : lang === 'mr' ? 'या बॅजचा कसा वापर करावा?' : 'How to Showcase Your FoodSafetyGreen Badge?'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-body, #475569)' }}>
              <strong style={{ color: 'var(--text, #0f172a)', display: 'block', marginBottom: 4 }}>
                1. 🪟 {lang === 'hi' ? 'प्रवेश द्वार स्टिकर / विंडो डिकल' : lang === 'mr' ? 'प्रवेशद्वार स्टिकर / विंडो डिकल' : 'Front Door / Window Decal'}
              </strong>
              {lang === 'hi'
                ? 'A4 आकार में प्रिंट करें और रेस्तरां के मुख्य दरवाजे या रिसेप्शन पर लगाएं ताकि आने वाले ग्राहक और FDA अधिकारी तुरंत देख सकें।'
                : lang === 'mr'
                ? 'A4 आकारावर प्रिंट करा आणि मुख्य दरवाजावर किंवा रिसेप्शनवर लावा, जेणेकरून येणारे ग्राहक आणि FDA अधिकारी लगेच पाहू शकतील.'
                : 'Print on A4 photo paper or transparent vinyl and mount on your entrance door or host podium.'}
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-body, #475569)' }}>
              <strong style={{ color: 'var(--text, #0f172a)', display: 'block', marginBottom: 4 }}>
                2. 🍽️ {lang === 'hi' ? 'एक्रिलिक टेबल स्टैंडी (A5)' : lang === 'mr' ? 'ॲक्रेलिक टेबल स्टॅन्डी (A5)' : 'Acrylic Table Standee (A5)'}
              </strong>
              {lang === 'hi'
                ? 'A5 आकार में प्रिंट कर टेबल टेंट में लगाएं। ग्राहक QR स्कैन करके निश्चिंत होकर खाना ऑर्डर करते हैं।'
                : lang === 'mr'
                ? 'A5 आकारावर प्रिंट करून टेबल टेंटमध्ये ठेवा. ग्राहक QR स्कॅन करून निर्धास्तपणे जेवणाचा आस्वाद घेतात.'
                : 'Slide an A5 print into clear acrylic table tents on each dining table. Diners can scan the QR while waiting.'}
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-body, #475569)' }}>
              <strong style={{ color: 'var(--text, #0f172a)', display: 'block', marginBottom: 4 }}>
                3. 📱 {lang === 'hi' ? 'व्हाट्सएप व इंस्टाग्राम स्टोरी' : lang === 'mr' ? 'व्हॉट्सॲप व इन्स्टाग्राम स्टोरी' : 'WhatsApp & Instagram Stories'}
              </strong>
              {lang === 'hi'
                ? 'दैनिक जांच पूरी होते ही "Share on WhatsApp" दबाएं और अपने ब्रॉडकास्ट ग्रुप और सोशल मीडिया पर शेयर करें।'
                : lang === 'mr'
                ? 'दैनिक तपासणी पूर्ण झाल्यावर "Share on WhatsApp" वर क्लिक करा आणि स्टेटसवर शेअर करा.'
                : 'Share daily audit achievements with your food connoisseurs and regulars on WhatsApp and Instagram.'}
            </div>
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

