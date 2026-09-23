'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, QrCode, Star, AlertTriangle, ArrowRight, Check, Heart, Sparkles, Home } from 'lucide-react';

export default function ClientOnboarding() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [diet, setDiet] = useState<'veg' | 'nonveg' | 'any'>('any');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const ALLERGEN_OPTIONS = ['Peanuts / Nuts', 'Dairy / Lactose', 'Gluten / Wheat', 'Seafood / Shellfish', 'Soy', 'Eggs'];

  function toggleAllergen(item: string) {
    setAllergies(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    setBusy(true);
    const dinerProfile = {
      name: name.trim(),
      mobile: mobile.trim(),
      city,
      diet,
      allergies,
      joinedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('foodsafe365_diner_user', JSON.stringify(dinerProfile));
    }

    setTimeout(() => {
      setBusy(false);
      router.push('/diner');
    }, 600);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
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
          <Link href="/login?role=client" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
            Sign In
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 860, paddingTop: 36 }}>
        <div className="grid grid2" style={{ gap: 32, alignItems: 'start' }}>
          {/* Left Column: Why Join */}
          <div>
            <span className="pill good" style={{ fontSize: 11, padding: '3px 8px' }}>
              DINER HEALTH &amp; TRANSPARENCY
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.2, margin: '14px 0 12px' }}>
              Dine with confidence. Every single meal.
            </h1>
            <p className="lead muted" style={{ fontSize: 16 }}>
              Join thousands of diners who check real-time kitchen hygiene, verify safe drinking water, and rate restaurant food safety right from their table.
            </p>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <QrCode size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: 15, color: '#0f172a' }}>Scan Tabletop QR Codes</strong>
                  <p className="muted" style={{ margin: '3px 0 0', fontSize: 13 }}>
                    Instantly see if the kitchen’s cold storage (&lt; 5°C), deep freezing (&lt; -18°C), and cooking hygiene were verified today.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Star size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: 15, color: '#0f172a' }}>Rate Cleanliness &amp; Freshness</strong>
                  <p className="muted" style={{ margin: '3px 0 0', fontSize: 13 }}>
                    Rate restaurants on dining room cleanliness, server hygiene, fresh food temperature, safe water, and washroom sanitation.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: 15, color: '#0f172a' }}>Direct GM Grievance Resolution</strong>
                  <p className="muted" style={{ margin: '3px 0 0', fontSize: 13 }}>
                    Report undercooked items or foreign objects instantly to the General Manager on duty for immediate on-site correction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Diner Registration Form */}
          <div className="card" style={{ padding: 30, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 20, margin: '0 0 4px' }}>Create Diner Profile</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
              Free forever for individuals &amp; food enthusiasts.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label className="field">
                <span>Your Full Name</span>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </label>

              <div className="grid grid2" style={{ gap: 12 }}>
                <label className="field">
                  <span>Mobile (for table OTP / reports)</span>
                  <input
                    className="input"
                    type="tel"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    required
                  />
                </label>

                <label className="field">
                  <span>City</span>
                  <select
                    className="input"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#334155' }}>
                  Dietary Preference
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    ['any', 'All Foods'],
                    ['veg', 'Vegetarian'],
                    ['nonveg', 'Non-Vegetarian']
                  ].map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setDiet(k as any)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: diet === k ? '2px solid #059669' : '1px solid #cbd5e1',
                        background: diet === k ? '#ecfdf5' : '#ffffff',
                        color: diet === k ? '#047857' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#334155' }}>
                  Do you have any food allergies? (Optional)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ALLERGEN_OPTIONS.map(allergen => {
                    const selected = allergies.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => toggleAllergen(allergen)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          border: selected ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: selected ? '#ecfdf5' : '#ffffff',
                          color: selected ? '#047857' : '#64748b',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {selected && <Check size={12} />} {allergen}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn primary"
                disabled={busy}
                style={{
                  marginTop: 10,
                  padding: '12px 20px',
                  background: '#059669',
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {busy ? 'Setting up…' : 'Enter FoodSafe Diner Portal'} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

