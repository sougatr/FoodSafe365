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
  ArrowRight,
  Store,
  Building2
} from 'lucide-react';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  DinerSafetyRating,
  DinerIncidentReport
} from '@/lib/foodsafety28';
import GlobalHeader from '@/components/GlobalHeader';

export interface FoodBusinessCard {
  id: string;
  name: string;
  businessType: 'Restaurant' | 'Grocery Store' | 'Supermarket' | 'Café' | 'Bakery' | 'Other';
  location: string;
  category: string;
  status: 'ACTIVE' | 'UNCLAIMED' | 'DISCOVERED';
  score: string;
  reviews: number;
  lastCheck?: string;
  highlights: string[];
}

export default function DinerDashboard() {
  const [dinerUser, setDinerUser] = useState<any>({ name: 'Rahul Sharma', city: 'Mumbai', diet: 'Food Enthusiast' });
  const [ratings, setRatings] = useState<DinerSafetyRating[]>([]);
  const [incidents, setIncidents] = useState<DinerIncidentReport[]>([]);
  const [selectedTable, setSelectedTable] = useState('Table 4');
  const [searchQuery, setSearchQuery] = useState('');

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

  const SAMPLE_BUSINESSES: FoodBusinessCard[] = [
    {
      id: 'leopold-cafe',
      name: 'Leopold Cafe & Bar',
      businessType: 'Restaurant',
      location: 'Colaba Causeway, Mumbai',
      category: 'Heritage Cafe & Restaurant',
      status: 'UNCLAIMED',
      score: '4.6',
      reviews: 620,
      highlights: ['Customer Feedback Enabled', 'Heritage Dining', 'Central Colaba']
    },
    {
      id: 'freshmart-supermarket',
      name: 'FreshMart Supermarket',
      businessType: 'Supermarket',
      location: 'Bandra West, Mumbai',
      category: 'Fresh Produce, Dairy & Groceries',
      status: 'UNCLAIMED',
      score: '4.4',
      reviews: 310,
      highlights: ['Cold Storage Dairy', 'Fresh Produce Misting', 'Shopper Feedback Enabled']
    },
    {
      id: 'abc-grocery',
      name: 'ABC Grocery',
      businessType: 'Grocery Store',
      location: 'Andheri East, Mumbai',
      category: 'Neighborhood Kirana & Packaged Goods',
      status: 'UNCLAIMED',
      score: '4.3',
      reviews: 145,
      highlights: ['Pest Controlled Storage', 'Daily Expiry Check', 'Customer Voice Enabled']
    },
    {
      id: 'the-tibetan-kitchen',
      name: 'The Tibetan Kitchen',
      businessType: 'Restaurant',
      location: 'Fort, Mumbai',
      category: 'Himalayan & Asian Specialties',
      status: 'UNCLAIMED',
      score: '4.5',
      reviews: 180,
      highlights: ['Steam Cooking Controls', 'Filtered Water', 'Customer Ratings Open']
    },
    {
      id: 'the-table',
      name: 'The Table',
      businessType: 'Restaurant',
      location: 'Colaba, Mumbai',
      category: 'Fine Dining & Farm-to-Table',
      status: 'ACTIVE',
      score: '4.9',
      reviews: 320,
      lastCheck: 'Today, 09:30 AM',
      highlights: ['Cold Room < 5°C OK', 'Staff Stool Tested', 'Pest-Free Verified']
    },
    {
      id: 'abc-restaurant',
      name: 'ABC Restaurant',
      businessType: 'Restaurant',
      location: 'Bandra West, Mumbai',
      category: 'Multi-Cuisine · Dine-in',
      status: 'ACTIVE',
      score: '4.8',
      reviews: 142,
      lastCheck: 'Today, 09:15 AM',
      highlights: ['Cold Room < 5°C OK', 'Reheating ≥ 75°C', 'Daily Sanitized']
    }
  ];

  const filteredBusinesses = SAMPLE_BUSINESSES.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.businessType.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      <GlobalHeader />

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
                FOODSAFE CUSTOMER COMMUNITY
              </span>
              <h1 style={{ fontSize: 26, margin: '10px 0 4px', color: '#ffffff' }}>
                Welcome, {dinerUser.name || 'Food Safety Champion'}!
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 14 }}>
                {dinerUser.city || 'Mumbai'} · Customer Food-Safety Feedback Hub
              </p>
            </div>

            {/* Simulated QR Scan Launcher */}
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '14px 18px',
              color: '#0f172a',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <QrCode size={18} color="#059669" />
                <strong style={{ fontSize: 13 }}>Visiting a Food Business?</strong>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>
                Simulate scanning the QR code at ABC Restaurant:
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
                  Open QR Rating <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Directory & Discovery of Food Businesses */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 20, margin: '0 0 2px', color: '#0f172a' }}>
                Food Businesses in {dinerUser.city || 'Mumbai'}
              </h2>
              <p className="muted" style={{ fontSize: 13, margin: 0, maxWidth: 640 }}>
                Find restaurants, grocery stores, cafés and supermarkets. Rate your experience or provide customer food-safety feedback.
              </p>
            </div>

            {/* Search Input Filter */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 260
            }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Leopold, FreshMart, Grocery..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  width: '100%',
                  background: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Unclaimed Status Transparency Note */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.45
          }}>
            ℹ️ <strong>Claim Status Information:</strong> An <em>Unclaimed</em> badge simply indicates that the business has not yet claimed its digital FoodSafe365 profile. It does <strong>not</strong> mean the business is unsafe. Customer feedback for unclaimed businesses is securely recorded and delivered via invitation.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {filteredBusinesses.map(r => (
              <div key={r.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 16, margin: '0 0 2px', color: '#0f172a' }}>{r.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '3px 0 0' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#047857',
                          background: '#ecfdf5',
                          padding: '1px 6px',
                          borderRadius: 4
                        }}>
                          {r.businessType}
                        </span>
                        <span className="muted" style={{ fontSize: 12 }}>
                          <MapPin size={11} style={{ display: 'inline', marginRight: 2 }} />
                          {r.location}
                        </span>
                      </div>
                    </div>
                    {r.status === 'ACTIVE' ? (
                      <span className="pill good" style={{ fontSize: 10, padding: '2px 7px' }}>
                        FOODSAFE ACTIVE
                      </span>
                    ) : (
                      <span className="pill neutral" style={{ fontSize: 10, padding: '2px 7px' }}>
                        UNCLAIMED
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 12, color: '#475569', margin: '6px 0 10px' }}>{r.category}</p>

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
                    <span className="muted" style={{ fontSize: 11 }}>({r.reviews} ratings)</span>
                  </div>
                  <Link
                    href={`/qr/${r.id}`}
                    className="btn secondary"
                    style={{ fontSize: 12, padding: '5px 12px' }}
                  >
                    Rate Business →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                No food businesses matched &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching for <em>Leopold, FreshMart, Grocery, Supermarket,</em> or <em>Colaba</em>.
              </p>
            </div>
          )}
        </section>

        {/* My Activity: Recent Ratings & Grievances */}
        <section>
          <h2 style={{ fontSize: 18, margin: '0 0 12px', color: '#0f172a' }}>
            My Food Safety Ratings &amp; Incident History
          </h2>

          {ratings.length === 0 && incidents.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: 'center' }}>
              <Sparkles size={24} color="#059669" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: 16, margin: '0 0 4px' }}>No ratings or incidents recorded yet</h3>
              <p className="muted" style={{ fontSize: 13, margin: '0 0 16px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
                When you visit a restaurant or grocery store, scan the FoodSafe365 QR code to rate hygiene, fresh product temperature, or share feedback.
              </p>
              <Link href="/qr/freshmart-supermarket" className="btn primary" style={{ fontSize: 13, padding: '8px 16px', background: '#059669' }}>
                Try Rating FreshMart Supermarket
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
                    {item.tableNumber || 'Visit'} · {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#334155', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>Cleanliness: {item.scores.cleanliness}★</span>
                    <span>Staff: {item.scores.staffHygiene}★</span>
                    <span>Freshness: {item.scores.foodFreshness}★</span>
                    <span>Water/Facilities: {item.scores.safeWater}★</span>
                  </div>
                  {item.feedback && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, fontStyle: 'italic', color: '#475569' }}>
                      &ldquo;{item.feedback}&rdquo;
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
