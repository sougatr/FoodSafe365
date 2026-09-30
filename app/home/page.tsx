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
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>
                {lang === 'hi' ? 'सार्वजनिक विश्वास चक्र' : lang === 'mr' ? 'सार्वजनिक विश्वास चक्र' : 'PUBLIC TRUST FLYWHEEL'}
              </p>
              <h3 style={{ fontSize: 19, margin: '0 0 12px', color: '#0f172a' }}>
                {lang === 'hi' ? 'स्वच्छ किचन से भरें टेबल' : lang === 'mr' ? 'स्वच्छ किचन, खचाखच भरलेले टेबल्स' : 'Turning Clean Kitchens into Packed Tables'}
              </h3>
              
              <ul style={{ margin: '0 0 14px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'किचन-डोर पारदर्शिता:' : lang === 'mr' ? 'किचन-डोर पारदर्शकता:' : 'Kitchen-Door Transparency:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'अंदरूनी स्वच्छता अनुशासन को सीधे ग्राहकों के भरोसे में बदलें।'
                    : lang === 'mr'
                    ? 'अंतर्गत स्वच्छता शिस्तीचे रूपांतर थेट ग्राहकांच्या विश्वासात करा.'
                    : 'Turn back-of-house discipline into frontline diner trust.'}
                </li>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'लाइव टेबलटॉप QR प्रमाण:' : lang === 'mr' ? 'थेट टेबलटॉप QR पुरावा:' : 'Live Tabletop QR Proof:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'ग्राहक स्कैन करके आज का प्रमाणित सुरक्षा बैज तुरंत देख सकते हैं।'
                    : lang === 'mr'
                    ? 'ग्राहक स्कॅन करून आजचा प्रमाणित सुरक्षा बॅज त्वरित तपासू शकतात.'
                    : 'Diners scan to inspect today’s certified safety badge.'}
                </li>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'तत्काल प्रतिष्ठा सुरक्षा कवच:' : lang === 'mr' ? 'प्रतिष्ठा सुरक्षा कवच:' : 'Instant Reputation Firewall:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'ग्राहकों की समस्या सीधे GM के फोन पर पहुंचेगी—2 मिनट में टेबल पर समाधान, सोशल मीडिया पर नहीं।'
                    : lang === 'mr'
                    ? 'ग्राहकांच्या तक्रारी थेट GM च्या फोनवर पोहोचतात—२ मिनिटांत जागेवरच निवारण, गुगल रिव्ह्यूवर नाही.'
                    : 'Route guest concerns straight to your GM’s phone—resolved at the table in 2 minutes, never on Google Reviews.'}
                </li>
              </ul>

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
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>
                {lang === 'hi' ? 'ऑन-डिमांड इकोसिस्टम' : lang === 'mr' ? 'ऑन-डिमांड इकोसिस्टम' : 'ON-DEMAND ECOSYSTEM'}
              </p>
              <h3 style={{ fontSize: 19, margin: '0 0 12px', color: '#0f172a' }}>
                {lang === 'hi' ? 'सेवा मार्केटप्लेस ("कम्प्लायंस-एज-ए-सर्विस")' : lang === 'mr' ? 'सेवा मार्केटप्लेस ("कम्प्लायन्स-ॲज-अ-सर्व्हिस")' : 'The Service Marketplace ("Compliance-as-a-Service")'}
              </h3>
              
              <ul style={{ margin: '0 0 14px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'क्लोज्ड-लूप समाधान:' : lang === 'mr' ? 'क्लोज्ड-लूप तोडगा:' : 'Closed-Loop Resolution:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'सिर्फ खामियां न बताएं—एक टैप में उन्हें तुरंत ठीक करें।'
                    : lang === 'mr'
                    ? 'केवळ त्रुटी दाखवू नका—एका टॅपमध्ये त्यांची त्वरित दुरुस्ती करा.'
                    : 'Don’t just detect violations—fix them immediately in one tap.'}
                </li>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'प्रमाणित पार्टनर नेटवर्क:' : lang === 'mr' ? 'प्रमाणित भागीदार नेटवर्क:' : 'Accredited Partner Network:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'NABL मान्यता प्राप्त लैब, लाइसेंस प्राप्त पेस्ट कंट्रोल और 24/7 HVAC इंजीनियरों तक सीधी पहुंच।'
                    : lang === 'mr'
                    ? 'NABL मान्यताप्राप्त लॅब, परवानाधारक पेस्ट कंट्रोल आणि २४/७ HVAC इंजिनिअर्सशी थेट जोडणी.'
                    : 'On-demand access to NABL medical labs, licensed pest exterminators, and 24/7 HVAC technicians.'}
                </li>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'ऑडिट की कोई चिंता नहीं:' : lang === 'mr' ? 'ऑडिटची कोणतीही चिंता नाही:' : 'Zero Audit Panic:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'स्टाफ के 6-मासिक स्टूल टेस्ट, फॉर्म 1A और FoSTaC ट्रेनिंग नवीनीकरण की ऑटोमेटेड बुकिंग।'
                    : lang === 'mr'
                    ? 'कर्मचाऱ्यांच्या ६-महिन्यांच्या स्टूल टेस्ट, फॉर्म 1A आणि FoSTaC प्रशिक्षण नूतनीकरणाची स्वयंचलित बुकिंग.'
                    : 'Automated dispatch for 6-month staff stool tests, Form 1A certificates, and FoSTaC training renewals.'}
                </li>
              </ul>

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
              <p className="eyebrow" style={{ color: 'var(--green-dark)', fontWeight: 800 }}>
                {lang === 'hi' ? 'नियामक सुरक्षा कवच' : lang === 'mr' ? 'नियामक सुरक्षा कवच' : 'REGULATORY SHIELD'}
              </p>
              <h3 style={{ fontSize: 19, margin: '0 0 12px', color: '#0f172a' }}>
                {lang === 'hi' ? 'अचूक सुरक्षा: हमेशा निरीक्षण के लिए तैयार' : lang === 'mr' ? 'अभेद्य संरक्षण: नेहमी तपासणीसाठी सज्ज' : 'Bulletproof Defense: Always Inspection-Ready'}
              </h3>
              
              <ul style={{ margin: '0 0 14px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'FSSAI और HACCP अनुरूप:' : lang === 'mr' ? 'FSSAI व HACCP मानकांनुसार:' : 'FSSAI & HACCP Native:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'FSSAI शेड्यूल 4 और अंतरराष्ट्रीय तापमान मानकों पर पूरी तरह आधारित।'
                    : lang === 'mr'
                    ? 'FSSAI शेड्युल ४ आणि आंतरराष्ट्रीय तापमान मानकांवर पूर्णपणे आधारित.'
                    : 'Built strictly around statutory Schedule 4 mandates and thermal critical control limits.'}
                </li>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'छेड़छाड़-मुक्त डिजिटल ऑडिट ट्रेल:' : lang === 'mr' ? 'छेडछाड-मुक्त डिजिटल ऑडिट ट्रेल:' : 'Tamper-Evident Audit Trail:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'कोल्ड चेन (<5°C), कुकिंग कोर (≥75°C) और स्वच्छता लॉग पर रियल-टाइम डिजिटल टाइमस्टैम्प।'
                    : lang === 'mr'
                    ? 'कोल्ड चेन (<५°C), कुकिंग कोअर (≥७५°C) आणि स्वच्छता नोंदींवर रिअल-टाइम डिजिटल टाइमस्टॅम्प.'
                    : 'Real-time digital time-stamps on cold chain (< 5°C), cook core (≥ 75°C), and sanitary logs.'}
                </li>
                <li style={{ fontSize: 13, lineHeight: 1.5, color: '#334155' }}>
                  <strong style={{ color: '#0f172a' }}>• {lang === 'hi' ? 'तत्काल निरीक्षण तैयारी:' : lang === 'mr' ? 'त्वरित तपासणी सज्जता:' : 'Zero-Notice Readiness:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'अचानक आने वाले FDA निरीक्षकों को 30 सेकंड में पूर्ण डिजिटल अनुपालन फ़ाइल सौंपें।'
                    : lang === 'mr'
                    ? 'अचानक येणाऱ्या FDA अधिकाऱ्यांना ३० सेकंदांत संपूर्ण डिजिटल अनुपालन फाईल सादर करा.'
                    : 'Hand unannounced FDA inspectors an airtight, verifiable compliance dossier in 30 seconds.'}
                </li>
              </ul>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Link href="/food-safety-framework" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
                  View Compliance Framework <ArrowRight size={14} />
                </Link>
              </div>
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
