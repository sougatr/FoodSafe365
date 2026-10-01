'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  Star,
  MapPin,
  Thermometer,
  UserCheck,
  UtensilsCrossed,
  Users,
  Wrench,
  Sparkles
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function Landing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<'all' | 'mumbai' | 'delhi' | 'bengaluru'>('all');

  const SAMPLE_RESTAURANTS = [
    {
      id: 'abc-restaurant',
      name: 'ABC Restaurant',
      city: 'mumbai',
      location: 'Bandra West, Mumbai',
      tableCode: 'Table QR #04',
      cuisine: 'Multi-Cuisine · Dine-In & Bar',
      badge: 'FOODSAFE TODAY VERIFIED',
      score: '4.8',
      reviews: 142,
      lastCheck: 'Today, 09:15 AM',
      signals: {
        cold: { title: 'Cold < 5°C', subtitle: 'Refrigeration OK' },
        medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
        pest: { title: 'Pest Safe', subtitle: 'Inspected Weekly' }
      }
    },
    {
      id: 'delhi-spice-hub',
      name: 'The Spice Pavilion',
      city: 'delhi',
      location: 'Connaught Place, New Delhi',
      tableCode: 'Table QR #12',
      cuisine: 'North Indian & Mughlai Dine-In',
      badge: 'FOODSAFE TODAY VERIFIED',
      score: '4.9',
      reviews: 98,
      lastCheck: 'Today, 10:00 AM',
      signals: {
        cold: { title: 'Cooked ≥ 75°C', subtitle: 'Core Temp Passed' },
        medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
        pest: { title: 'Pest Safe', subtitle: 'Bait Stations Intact' }
      }
    },
    {
      id: 'bengaluru-cafe-safe',
      name: 'GreenLeaf Artisan Bistro',
      city: 'bengaluru',
      location: 'Indiranagar, Bengaluru',
      tableCode: 'Table QR #08',
      cuisine: 'Continental & Organic Salads',
      badge: 'FOODSAFE TODAY VERIFIED',
      score: '4.7',
      reviews: 210,
      lastCheck: 'Today, 08:45 AM',
      signals: {
        cold: { title: 'Salad < 5°C', subtitle: 'Fresh Prep Chilled' },
        medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
        pest: { title: 'Pest Safe', subtitle: 'Certified Weekly' }
      }
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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = SAMPLE_RESTAURANTS.find(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matched) {
      router.push(`/qr/${matched.id}`);
    } else {
      const slug = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      router.push(`/qr/${slug}?name=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <GlobalHeader />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: 36,
        paddingBottom: 40
      }}>
        <div className="container" style={{ maxWidth: 1180, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 9999,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              DIGITAL FOOD-SAFETY SYSTEM
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4.5vw, 48px)',
            lineHeight: 1.15,
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 10px',
            letterSpacing: '-0.02em'
          }}>
            Welcome to FoodSafe365
          </h1>

          <p style={{
            fontSize: 'clamp(15.5px, 2vw, 18px)',
            color: '#334155',
            margin: '0 auto 32px',
            maxWidth: 720,
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            The unified food hygiene platform for <strong>Restaurants</strong>, <strong>Customers</strong>, and <strong>Service Providers</strong>. Choose your onboarding to get started:
          </p>

          {/* 3 ONBOARDINGS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
            textAlign: 'left'
          }}>
            {/* 1. RESTAURANT ONBOARDING (FEATURED / PRIMARY) */}
            <div className="card" style={{
              background: '#ffffff',
              border: '2px solid #059669',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.12)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    textTransform: 'uppercase'
                  }}>
                    RESTAURANT ONBOARDING
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UtensilsCrossed size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  For Restaurants &amp; Kitchens
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Set up your outlet in 30 seconds. Run 2–3 min daily shift checks, avoid FDA/FSSAI closures, analyze AI trends, and generate your verified FoodSafe365 Passport.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>2–3 min time-phased daily kitchen checklists</li>
                  <li>Real-time cold-chain &amp; danger zone temperature tracking</li>
                  <li>Printable tabletop &amp; menu QR FoodSafe365 Passport</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/onboarding"
                  className="btn primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '11px 16px',
                    background: '#059669',
                    borderColor: '#059669',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Onboard Your Restaurant (Start Free) <ArrowRight size={16} />
                </Link>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/home" style={{ fontSize: 12, color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                    Already onboarded? Open Kitchen Operations →
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & DINER ONBOARDING */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    textTransform: 'uppercase'
                  }}>
                    GENERAL PUBLIC / DINER
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  For Customers &amp; Diners
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Rate any restaurant on food safety in 60 seconds (5 pure hygiene questions + 100-word feedback), scan table QR codes, or discover verified clean kitchens near you.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>5 pure food safety rating questions + 100-word feedback</li>
                  <li>Scan tabletop QR codes to verify today&apos;s kitchen audit</li>
                  <li>Feedback delivered straight to the General Manager</li>
                </ul>
              </div>

              <div>
                <a
                  href="#diner-section"
                  className="btn secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '11px 16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#0f172a'
                  }}
                >
                  Rate a Restaurant / Find Safe Kitchens ↓
                </a>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/qr/abc-restaurant" style={{ fontSize: 12, color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                    Scan Tabletop QR Code Directly →
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. SERVICE PROVIDER ONBOARDING */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    textTransform: 'uppercase'
                  }}>
                    ACCREDITED PARTNERS
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  For Service Providers
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                  List your specialized compliance agency and connect directly with restaurants needing Pest Control, Food/Water Testing Labs, HVAC repair, and Staff Medical Tests.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>Direct marketplace access to food service businesses</li>
                  <li>14 specialized compliance categories</li>
                  <li>Receive instant service quotation requests</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/providers"
                  className="btn secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '11px 16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#b45309'
                  }}
                >
                  Join as Service Provider →
                </Link>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/providers" style={{ fontSize: 12, color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                    Browse All 14 Provider Categories →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DINER RATING & DISCOVERY LAYER (For Customers & General Public) */}
      <section id="diner-section" className="container" style={{ maxWidth: 1180, paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 28px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            Rate Any Restaurant on Hygiene &amp; Food Safety
          </h2>
          <p className="muted" style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.5 }}>
            Search a restaurant or scan its table QR code to submit a 60-second verified food safety audit:
          </p>

          {/* Quick Search & Rating Gateway Form */}
          <form onSubmit={handleSearchSubmit} style={{
            maxWidth: 640,
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 16,
            padding: 8,
            border: '2px solid #059669',
            boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 10 }}>
              <Search size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search restaurant (e.g. ABC Restaurant, Spice Pavilion)..."
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
              <button
                type="submit"
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
                <Star size={16} /> Rate This Restaurant
              </button>
              <Link
                href="/qr/abc-restaurant"
                className="btn secondary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  color: '#0f172a'
                }}
              >
                <QrCode size={16} style={{ color: '#059669' }} /> Scan Table QR Code
              </Link>
            </div>
          </form>

          {/* 3 Quick Benefit Metrics */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 22,
            marginTop: 18,
            flexWrap: 'wrap',
            fontSize: 13,
            color: '#475569'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> 5 Pure Food Safety Questions
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> 100-Word Additional Remarks
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> Direct to General Manager
            </span>
          </div>
        </div>

        {/* Discovery Filter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Find FoodSafe365 Restaurants Near Me
              </h3>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
              Discovered by diners. Verified daily through digital kitchen checklists and transparent hygiene audits.
            </p>
          </div>

          {/* City Filter Pills */}
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

        {/* Restaurant Cards Grid (Tabletop Verified Audit Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {filteredRestaurants.map(r => (
            <div
              key={r.id}
              className="card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderLeft: '4px solid #059669',
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
                    <span className="pill good" style={{ fontSize: 10.5, padding: '2px 8px', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <QrCode size={11} /> TABLETOP VERIFIED AUDIT
                    </span>
                    <h4 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: '#0f172a' }}>
                      {r.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      {r.location} · {r.tableCode}
                    </p>
                  </div>
                  <div style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 10,
                    padding: '6px 10px',
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#047857', display: 'block', lineHeight: 1.1 }}>FOODSAFE</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>TODAY VERIFIED</span>
                  </div>
                </div>

                {/* 3 Physical Signals Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginTop: 14,
                  marginBottom: 14,
                  padding: '10px 8px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: 10
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Thermometer size={16} color="#059669" style={{ margin: '0 auto 3px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{r.signals.cold.title}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>{r.signals.cold.subtitle}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <UserCheck size={16} color="#2563eb" style={{ margin: '0 auto 3px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{r.signals.medical.title}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>{r.signals.medical.subtitle}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <ShieldCheck size={16} color="#7c3aed" style={{ margin: '0 auto 3px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{r.signals.pest.title}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>{r.signals.pest.subtitle}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                  fontSize: 12.5,
                  color: '#64748b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 800, fontSize: 15 }}>
                    <Star size={16} fill="#059669" />
                    <span>{r.score}</span>
                  </div>
                  <span>({r.reviews} verified diner ratings)</span>
                </div>
              </div>

              <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <Link
                  href={`/qr/${r.id}`}
                  className="btn primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 13.5,
                    padding: '10px 14px',
                    background: '#059669',
                    borderColor: '#059669',
                    fontWeight: 700
                  }}
                >
                  ⭐ Rate Restaurant (5 Safety Questions) →
                </Link>
              </div>
            </div>
          ))}
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
