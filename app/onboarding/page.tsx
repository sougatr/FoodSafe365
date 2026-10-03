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
  Wrench
} from 'lucide-react';
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
  const [name, setName] = useState('ABC Restaurant');
  const [city, setCity] = useState('Mumbai');
  const [outletType, setOutletType] = useState('restaurant');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [managerName, setManagerName] = useState('Restaurant Admin');
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !city.trim()) {
      setError('Please provide your restaurant name and city.');
      return;
    }

    setSaving(true);
    setError('');

    const setup = {
      name: name.trim(),
      city: city.trim(),
      restaurantType: outletType,
      fssaiLicense: fssaiLicense.trim(),
      managerName: managerName.trim(),
      mobile: mobile.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      // Attempt backend API sync if running
      await apiFetch<any>('/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          user: { name: managerName || 'Restaurant Admin', mobile: mobile || '9999999999' },
          organisation: { name: name.trim() },
          outlet: { name: name.trim(), city: city.trim(), restaurantTypeId: outletType }
        })
      }).catch(() => {
        // Graceful fallback to client storage
      });

      if (typeof window !== 'undefined') {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'demo-outlet';
        localStorage.setItem('foodsafe365_outlet_id', slug);
        localStorage.setItem('foodsafe365_setup', JSON.stringify(setup));
      }

      router.push('/home');
    } catch (err: any) {
      setError(err?.message || 'Could not complete setup. Proceeding to dashboard.');
      setTimeout(() => router.push('/home'), 500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 64 }}>
      {/* Top Bar */}
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/home"
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px' }}
          >
            <Home size={15} /> Home
          </Link>
          <Link href="/login" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
            Log in
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 860, paddingTop: 36 }}>
        <div className="card" style={{ padding: '36px 32px', borderRadius: 20 }}>
          
          <div style={{ marginBottom: 20 }}>
            <span className="pill good" style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              RESTAURANT ONBOARDING
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.2, margin: '12px 0 8px' }}>
              Tell us about your restaurant
            </h1>
            <p className="lead muted" style={{ fontSize: 16, margin: 0 }}>
              Set up your outlet in 30 seconds. Your kitchen team can immediately start today’s daily food safety protocol without cumbersome questionnaires.
            </p>
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

          <form onSubmit={handleSave}>
            {/* Basic Information */}
            <div className="grid grid2" style={{ gap: 18, marginBottom: 26 }}>
              <div className="field">
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Restaurant / Outlet Name *</label>
                <input
                  className="input"
                  placeholder="e.g. The Bombay Canteen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>City / Location *</label>
                <input
                  className="input"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
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
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Alert Phone / WhatsApp</label>
                  <input
                    className="input"
                    placeholder="e.g. 9820012345"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>For instant deviation notifications</small>
                </div>
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
                  Includes immediate access to all <strong>29 Operational Safeguards</strong>, cold-chain logs (&lt; 5°C), tabletop Diner QR audits, and on-demand service partners.
                </span>
              </div>
            </div>

            {error && (
              <div className="notice error" style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/home" className="btn secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Cancel
              </Link>
              <button
                type="submit"
                className="btn primary"
                disabled={saving || !name.trim() || !city.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 800
                }}
              >
                {saving ? 'Activating Outlet…' : 'Activate Outlet & Open Dashboard'} <ArrowRight size={17} />
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
              { icon: '🩺', title: 'Occupational health providers', desc: 'Mandatory 6-monthly medical fitness checkups, Form 1A certificates & stool pathogen tests.' },
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
