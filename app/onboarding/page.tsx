'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Coffee,
  Croissant,
  Flame,
  Wine,
  Users,
  Hotel,
  UtensilsCrossed,
  Wrench,
  ClipboardCheck,
  Thermometer,
  QrCode,
  Sparkles
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { apiFetch } from '@/lib/api';

interface OutletTypeOption {
  code: string;
  name: string;
  description: string;
  icon: any;
}

const OUTLET_TYPES: OutletTypeOption[] = [
  {
    code: 'restaurant',
    name: 'Restaurant / Dine-In',
    description: 'Fine dine, casual dining, bistro or family restaurant',
    icon: UtensilsCrossed
  },
  {
    code: 'cafe',
    name: 'Café & Coffee Shop',
    description: 'Beverages, bakery items, sandwiches & light fare',
    icon: Coffee
  },
  {
    code: 'cloud_kitchen',
    name: 'Cloud / Dark Kitchen',
    description: 'Delivery-only virtual brands & high-velocity dispatch',
    icon: Flame
  },
  {
    code: 'brewery',
    name: 'Bar, Pub & Brewery',
    description: 'Draft beer lines, cocktail stations & cold keg rooms',
    icon: Wine
  },
  {
    code: 'bakery',
    name: 'Bakery & Confectionery',
    description: 'Baked goods, prep tables, ovens & refrigerated display',
    icon: Croissant
  },
  {
    code: 'catering',
    name: 'Catering & Banquets',
    description: 'Outdoor food transit, buffet holding & temporary setups',
    icon: Users
  },
  {
    code: 'hotel',
    name: 'Hotel Kitchen',
    description: 'Multi-outlet hotel kitchens, room service & banqueting',
    icon: Hotel
  },
  {
    code: 'canteen',
    name: 'Canteen / Cafeteria',
    description: 'Corporate, university, hospital or institutional kitchen',
    icon: Building2
  }
];

