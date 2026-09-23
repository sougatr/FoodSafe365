'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  ChevronRight,
  Home,
  User,
  ExternalLink,
  Sparkles,
  Utensils,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  DinerSafetyRating,
  DinerIncidentReport
} from '@/lib/foodsafety28';

export default function DinerDashboard() {
  const [dinerUser, setDinerUser] = useState<any>({ name: 'Rahul Sharma', city: 'Mumbai', diet: 'Vegetarian' });
  const [ratings, setRatings] = useState<DinerSafetyRating[]>([]);
  const [incidents, setIncidents] = useState<DinerIncidentReport[]>([]);
  const [selectedTable, setSelectedTable] = useState('Table 4');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('foodsafe365_diner_user');
      if (u) {
        try {
          setDinerUser(JSON.parse(u));
        } catch {}
      }

      const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
      if (raw) {
        try {
          const state: AppPhase1State = JSON.parse(raw);
          setRatings(state.dinerRatings || []);
          setIncidents(state.dinerIncidents || []);
        } catch {}
      }
    }
  }, []);

  const SAMPLE_RESTAURANTS = [
    {
      id: 'abc-restaurant',
      name: 'ABC Restaurant',
      location: 'Bandra West, Mumbai',
      cuisine: 'Multi-Cuisine · Dine-in',
      badge: 'FOODSAFE TODAY',
      score: '4.8',
      reviews: 142,
      lastCheck: 'Today, 09:15 AM',
      highlights: ['Cold Room < 5°C OK', 'Staff Stool Tested', 'Pest-Free Verified']
    },
    {
      id: 'delhi-spice-hub',
      name: 'The Spice Pavilion',
      location: 'Connaught Place, New Delhi',
      cuisine: 'North Indian & Mughlai',
      badge: 'FOODSAFE TODAY',
      score: '4.9',
      reviews: 98,
      lastCheck: 'Today, 10:00 AM',
      highlights: ['Reheating ≥ 75°C', 'Safe RO Water', 'FoSTaC Certified']
    },
    {
      id: 'bengaluru-cafe-safe',
      name: 'GreenLeaf Artisan Bistro',
      location: 'Indiranagar, Bengaluru',
      cuisine: 'Continental & Organic Salads',
      badge: 'FOODSAFE TODAY',
      score: '4.7',
      reviews: 210,
      lastCheck: 'Today, 08:45 AM',
      highlights: ['Salad Chill Zone < 5°C', 'Daily Sanitization', 'Washroom Clean']
    }
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      {/* Top Navbar */}
      <div className="topbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Link href="/home" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14
          }}>
            FS
          </div>
          <span>FoodSafe Diner</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/home"
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}
          >
            <Home size={14} /> Home
          </Link>
          <Link href="/login" className="btn secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
            Switch Persona
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 960, paddingTop: 28 }}>
        {/* User Hero Banner */}
        <div className="card" style={{
          padding: 24,
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          color: '#ffffff',
          borderRadius: 16,
          marginBottom: 24,
          boxShadow: '0 4px 16px rgba(4, 120, 87, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                VERIFIED DINER MEMBER
              </span>
              <h1 style={{ fontSize: 26, margin: '10px 0 4px', color: '#ffffff' }}>
                Welcome, {dinerUser.name || 'Diner'}!
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
                {dinerUser.city || 'Mumbai'} · {dinerUser.diet || 'Food Enthusiast'} · Active Food Safety Champion
              </p>
            </div>

            {/* Simulated Tabletop QR Scan Launcher */}
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '14px 18px',
              color: '#0f172a',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <QrCode size={18} color="#059669" />
                <strong style={{ fontSize: 13 }}>Dining Right Now?</strong>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>
                Simulate scanning the tabletop QR code at ABC Restaurant:
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={selectedTable}
                  onChange={e => setSelectedTable(e.target.value)}
                  style={{
                    fontSize: 12,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc'
                  }}
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 4">Table 4 (Window)</option>
                  <option value="Table 12">Table 12 (Balcony)</option>
                </select>
                <Link
                  href={`/qr/abc-restaurant`}
                  className="btn primary"
                  style={{ fontSize: 12, padding: '6px 12px', background: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Open Table Audit <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Directory of FoodSafe Certified Outlets */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 20, margin: '0 0 2px', color: '#0f172a' }}>
                FoodSafe Certified Restaurants in {dinerUser.city || 'Mumbai'}
              </h2>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                Every restaurant below maintains daily kitchen safeguards, medical clearances, and transparent customer ratings.
              </p>
            </div>
            <Link href="/qr/abc-restaurant" className="nav-link" style={{ fontSize: 13, color: '#059669' }}>
              View Test Tabletop QR →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {SAMPLE_RESTAURANTS.map(r => (
              <div key={r.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 16, margin: '0 0 2px' }}>{r.name}</h3>
                      <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                        <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                        {r.location}
                      </p>
                    </div>
                    <span className="pill good" style={{ fontSize: 10, padding: '2px 7px' }}>
                      {r.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: '#475569', margin: '6px 0 10px' }}>{r.cuisine}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                    {r.highlights.map(h => (
                      <span
                        key={h}
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: '#f1f5f9',
                          color: '#334155'
                        }}
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>{r.score}★</span>
                    <span className="muted" style={{ fontSize: 11 }}>({r.reviews} audits)</span>
                  </div>
                  <Link
                    href={`/qr/${r.id}`}
                    className="btn secondary"
                    style={{ fontSize: 12, padding: '5px 10px' }}
                  >
                    Table Audit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My Activity: Recent Ratings & Grievances */}
        <section>
          <h2 style={{ fontSize: 18, margin: '0 0 12px', color: '#0f172a' }}>
            My Food Safety Audits &amp; Incident History
          </h2>

          {ratings.length === 0 && incidents.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              <Sparkles size={24} color="#059669" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: 16, margin: '0 0 4px' }}>No ratings or incidents recorded yet</h3>
              <p className="muted" style={{ fontSize: 13, margin: '0 0 16px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                When you dine out, scan the tabletop QR code at the restaurant to rate kitchen cleanliness, fresh food temperature, or report a concern.
              </p>
              <Link href="/qr/abc-restaurant" className="btn primary" style={{ fontSize: 13, padding: '8px 16px', background: '#059669' }}>
                Test Tabletop Audit QR Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {/* Ratings List */}
              {ratings.map(item => (
                <div key={item.id} className="card" style={{ padding: 16, borderLeft: '4px solid #059669' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong>{item.outletName}</strong>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>{item.overallScore}★</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    {item.tableNumber || 'Dine-In'} · {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#334155', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>Cleanliness: {item.scores.cleanliness}★</span>
                    <span>Staff: {item.scores.staffHygiene}★</span>
                    <span>Freshness: {item.scores.foodFreshness}★</span>
                    <span>Water: {item.scores.safeWater}★</span>
                  </div>
                  {item.feedback && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, fontStyle: 'italic', color: '#475569' }}>
                      "{item.feedback}"
                    </p>
                  )}
                </div>
              ))}

              {/* Incidents List */}
              {incidents.map(inc => (
                <div key={inc.id} className="card" style={{ padding: 16, borderLeft: '4px solid #dc2626' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="pill action" style={{ fontSize: 10, padding: '2px 6px' }}>
                      GRIEVANCE #{inc.id}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b' }}>
                      {inc.status.toUpperCase()}
                    </span>
                  </div>
                  <strong style={{ fontSize: 14, display: 'block', margin: '4px 0 2px' }}>
                    {inc.category.replace('_', ' ').toUpperCase()}
                  </strong>
                  <p style={{ fontSize: 12, color: '#475569', margin: '0 0 6px' }}>
                    {inc.description}
                  </p>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {inc.outletName} ({inc.tableNumber}) · {new Date(inc.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

