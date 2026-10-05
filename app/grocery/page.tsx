'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  Layers,
  Thermometer,
  RotateCw,
  Sparkles,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryAlert } from '@/lib/grocery-types';

export default function GroceryDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (savedId) outletId = savedId;
      }

      const res = await fetch(`/api/v1/grocery/dashboard?outletId=${encodeURIComponent(outletId)}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const counts = data?.counts || {};
  const alerts: GroceryAlert[] = data?.alerts || [];
  const outlet = data?.outlet || { name: 'Nature Fresh Market', branchName: 'Bandra West Flagship' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader outletName={outlet.name} branchName={outlet.branchName} />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {/* Top Operational Metrics Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: 20,
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
          marginBottom: 28
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#6ee7b7',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: 999
              }}>
                RETAIL FOOD SAFETY OPERATIONAL WORKFLOW
              </span>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                Grocery Food Safety
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: '#a7f3d0', maxWidth: 640, lineHeight: 1.5 }}>
                RECEIVE → STORE → MONITOR → ALERT → ACT → VERIFY
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                href="/grocery/daily-check"
                style={{
                  background: '#ffffff',
                  color: '#065f46',
                  padding: '10px 20px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <ClipboardCheck size={16} /> Start Daily 22 Check
              </Link>
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.18)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 11.5, color: '#a7f3d0' }}>Today&apos;s Checks</span>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span>{counts.todayChecksCompleted || 0} / 22</span>
                <span style={{ fontSize: 11, color: counts.todayChecksCompleted === 22 ? '#34d399' : '#fde047' }}>
                  {counts.todayChecksCompleted === 22 ? 'Done' : 'Pending'}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.18)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 11.5, color: '#a7f3d0' }}>Temperature Alerts</span>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4, color: counts.tempBreaches > 0 ? '#fca5a5' : '#34d399' }}>
                {counts.tempBreaches || 0}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.18)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 11.5, color: '#a7f3d0' }}>Expired Stock (Pull Now)</span>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4, color: counts.expiredStockCount > 0 ? '#fca5a5' : '#34d399' }}>
                {counts.expiredStockCount || 0}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.18)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 11.5, color: '#a7f3d0' }}>Near Expiry (FEFO)</span>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4, color: '#fde047' }}>
                {counts.nearExpiryCount || 0}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.18)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 11.5, color: '#a7f3d0' }}>Receiving Exceptions</span>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
                {counts.receivingExceptionsToday || 0}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE ALERTS FEED (IF ANY) */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#dc2626" /> Active Food Safety Alerts ({alerts.length})
              </h2>
              <span style={{ fontSize: 12, color: '#64748B' }}>Real-time exception triggers</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map(alt => (
                <div
                  key={alt.id}
                  style={{
                    background: alt.severity === 'RED' ? '#fef2f2' : '#fffbeb',
                    border: `1.5px solid ${alt.severity === 'RED' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                    borderRadius: 12,
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: alt.severity === 'RED' ? '#fee2e2' : '#fef3c7',
                      color: alt.severity === 'RED' ? '#dc2626' : '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: alt.severity === 'RED' ? '#dc2626' : '#d97706',
                          color: '#ffffff'
                        }}>
                          {alt.severity}
                        </span>
                        <strong style={{ fontSize: 14, color: '#0F172A' }}>{alt.title}</strong>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
                        {alt.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {alt.type === 'TEMP_BREACH' && (
                      <Link
                        href="/grocery/temperature"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '6px 14px',
                          borderRadius: 8,
                          background: '#dc2626',
                          color: '#ffffff',
                          textDecoration: 'none'
                        }}
                      >
                        Check Equipment →
                      </Link>
                    )}
                    {alt.type === 'EXPIRED_PRODUCT' && (
                      <Link
                        href="/grocery/stock"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '6px 14px',
                          borderRadius: 8,
                          background: '#dc2626',
                          color: '#ffffff',
                          textDecoration: 'none'
                        }}
                      >
                        Quarantine Stock →
                      </Link>
                    )}
                    {alt.type === 'SEGREGATION_RISK' && (
                      <Link
                        href="/grocery/storage"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '6px 14px',
                          borderRadius: 8,
                          background: '#dc2626',
                          color: '#ffffff',
                          textDecoration: 'none'
                        }}
                      >
                        Fix Storage →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7 PRIMARY OPERATIONAL CARDS */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', marginBottom: 14 }}>
          Core Operational Workflows
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16
        }}>
          {/* 1. RECEIVING */}
          <Link
            href="/grocery/receiving"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Truck size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 1
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                1. RECEIVING
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;Check today&apos;s incoming food&rdquo; · Inspect suppliers, packaging, seal integrity, and delivery temperatures before acceptance.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Log Incoming Batch</span>
              <ChevronRight size={16} color="#059669" />
            </div>
          </Link>

          {/* 2. STORAGE */}
          <Link
            href="/grocery/storage"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(14, 165, 233, 0.12)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Layers size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: 'rgba(14, 165, 233, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 2
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                2. STORAGE
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;Are food products stored correctly?&rdquo; · Zone mapping, food vs chemical segregation, off-floor pallet elevation, and raw vs RTE separation.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0284c7' }}>View Storage Zones</span>
              <ChevronRight size={16} color="#0284c7" />
            </div>
          </Link>

          {/* 3. TEMPERATURE */}
          <Link
            href="/grocery/temperature"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Thermometer size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 3
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                3. TEMPERATURE
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;Monitor chillers &amp; freezers&rdquo; · Routine twice-daily logging for dairy (≤5°C), meat chillers, and deep freezers (≤-18°C).
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>Log Readings</span>
              <ChevronRight size={16} color="#4f46e5" />
            </div>
          </Link>

          {/* 4. STOCK ROTATION */}
          <Link
            href="/grocery/stock"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(234, 88, 12, 0.12)',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RotateCw size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 4
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                4. STOCK ROTATION
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;FIFO / FEFO&rdquo; · First Expiry First Out stock rotation. Real-time expiry alerts and quarantine safety locks.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}>Manage Batches</span>
              <ChevronRight size={16} color="#ea580c" />
            </div>
          </Link>

          {/* 5. HYGIENE & DAILY CHECKS */}
          <Link
            href="/grocery/daily-check"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClipboardCheck size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 5
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                5. HYGIENE &amp; CHECKS
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;Store cleanliness &amp; pest control&rdquo; · 22 FSSAI-aligned operational checks: waste bins, pest light traps, and sanitary maintenance.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Run 22 Daily Checks</span>
              <ChevronRight size={16} color="#059669" />
            </div>
          </Link>

          {/* 6. CORRECTIVE ACTIONS */}
          <Link
            href="/actions"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 6
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                6. CORRECTIVE ACTIONS
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;Problems requiring action&rdquo; · Assign responsible staff, specify immediate corrections, root causes, and external service requests.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>View Action Register</span>
              <ChevronRight size={16} color="#dc2626" />
            </div>
          </Link>

          {/* 7. VERIFICATION */}
          <Link
            href="/actions?status=awaiting_verification"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={22} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  STEP 7
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                7. VERIFICATION
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                &ldquo;Actions awaiting verification&rdquo; · Independent review of completed corrective actions before closing. Prevents self-closing of food risks.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>Verify Completed Actions</span>
              <ChevronRight size={16} color="#2563eb" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
