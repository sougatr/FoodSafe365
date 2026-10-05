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
  Store
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryAlert } from '@/lib/grocery-types';

export default function GroceryHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const outlet = data?.outlet || { name: "Nature's Basket", branchName: 'Bandra West Flagship', managerName: 'Rajesh Nair' };
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

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* FRONTLINE WELCOME HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {outlet.name} · {outlet.branchName || 'Retail Food Store'}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0 }}>
            Good morning, {managerName} 👋
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#64748B' }}>
            Safer food. Every day. Here is what needs your attention today.
          </p>
        </div>

        {/* FOUR SMALL STATUS INDICATORS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 32
        }}>
          {/* Indicator 1: Daily Check */}
          <Link
            href="/grocery/daily-check"
            style={{
              background: '#ffffff',
              border: checkDoneToday ? '1.5px solid #10b981' : '1.5px solid #fbbf24',
              borderRadius: 14,
              padding: '14px 16px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: checkDoneToday ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: checkDoneToday ? '#059669' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ClipboardCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Daily Check
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                {checkDoneToday ? 'Completed' : 'Pending Today'}
              </div>
            </div>
          </Link>

          {/* Indicator 2: Temperature Alerts */}
          <Link
            href="/grocery/temperature"
            style={{
              background: '#ffffff',
              border: activeTempAlerts > 0 ? '1.5px solid #ef4444' : '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '14px 16px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: activeTempAlerts > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              color: activeTempAlerts > 0 ? '#dc2626' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Thermometer size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Temperature Alerts
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: activeTempAlerts > 0 ? '#dc2626' : '#0F172A' }}>
                {activeTempAlerts > 0 ? `${activeTempAlerts} Alert${activeTempAlerts > 1 ? 's' : ''}` : 'All Normal'}
              </div>
            </div>
          </Link>

          {/* Indicator 3: Open Actions */}
          <Link
            href="/grocery/actions"
            style={{
              background: '#ffffff',
              border: openActionsCount > 0 ? '1.5px solid #f97316' : '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '14px 16px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: openActionsCount > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              color: openActionsCount > 0 ? '#ea580c' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Open Actions
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                {openActionsCount > 0 ? `${openActionsCount} Need Action` : '0 Issues'}
              </div>
            </div>
          </Link>

          {/* Indicator 4: Expiring Products */}
          <Link
            href="/grocery/stock"
            style={{
              background: '#ffffff',
              border: expiringStockCount > 0 ? '1.5px solid #ef4444' : '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '14px 16px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: expiringStockCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: expiringStockCount > 0 ? '#dc2626' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <RotateCw size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Expiring Products
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: expiringStockCount > 0 ? '#dc2626' : '#0F172A' }}>
                {expiringStockCount > 0 ? `${expiringStockCount} Need Attention` : 'All Fresh'}
              </div>
            </div>
          </Link>
        </div>

        {/* PROMINENT CARD: TODAY'S DAILY CHECK */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
          marginBottom: 36,
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
              <span>ROUTINE STORE CHECK</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Today's Daily Food Safety Check
            </h2>
            <p style={{ margin: '0 0 10px', fontSize: 14, color: '#a7f3d0' }}>
              Complete your routine food-safety check to ensure clean premises, chilled stock, and safe food.
            </p>
            <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#d1fae5', fontWeight: 600 }}>
              <span>✓ 22 checks</span>
              <span>•</span>
              <span>⏱ About 5 minutes</span>
              <span>•</span>
              <span>📋 Simple YES / NO</span>
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
                padding: '14px 28px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>START DAILY CHECK</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* SECTION: LEARN FOOD SAFETY (3 LARGE CARDS) */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LEARN → DO → CHECK → ACT
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 900, color: 'var(--text, #0f172a)', margin: '4px 0 0' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {/* CARD 1: RECEIVE FOOD SAFELY */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Truck size={24} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STEP 1 · RECEIVING
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '4px 0 8px' }}>
                  Receive Food Safely
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Learn how to check food when it arrives at your dock: delivery truck, packaging seals, date markings, and temperature.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  href="/grocery/learn/receiving"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Learn
                </Link>
                <Link
                  href="/grocery/receiving"
                  style={{
                    textAlign: 'center',
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  title="Try Receiving Form"
                >
                  Try Now
                </Link>
              </div>
            </div>

            {/* CARD 2: STORE FOOD SAFELY */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Layers size={24} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STEP 2 · STORAGE &amp; FEFO
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '4px 0 8px' }}>
                  Store Food Safely
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Learn where different foods should be stored, how to separate raw meat from ready-to-eat foods, and First Expiry, First Out.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  href="/grocery/learn/storage"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Learn
                </Link>
                <Link
                  href="/grocery/stock"
                  style={{
                    textAlign: 'center',
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  title="View Stock"
                >
                  View Stock
                </Link>
              </div>
            </div>

            {/* CARD 3: CONTROL TEMPERATURE */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(234, 88, 12, 0.12)',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Thermometer size={24} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STEP 3 · TEMPERATURE CONTROL
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '4px 0 8px' }}>
                  Control Temperature
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Learn how to check chillers and freezers, what green/amber/red mean, and what to do if temperatures drift.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  href="/grocery/learn/temperature"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Learn
                </Link>
                <Link
                  href="/grocery/temperature"
                  style={{
                    textAlign: 'center',
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  title="Log Temperatures"
                >
                  Log Temp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY OPERATIONAL SHORTCUTS */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            Operations &amp; Advanced Tools
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Link
              href="/grocery/receiving"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textDecoration: 'none',
                color: '#1E293B'
              }}
            >
              <Truck size={18} color="#059669" />
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>Dockside Receiving</strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>Record delivery inspection</span>
              </div>
            </Link>

            <Link
              href="/grocery/temperature"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textDecoration: 'none',
                color: '#1E293B'
              }}
            >
              <Thermometer size={18} color="#ea580c" />
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>Chillers &amp; Freezers</strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>Log probe temperatures</span>
              </div>
            </Link>

            <Link
              href="/grocery/storage"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textDecoration: 'none',
                color: '#1E293B'
              }}
            >
              <Layers size={18} color="#0284c7" />
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>Storage &amp; Zones</strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>Segregation &amp; layouts</span>
              </div>
            </Link>

            <Link
              href="/grocery/stock"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textDecoration: 'none',
                color: '#1E293B'
              }}
            >
              <RotateCw size={18} color="#7c3aed" />
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>FIFO / FEFO Stock</strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>Batch expiry &amp; quarantine</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
