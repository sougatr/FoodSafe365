'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Wrench,
  Search,
  Star,
  MapPin,
  Award,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<'all' | 'mumbai' | 'delhi' | 'bengaluru'>('all');

  const SAMPLE_RESTAURANTS = [
    {
      id: 'abc-restaurant',
      name: 'ABC Restaurant & Bar',
      city: 'mumbai',
      location: 'Bandra West, Mumbai',
      cuisine: 'Multi-Cuisine · Dine-In & Bar',
      badge: 'FOODSAFE TODAY',
      badgeTone: 'good',
      score: '4.8',
      reviews: 142,
      lastCheck: 'Today, 09:15 AM',
      safeguardsMet: ['Fridges < 5°C Verified', 'Zero Pest Signs', 'Staff Stool Tested', 'Safe RO Water'],
      touchpoints: ['Table Tent', 'Menu QR', 'Delivery Bag Seal']
    },
    {
      id: 'delhi-spice-hub',
      name: 'The Spice Pavilion',
      city: 'delhi',
      location: 'Connaught Place, New Delhi',
      cuisine: 'North Indian & Mughlai Dine-in',
      badge: 'FOODSAFE TODAY',
      badgeTone: 'good',
      score: '4.9',
      reviews: 98,
      lastCheck: 'Today, 10:00 AM',
      safeguardsMet: ['Cooking Core ≥ 75°C', 'Safe RO Water & Clean Glasses', 'FoSTaC Certified', 'Color Cutting Boards'],
      touchpoints: ['Entrance Plaque', 'Bills & Receipts', 'Table Tent']
    },
    {
      id: 'bengaluru-cafe-safe',
      name: 'GreenLeaf Artisan Bistro',
      city: 'bengaluru',
      location: 'Indiranagar, Bengaluru',
      cuisine: 'Continental, Organic Salads & Bakery',
      badge: 'FOODSAFE TODAY',
      badgeTone: 'good',
      score: '4.7',
      reviews: 210,
      lastCheck: 'Today, 08:45 AM',
      safeguardsMet: ['Salad Prep < 5°C', 'Daily Sanitized Shared Tools', 'Washrooms Stocked', 'Covered Preps'],
      touchpoints: ['Takeaway Bags', 'Food Containers', 'Instagram Story']
    }
  ];

  const filteredRestaurants = useMemo(() => {
    return SAMPLE_RESTAURANTS.filter(r => {
      const matchCity = selectedCity === 'all' || r.city === selectedCity;
      const matchQuery = !searchQuery || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchQuery;
    });
  }, [searchQuery, selectedCity]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <GlobalHeader />

      {/* Hero Section: Consumer-First Food Safety Gateway */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: 36,
        paddingBottom: 40
      }}>
        <div className="container" style={{ maxWidth: 980, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{
              background: '#059669',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 9999,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              THE DISRUPTIVE FOOD SAFETY MOAT
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            lineHeight: 1.15,
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 12px',
            letterSpacing: '-0.02em'
          }}>
            Rate Any Restaurant on Hygiene &amp; Food Safety.
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 19px)',
            color: '#334155',
            margin: '0 auto 26px',
            maxWidth: 720,
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            Right from your phone: rate kitchen hygiene in 60 seconds, scan the restaurant’s <strong>FoodSafe365 Passport QR</strong>, or discover certified safe kitchens near you.
          </p>

          {/* Quick Search & Rating Gateway */}
          <div style={{
            maxWidth: 680,
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 16,
            padding: 8,
            border: '2px solid #059669',
            boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 10 }}>
              <Search size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search restaurant (e.g. ABC Restaurant, Spice Pavilion) or locality..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  width: '100%',
                  color: '#0f172a',
                  background: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
              borderTop: '1px solid #f1f5f9',
              paddingTop: 8,
              flexWrap: 'wrap'
            }}>
              <Link
                href="/qr/abc-restaurant"
                className="btn primary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  background: '#059669',
                  borderColor: '#059669'
                }}
              >
                <QrCode size={16} /> Scan FoodSafe365 Passport QR
              </Link>
              <a
                href="#discovery-layer"
                className="btn secondary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  color: '#0f172a'
                }}
              >
                <MapPin size={16} style={{ color: '#059669' }} /> Find Safe Restaurants Near Me
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 24,
            marginTop: 22,
            flexWrap: 'wrap',
            fontSize: 13,
            color: '#475569'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> 5 Pure Food Safety Questions
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> 100-Word Direct Remarks
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> Instant GM &amp; Health Dashboard
            </span>
          </div>
        </div>
      </section>

      {/* DISCOVERY LAYER: Find FoodSafe365 Restaurants Near Me */}
      <section id="discovery-layer" className="container" style={{ maxWidth: 1180, paddingTop: 36, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Find FoodSafe365 Restaurants Near Me
              </h2>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Discovered by diners. Certified daily through transparent kitchen checklists and live temperature logs.
            </p>
          </div>

          {/* City / Filter Pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { id: 'all', label: 'All Cities' },
              { id: 'mumbai', label: 'Mumbai' },
              { id: 'delhi', label: 'New Delhi' },
              { id: 'bengaluru', label: 'Bengaluru' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCity(tab.id as any)}
                style={{
                  border: selectedCity === tab.id ? '2px solid #059669' : '1.5px solid #e2e8f0',
                  background: selectedCity === tab.id ? '#059669' : '#ffffff',
                  color: selectedCity === tab.id ? '#ffffff' : '#0f172a',
                  fontWeight: selectedCity === tab.id ? 700 : 600,
                  fontSize: 13,
                  borderRadius: 9999,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Discovery Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {filteredRestaurants.map(r => (
            <div
              key={r.id}
              className="card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 16,
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 3px', color: '#0f172a' }}>
                      {r.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      {r.location} · {r.cuisine}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    padding: '3px 8px',
                    borderRadius: 9999,
                    whiteSpace: 'nowrap'
                  }}>
                    {r.badge}
                  </span>
                </div>

                {/* Score & Rating Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: 10,
                  padding: '8px 12px',
                  marginBottom: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 900, fontSize: 16 }}>
                    <Star size={18} fill="#059669" />
                    <span>{r.score}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Based on <strong>{r.reviews}</strong> verified diner food-safety reviews
                  </div>
                </div>

                {/* Live Kitchen Safeguards Met Today */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                    Live Kitchen Safeguards Verified Today:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {r.safeguardsMet.map((sg, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 11.5,
                          background: '#ffffff',
                          color: '#1e293b',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Check size={12} style={{ color: '#059669' }} /> {sg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* QR Touchpoints Displayed */}
                <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 16 }}>
                  <strong>Passport QR Deployed At:</strong> {r.touchpoints.join(' · ')}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <Link
                  href={`/qr/${r.id}`}
                  className="btn primary"
                  style={{
                    fontSize: 12.5,
                    padding: '8px 12px',
                    justifyContent: 'center',
                    background: '#059669',
                    borderColor: '#059669'
                  }}
                >
                  ⭐ Rate Restaurant
                </Link>
                <Link
                  href="/showcase"
                  className="btn secondary"
                  style={{
                    fontSize: 12.5,
                    padding: '8px 12px',
                    justifyContent: 'center',
                    color: '#0f172a'
                  }}
                >
                  <Award size={14} style={{ color: '#059669' }} /> View Passport
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RESTAURANT ONBOARDING & PASSPORT FLYWHEEL */}
      <section style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: 44,
        paddingBottom: 48
      }}>
        <div className="container" style={{ maxWidth: 1180 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            <div style={{ maxWidth: 760 }}>
              <span style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 9999,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                FOR RESTAURANTS &amp; COMMERCIAL KITCHENS
              </span>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '8px 0 6px' }}>
                The Trust Flywheel: Turn Clean Kitchens into Packed Tables
              </h2>
              <p className="muted" style={{ fontSize: 15, margin: 0, lineHeight: 1.5 }}>
                <strong>Restaurant Daily Checks</strong> → <strong>FoodSafe365 Verification</strong> → <strong>Visible Food-Safety Record (Passport)</strong> → <strong>Consumer</strong> → <strong>Trust</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/home" className="btn primary" style={{ fontSize: 13.5, padding: '10px 18px' }}>
                Open Kitchen Operations <ArrowRight size={16} />
              </Link>
              <Link href="/onboarding" className="btn secondary" style={{ fontSize: 13.5, padding: '10px 18px' }}>
                Onboard Restaurant →
              </Link>
            </div>
          </div>

          {/* 9 Touchpoints Card */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1.5px solid #a7f3d0',
            borderRadius: 18,
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📱</span>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Where Restaurants Keep the FoodSafe365 Passport QR Code:
                </h3>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                  Showcase your real-time hygiene compliance to customers at every touchpoint:
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { icon: '🚪', title: '1. Restaurant Entrance', desc: 'Door decal / window plaque' },
                { icon: '📋', title: '2. Dine-In Menu', desc: 'Front page / footer QR' },
                { icon: '🪑', title: '3. Table Tent', desc: 'Tabletop acrylic stand' },
                { icon: '🥡', title: '4. Takeaway Packaging', desc: 'Carryout bag sticker' },
                { icon: '🛵', title: '5. Delivery Bags', desc: 'Tamper-evident seal for riders' },
                { icon: '📦', title: '6. Food Containers', desc: 'Container lid closure tape' },
                { icon: '🧾', title: '7. Bills & Receipts', desc: 'Printed on POS receipt' },
                { icon: '🌐', title: '8. Restaurant Website', desc: 'Live embed trust badge' },
                { icon: '📱', title: '9. Social Media', desc: 'Instagram / WhatsApp proof' },
              ].map((tp, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{tp.icon}</span>
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{tp.title}</strong>
                    <span className="muted" style={{ fontSize: 11.5 }}>{tp.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>
                ✓ Includes ready-to-print PDF stickers, table tents, and digital vector badges.
              </div>
              <Link href="/showcase" className="btn secondary" style={{ fontSize: 12.5, padding: '7px 16px' }}>
                <Award size={14} style={{ color: '#059669' }} /> Generate &amp; Print QR Passport Kit →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE PROVIDERS DOOR: Found a problem? FoodSafe365 helps you fix it */}
      <section className="container" style={{ maxWidth: 1180, paddingTop: 40, paddingBottom: 40 }}>
        <div className="card" style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: 18,
          padding: '24px 28px',
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
      </section>

      {/* Persistent Global Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        padding: '24px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          maxWidth: 1180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>
            <Link href="/food-safety-why" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Food Safety — Why?</Link>
            <Link href="/haccp" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>HACCP Principles</Link>
            <Link href="/contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link>
            <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b' }}>
            © {new Date().getFullYear()} FoodSafe365 · Digital Food-Safety Operating System
          </div>
        </div>
      </footer>
    </main>
  );
}
