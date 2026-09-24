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
  ChevronRight,
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
            {t('nav.fssaiLive')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LanguageSelector />
          <ThemeToggle />
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px', borderRadius: 10 }}>
            <HomeIcon size={14} /> {t('nav.home')}
          </Link>
          <Link href="/checks" className="nav-link">{t('nav.checks')}</Link>
          <Link href="/showcase" className="nav-link" style={{ color: 'var(--green-dark)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Award size={14} /> {t('nav.showcase')}
          </Link>
          <Link href="/manager" className="nav-link">{t('nav.manager')}</Link>
          <Link href="/manager/trends" className="nav-link" style={{ color: 'var(--green)' }}>{t('nav.aiTrends')}</Link>
          <Link href="/ai-copilot" className="nav-link" style={{ color: 'var(--green)' }}>{t('nav.aiCopilot')}</Link>
          <Link href="/actions" className="nav-link">{t('nav.actions')}</Link>
          <Link href="/records" className="nav-link">{t('nav.records')}</Link>
          <Link href="/providers" className="nav-link">{t('nav.providers')}</Link>
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
                  <strong>{lang === 'hi' ? 'वास्तविक सच्चाई:' : lang === 'mr' ? 'उद्योगातील वास्तव:' : 'The Industry Reality:'}</strong>{' '}
                  {lang === 'hi'
                    ? 'खाद्य सुरक्षा निरीक्षक यह नहीं देखते कि आपका खाना कितना स्वादिष्ट है; वे आपके वॉक-इन कूलर का तापमान और कड़छी संभालने वाले स्टाफ के मेडिकल सर्टिफिकेट चेक करते हैं। एक अनियंत्रित फ्रिज या गंदी नाली 15 मिनट में 50 साल की साख को बर्बाद कर सकती है।'
                    : lang === 'mr'
                    ? 'अन्न सुरक्षा निरीक्षक तुमचे जेवण किती चवदार आहे हे तपासत नाहीत; ते तुमच्या वॉक-इन कुलरचे तापमान आणि कर्मचाऱ्यांचे वैद्यकीय प्रमाणपत्र तपासतात. एका अनियंत्रित फ्रीजमुळे किंवा अस्वच्छ ड्रेनेजमुळे ५० वर्षांची प्रतिष्ठा १५ मिनिटांत नष्ट होऊ शकते.'
                    : 'Inspectors don’t audit how delicious your food is; they audit the temperature inside your walk-in and the health certs of the team holding the ladles. A single unmonitored fridge or an unwashed drain can undo 50 years of brand legacy in 15 minutes.'}
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
