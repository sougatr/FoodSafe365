'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  AlertTriangle,
  Thermometer,
  Layers,
  Truck,
  RotateCw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PackageCheck
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryAlert } from '@/lib/grocery-types';

export default function GroceryHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        let outletId = 'store-nature-basket-bandra';
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
          if (saved) outletId = saved;
        }

        const res = await fetch(`/api/v1/grocery/dashboard?outletId=${encodeURIComponent(outletId)}`);
        const json = await res.json();
        if (res.ok && (json.success || json.data)) {
          setData(json.data || json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const counts = data?.counts || {};
  const outlet = data?.outlet || { name: "Nature's Basket", branchName: 'Bandra West Flagship', managerName: 'Rajesh' };
  const alerts: GroceryAlert[] = data?.alerts || [];

  const managerName = outlet.managerName || 'Rajesh';
  const checkDoneToday = Boolean(counts.dailyChecksCount && counts.dailyChecksCount > 0);
  const activeTempAlerts = alerts.filter(a => a.type === 'TEMP_BREACH' && a.status === 'OPEN').length;
  const openActionsCount = counts.openActionsCount || 0;
  const expiringStockCount = counts.expiringStockCount || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader outletName={outlet.name} branchName={outlet.branchName} />

      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* 1. GREETING */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {outlet.name} · {outlet.branchName || 'Retail Food Store'}
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 34px)', fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0, letterSpacing: '-0.02em' }}>
            Good morning, {managerName} 👋
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 15, color: '#64748B' }}>
            Safer food. Every day. Learn what to do, check your store, and keep food safe.
          </p>
        </div>

        {/* 2. TODAY'S FOOD SAFETY CHECK PROMINENT CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 22,
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.22)',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10
            }}>
              <Clock size={13} />
              <span>{checkDoneToday ? 'COMPLETED TODAY' : 'TODAY\'S FOOD SAFETY CHECK'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 2.8vw, 28px)', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Today's Food Safety Check
            </h2>
            <p style={{ margin: '0 0 10px', fontSize: 14.5, color: '#a7f3d0', maxWidth: 540, lineHeight: 1.45 }}>
              Walk the store and complete your daily check to ensure clean premises, chilled stock, and safe food.
            </p>
            <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#d1fae5', fontWeight: 600, flexWrap: 'wrap' }}>
              <span>✓ 22 simple checks</span>
              <span>•</span>
              <span>⏱ About 5 minutes</span>
              <span>•</span>
              <span>📋 YES / NO</span>
            </div>
          </div>

          <div>
            <Link
              href="/grocery/daily-check"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: '#ffffff',
                color: '#064e3b',
                padding: '14px 30px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{checkDoneToday ? 'REVIEW DAILY CHECK' : 'START DAILY CHECK'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3. THREE SIMPLE STATUS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginBottom: 36
        }}>
          {/* Card 1: Temperature */}
          <Link
            href="/grocery/temperature"
            style={{
              background: '#ffffff',
              border: activeTempAlerts > 0 ? '1.5px solid #ef4444' : '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: activeTempAlerts > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: activeTempAlerts > 0 ? '#dc2626' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Thermometer size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Temperature
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: activeTempAlerts > 0 ? '#dc2626' : '#0F172A', marginTop: 1 }}>
                {activeTempAlerts > 0 ? `${activeTempAlerts} Alert${activeTempAlerts > 1 ? 's' : ''}` : 'All normal'}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Chillers &amp; freezers
              </div>
            </div>
          </Link>

          {/* Card 2: Open Actions */}
          <Link
            href="/grocery/actions"
            style={{
              background: '#ffffff',
              border: openActionsCount > 0 ? '1.5px solid #f97316' : '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: openActionsCount > 0 ? 'rgba(249, 115, 22, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: openActionsCount > 0 ? '#ea580c' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Open Actions
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: openActionsCount > 0 ? '#ea580c' : '#0F172A', marginTop: 1 }}>
                {openActionsCount}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                {openActionsCount === 0 ? 'All resolved' : 'Need attention'}
              </div>
            </div>
          </Link>

          {/* Card 3: Products */}
          <Link
            href="/grocery/stock"
            style={{
              background: '#ffffff',
              border: expiringStockCount > 0 ? '1.5px solid #ef4444' : '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '18px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: expiringStockCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: expiringStockCount > 0 ? '#dc2626' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <RotateCw size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Products
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: expiringStockCount > 0 ? '#dc2626' : '#0F172A', marginTop: 1 }}>
                {expiringStockCount > 0 ? `${expiringStockCount} Need attention` : 'All good'}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Stock &amp; expiry rotation
              </div>
            </div>
          </Link>
        </div>

        {/* 4. LEARN FOOD SAFETY SECTION (3 PROMINENT BUTTONS / CARDS) */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                LEARN → RECEIVE → STORE → TEMPERATURE → DAILY CHECK
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text, #0f172a)', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
                Learn Food Safety
              </h2>
            </div>
            <Link
              href="/grocery/learn"
              style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>View All Lessons</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* LEARN CARD 1: RECEIVE FOOD SAFELY */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}>
                  <Truck size={22} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STEP 1 · RECEIVING
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '4px 0 6px' }}>
                  Receive Food Safely
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Check incoming deliveries: product, packaging, dates, temperature requirements, and condition.
                </p>
              </div>
              <Link
                href="/grocery/learn/receiving"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                }}
              >
                <span>Receive Food Safely</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* LEARN CARD 2: STORE FOOD SAFELY */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}>
                  <Layers size={22} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STEP 2 · STORAGE &amp; SEPARATION
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '4px 0 6px' }}>
                  Store Food Safely
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Learn chilled, frozen, and dry storage rules, raw vs ready separation, and simple FIFO/FEFO rotation.
                </p>
              </div>
              <Link
                href="/grocery/learn/storage"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                }}
              >
                <span>Store Food Safely</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* LEARN CARD 3: CONTROL TEMPERATURE */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(234, 88, 12, 0.12)',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14
                }}>
                  <Thermometer size={22} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STEP 3 · TEMPERATURE CONTROL
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '4px 0 6px' }}>
                  Control Temperature
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Keep chillers and freezers safe. Understand Check → Record → Act and what to do when temperatures drift.
                </p>
              </div>
              <Link
                href="/grocery/learn/temperature"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                }}
              >
                <span>Control Temperature</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* 5. ADVANCED FUNCTIONS (FOR MANAGERS & ADVANCED USERS — CLEAN & UNOBTRUSIVE) */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '18px 22px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#475569',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                Manager &amp; Advanced Operations
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                FIFO/FEFO stock, detailed logs, zones, alerts, corrective actions, and verification
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#059669' }}>
              <span>{showAdvanced ? 'Hide Tools' : 'Show Tools'}</span>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {showAdvanced && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid #E2E8F0'
            }}>
              <Link
                href="/grocery/stock"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: '#1E293B'
                }}
              >
                <RotateCw size={17} color="#7c3aed" />
                <div>
                  <strong style={{ fontSize: 13, display: 'block' }}>FIFO / FEFO Stock</strong>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>Batch expiry &amp; quarantine</span>
                </div>
              </Link>

              <Link
                href="/grocery/temperature"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: '#1E293B'
                }}
              >
                <Thermometer size={17} color="#ea580c" />
                <div>
                  <strong style={{ fontSize: 13, display: 'block' }}>Temperature Logs</strong>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>Detailed probe records</span>
                </div>
              </Link>

              <Link
                href="/grocery/storage"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: '#1E293B'
                }}
              >
                <Layers size={17} color="#0284c7" />
                <div>
                  <strong style={{ fontSize: 13, display: 'block' }}>Storage &amp; Zones</strong>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>Segregation &amp; layouts</span>
                </div>
              </Link>

              <Link
                href="/grocery/receiving"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: '#1E293B'
                }}
              >
                <Truck size={17} color="#059669" />
                <div>
                  <strong style={{ fontSize: 13, display: 'block' }}>Dockside Receiving</strong>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>Delivery inspections</span>
                </div>
              </Link>

              <Link
                href="/grocery/actions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: '#1E293B'
                }}
              >
                <AlertTriangle size={17} color="#d97706" />
                <div>
                  <strong style={{ fontSize: 13, display: 'block' }}>Corrective Actions</strong>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>Resolve store issues</span>
                </div>
              </Link>

              <Link
                href="/actions?status=awaiting_verification"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  color: '#1E293B'
                }}
              >
                <CheckCircle2 size={17} color="#059669" />
                <div>
                  <strong style={{ fontSize: 13, display: 'block' }}>Verification Register</strong>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>Manager sign-offs</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