export default function Onboarding() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [outletType, setOutletType] = useState('restaurant');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [managerName, setManagerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checklistTier, setChecklistTier] = useState<'critical_consolidated' | 'full_granular'>('critical_consolidated');
  const [executionMode, setExecutionMode] = useState<'ai_assisted' | 'manual_only'>('ai_assisted');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSaving(true);
    setError('');

    const finalName = name.trim() || 'ABC Restaurant';
    const finalCity = city.trim() || 'Mumbai';
    const finalManager = managerName.trim() || 'Restaurant Admin';
    const finalMobile = mobile.trim() || '8356055834';

    try {
      const res = await fetch('/api/v1/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: finalManager,
            mobile: finalMobile,
            email: email.trim() || undefined,
            password: password || undefined
          },
          organisation: { name: finalName },
          outlet: { name: finalName, city: finalCity, restaurantTypeId: outletType }
        })
      });

      const json = await res.json().catch(() => ({}));

      const createdOutletId = json.data?.outletId || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_outlet_id', createdOutletId);
        localStorage.setItem('foodsafe365_checklist_tier', checklistTier);
        localStorage.setItem('foodsafe365_execution_mode', executionMode);
      }

      // Dual-dispatch to contact alert to guarantee delivery to foodsafe365@gmail.com
      let cleanContactEmail = email.trim();
      if (!cleanContactEmail) {
        cleanContactEmail = 'partner@foodsafe365.in';
      } else if (!cleanContactEmail.includes('@')) {
        cleanContactEmail = `${cleanContactEmail}@gmail.com`;
      }

      await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalManager,
          email: cleanContactEmail,
          subject: `[Restaurant Activation] ${finalName} (${finalCity})`,
          organisation: finalName,
          message: `NEW RESTAURANT OUTLET ACTIVATED\n\n` +
            `Restaurant Name: ${finalName}\n` +
            `Operating City: ${finalCity}\n` +
            `Concept / Outlet Type: ${outletType}\n` +
            `Manager / Admin: ${finalManager}\n` +
            `Mobile: ${finalMobile}\n` +
            `Admin Login Email: ${email.trim() || 'Not specified'}\n` +
            `FSSAI License: ${fssaiLicense.trim() || 'Pending verification'}\n\n` +
            `Operational Safeguards active: 29 Daily Checklist Controls, Cold-Chain monitoring (< 5°C), Tabletop Diner QR audits.`
        })
      }).catch(err => console.warn('[Onboarding dual-dispatch warning]:', err));

      router.push('/home');
    } catch (err: any) {
      // Graceful fallback to home so user is never trapped
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_outlet_id', finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      }
      router.push('/home');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 64 }}>
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 860, paddingTop: 36 }}>
        <div className="card" style={{ padding: '36px 32px', borderRadius: 20 }}>
          
          <div style={{ marginBottom: 20 }}>
            <span className="pill good" style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RESTAURANT ONBOARDING
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.2, margin: '12px 0 8px' }}>
              Make your restaurant food-safety ready
            </h1>
            <p className="lead muted" style={{ fontSize: 16, margin: 0 }}>
              Configure your outlet in under 60 seconds. Choose between our streamlined Critical Control Point (CCP) + General Hygiene workflow or full 29-point shift checks, with optional AI Agent check assistance and mandatory manager review.
            </p>

            {/* A. Four small feature illustrations: What the restaurant gets immediately */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: 12,
              marginTop: 18
            }}>
              {[
                {
                  icon: ClipboardCheck,
                  title: 'Daily safety checks',
                  desc: 'Digital kitchen checklists and records.',
                  bg: '#ecfdf5',
                  border: '#a7f3d0',
                  iconColor: '#059669'
                },
                {
                  icon: Thermometer,
                  title: 'Temperature monitoring',
                  desc: 'Monitor refrigeration and food temperatures.',
                  bg: '#f0f9ff',
                  border: '#bae6fd',
                  iconColor: '#0284c7'
                },
                {
                  icon: QrCode,
                  title: 'Diner QR feedback',
                  desc: 'Understand customer hygiene feedback.',
                  bg: '#fefce8',
                  border: '#fde047',
                  iconColor: '#ca8a04'
                },
                {
                  icon: Wrench,
                  title: 'Find service partners',
                  desc: 'Connect with relevant food-safety services.',
                  bg: '#fdf4ff',
                  border: '#f5d0fe',
                  iconColor: '#9333ea'
                }
              ].map((feat, idx) => {
                const FeatIcon = feat.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                    }}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: feat.bg,
                      border: `1px solid ${feat.border}`,
                      color: feat.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FeatIcon size={17} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', lineHeight: 1.25 }}>
                        {feat.title}
                      </strong>
                      <span style={{ fontSize: 11.5, color: '#64748b', display: 'block', marginTop: 3, lineHeight: 1.35 }}>
                        {feat.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Founding Restaurant Programme Offer */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1.5px solid #f59e0b',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 22,
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: '#d97706',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 999
                  }}>
                    FOUNDING RESTAURANT PROGRAMME
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>
                    Join the first 50 FoodSafe365 restaurants
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px', fontSize: 13.5, color: '#78350f', fontWeight: 600, lineHeight: 1.45 }}>
                  Get guided onboarding, assistance with your initial food-safety setup and priority support during the introductory period.
                </p>
                <div style={{ fontSize: 11.5, color: '#92400e', lineHeight: 1.45 }}>
                  <strong>Pilot Duration &amp; Commercial Terms:</strong> 90-day introductory pilot period with ₹0 setup fee and complimentary platform access for the first 50 participating outlets (no lock-in commitment; standard subscription optional after 90 days). <em>Note: Programme participation provides digital operational management tools and does not constitute FSSAI certification, statutory inspection, or regulatory endorsement.</em>
                </div>
              </div>
            </div>
          </div>

          {/* Service Provider Switcher Banner */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🛠️</span>
              <div>
                <strong style={{ fontSize: 13, color: '#166534', display: 'block' }}>
                  Are you a Food-Safety Service Provider or Contractor?
                </strong>
                <span style={{ fontSize: 12, color: '#15803d' }}>
                  Pest control, refrigeration technicians, testing labs, or deep cleaning agencies.
                </span>
              </div>
            </div>
            <Link
              href="/onboarding/provider"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#ffffff',
                background: '#059669',
                padding: '6px 12px',
                borderRadius: 6,
                textDecoration: 'none'
              }}
            >
              Onboard as Service Partner →
            </Link>
          </div>

          {/* Grocery Store Switcher Banner */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🛒</span>
              <div>
                <strong style={{ fontSize: 13, color: '#1e40af', display: 'block' }}>
                  Are you a Grocery Store or Retail Supermarket?
                </strong>
                <span style={{ fontSize: 12, color: '#2563eb' }}>
                  Food safety controls for receiving, cold storage, FIFO/FEFO stock rotation &amp; hygiene.
                </span>
              </div>
            </div>
            <Link
              href="/onboarding/grocery"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#ffffff',
                background: '#2563eb',
                padding: '6px 12px',
                borderRadius: 6,
                textDecoration: 'none'
              }}
            >
              Onboard as Grocery Store →
            </Link>
          </div>

          <form onSubmit={handleSave}>
            {/* Basic Information */}
            <div className="grid grid2" style={{ gap: 18, marginBottom: 26 }}>
              <div className="field">
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Restaurant / Outlet Name</label>
                <input
                  className="input"
                  placeholder="e.g. The Bombay Canteen (or your kitchen name)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>City / Location</label>
                <input
                  className="input"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            {/* Outlet Type Selection */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: 12 }}>
                What type of outlet is this?
              </label>
              <div className="grid grid2" style={{ gap: 12 }}>
                {OUTLET_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = outletType === type.code;
                  return (
                    <button
                      type="button"
                      key={type.code}
                      onClick={() => setOutletType(type.code)}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 14,
                        border: isSelected ? '2px solid var(--green)' : '1px solid #cbd5e1',
                        background: isSelected ? '#f0faf5' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 14,
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: isSelected ? '#e9f7ef' : '#f1f5f9',
                        color: isSelected ? 'var(--green-dark)' : '#64748b',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: 15, color: '#0f172a', display: 'block' }}>{type.name}</strong>
                        <small style={{ color: '#64748b', fontSize: 12, display: 'block', marginTop: 2 }}>{type.description}</small>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Compliance Details */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ShieldCheck size={18} style={{ color: 'var(--green)' }} />
                <strong style={{ fontSize: 14, color: '#1e293b' }}>Operational &amp; FSSAI Details (Optional)</strong>
              </div>

              <div className="grid grid3" style={{ gap: 14 }}>
                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>FSSAI 14-Digit License No.</label>
                  <input
                    className="input"
                    placeholder="e.g. 11521012000345"
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value)}
                    maxLength={14}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Appears on digital inspection dossier</small>
                </div>

                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Manager In-Charge</label>
                  <input
                    className="input"
                    placeholder="e.g. Vikram Sharma"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Receives critical temperature alerts</small>
                </div>

                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>💬</span> Manager WhatsApp / Mobile Number
                  </label>
                  <input
                    className="input"
                    placeholder="e.g. +91 83560 55834"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <small style={{ fontSize: 11, color: '#15803d', marginTop: 3, display: 'block' }}>
                    Daily morning checklist reminders &amp; urgent temperature alerts are dispatched to this WhatsApp
                  </small>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#334155', cursor: 'pointer', marginTop: 6 }}>
                    <input type="checkbox" defaultChecked />
                    <span>Receive daily 10 AM safety checklist &amp; diner audit reports on WhatsApp</span>
                  </label>
                </div>

                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Admin Login Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="e.g. admin@abcrestaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Account identifier for login</small>
                </div>

                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Account Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Secure credential for manager and dashboard access</small>
                </div>
              </div>
            </div>

            {/* Checklist Architecture & AI Agent Automation Provision */}
            <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
                  STEP 2 · CHECKLIST STRUCTURE &amp; AI AGENT AUTOMATION
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '6px 0 4px' }}>
                  How should your kitchen team execute daily checks?
                </h3>
                <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>
                  You can switch between Critical CCP Focus and Full 29-Point View, or toggle AI Agent vs. Manual entry at any time on the Checks screen.
                </p>
              </div>

              <div className="grid grid2" style={{ gap: 12, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setChecklistTier('critical_consolidated')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: checklistTier === 'critical_consolidated' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: checklistTier === 'critical_consolidated' ? '#f0fdf4' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13.5, color: '#0f172a' }}>⚡ 10 Critical CCPs + General Hygiene Sweep</strong>
                    <span style={{ fontSize: 10, fontWeight: 800, background: '#059669', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>RECOMMENDED</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Focuses daily effort on high-risk critical controls (Receiving ration temp, Cold storage &lt;5°C, Freezer/Thawing, Core Cooking ≥75°C, Hot holding ≥65°C &amp; Blast chilling, FIFO &amp; Expired rations, Oil TPC ≤25%, Pest control, Medical fitness Form 1A) while consolidating general premises cleanliness into a single rapid hygiene sweep.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setChecklistTier('full_granular')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: checklistTier === 'full_granular' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: checklistTier === 'full_granular' ? '#f0fdf4' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13.5, color: '#0f172a' }}>📑 All 29 Granular Shift Safeguards</strong>
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>FULL AUDIT</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Displays every individual FSSAI Schedule 4 item separately across Opening, Active Service, Closing, and Specialized shifts for comprehensive line-by-line inspection.
                  </p>
                </button>
              </div>

              <div className="grid grid2" style={{ gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setExecutionMode('ai_assisted')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: executionMode === 'ai_assisted' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: executionMode === 'ai_assisted' ? '#f0f9ff' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block', marginBottom: 4 }}>
                    🤖 AI Agent Check Automation + Manual Mode
                  </strong>
                  <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Allows supervisors to use AI Agents (BLE temperature probes, digital TPC oil meters, invoice OCR &amp; smart pre-fill) alongside manual entry. All AI-drafted checks require human supervisor &amp; manager review.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExecutionMode('manual_only')}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: executionMode === 'manual_only' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: executionMode === 'manual_only' ? '#f0f9ff' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block', marginBottom: 4 }}>
                    ✍️ Manual Supervisor Entry Mode
                  </strong>
                  <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                    Supervisors record every thermometer reading, oil check, and hygiene score manually on the kitchen floor before submitting for manager sign-off.
                  </p>
                </button>
              </div>

              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 10,
                fontSize: 12,
                color: '#92400e',
                fontWeight: 600
              }}>
                ⚖️ <strong>Human-in-the-Loop Governance:</strong> AI must assist the food-safety manager, not replace professional judgement or statutory responsibilities.
              </div>
            </div>

            {/* Instant Benefits Preview */}
            <div style={{
              background: '#f0faf5',
              border: '1px solid #cce8da',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 28,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  Includes immediate access to <strong>Critical Control Point (CCP) &amp; 29-Safeguard checklists</strong>, cold-chain logs (&lt; 5°C), tabletop Diner QR feedback, and verified service partners.
                </span>
              </div>
            </div>

            {/* B. "What happens next?" 4-Step Immediate Product Flow */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>
                  What happens next? (Immediately after registration)
                </strong>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669' }}>
                  Instant product access — no waiting period
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 10
              }}>
                {[
                  { step: '1', text: 'Set up your kitchen.' },
                  { step: '2', text: 'Get your food-safety checklist.' },
                  { step: '3', text: 'Start recording daily checks.' },
                  { step: '4', text: 'Monitor deficiencies and corrective actions.' }
                ].map((item) => (
                  <div
                    key={item.step}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#059669',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.step}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', lineHeight: 1.35 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="notice error" style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/" className="btn secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Cancel
              </Link>
              <button
                type="submit"
                className="btn primary"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 800
                }}
              >
                {saving ? 'Creating Account…' : 'Create My Restaurant Account & Start'} <ArrowRight size={17} />
              </button>
            </div>
          </form>

        </div>

        {/* ACCREDITED PARTNERS: Found a problem? FoodSafe365 helps you fix it */}
        <div className="card" style={{
          marginTop: 24,
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: 20,
          padding: '28px 32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 18 }}>
            <div>
              <span style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 9999,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                ACCREDITED PARTNERS
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '6px 0 4px' }}>
                Found a problem? FoodSafe365 helps you fix it.
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                Connect with verified service partners to resolve kitchen deviations, maintain equipment, and renew statutory health clearances:
              </p>
            </div>
            <Link
              href="/providers"
              className="btn primary"
              style={{
                fontSize: 13,
                padding: '8px 18px',
                background: '#b45309',
                borderColor: '#92400e'
              }}
            >
              <Wrench size={15} /> Browse All 14 Provider Categories →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {[
              { icon: '🪲', title: 'Pest Control Agencies', desc: 'Integrated pest management, numbered bait boxes & monthly service certificates.' },
              { icon: '🧪', title: 'Food-testing laboratories', desc: 'NABL accredited food & water pathogen screening, swab tests, and chemical assays.' },
              { icon: '❄️', title: 'Refrigeration/HVAC technicians', desc: '24/7 cold-chain repair, chiller thermostat calibration & kitchen exhaust maintenance.' },
              { icon: '🩺', title: 'Occupational health providers', desc: 'FSSAI Schedule 4 annual Form 1A medical fitness checkups & recommended food-handler health screenings.' },
            ].map((p, idx) => (
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
                <div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
                  <strong style={{ fontSize: 14, color: '#0f172a', display: 'block', marginBottom: 4 }}>
                    {p.title}
                  </strong>
                  <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <Link
                    href={`/providers?category=${encodeURIComponent(p.title)}`}
                    style={{ fontSize: 12, fontWeight: 700, color: '#b45309', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Find Verified Partners <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
