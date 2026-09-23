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
  UtensilsCrossed
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
          
          <div style={{ marginBottom: 28 }}>
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
      </div>
    </main>
  );
}
