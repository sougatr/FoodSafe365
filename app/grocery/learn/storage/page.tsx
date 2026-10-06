'use client';

import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  ChevronLeft,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  Snowflake,
  Sun,
  ShieldAlert,
  ArrowDown
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function LearnStoragePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 920, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* Navigation Breadcrumb */}
        <Link
          href="/grocery/learn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: '#64748B',
            textDecoration: 'none',
            marginBottom: 16
          }}
        >
          <ChevronLeft size={16} /> Back to Learning Overview
        </Link>

        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #075985 0%, #0284c7 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.2)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            LEARNING MODULE 2
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 900, margin: '10px 0 8px', letterSpacing: '-0.02em' }}>
            STORE FOOD SAFELY
          </h1>
          <p style={{ margin: 0, fontSize: 15.5, color: '#e0f2fe', maxWidth: 640, lineHeight: 1.5 }}>
            Proper storage protects your products, stops cross-contamination, and guarantees customers receive safe, fresh food.
          </p>
        </div>

        {/* 1. THREE PRIMARY STORAGE ZONES (CHILLED / FROZEN / DRY STORAGE) */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            THE THREE STORAGE ENVIRONMENTS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* CHILLED */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #BAE6FD',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
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
                <Snowflake size={22} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                COOL &amp; FRESH
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '4px 0 8px' }}>
                CHILLED
              </h2>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                Keep chilled foods within their applicable safe range.
              </p>
              <div style={{ fontSize: 12.5, color: '#64748B', background: '#F0F9FF', padding: '10px 12px', borderRadius: 10 }}>
                💡 <em>Includes:</em> Fresh milk, yogurt, paneer, cut fruits, prepared salads, and chilled meat/seafood.
              </div>
            </div>

            {/* FROZEN */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #C7D2FE',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14
              }}>
                <Layers size={22} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                DEEP FREEZE
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '4px 0 8px' }}>
                FROZEN
              </h2>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                Keep frozen products at the applicable frozen-storage temperature, generally −18°C or below where applicable.
              </p>
              <div style={{ fontSize: 12.5, color: '#64748B', background: '#EEF2FF', padding: '10px 12px', borderRadius: 10 }}>
                💡 <em>Includes:</em> Ice cream, frozen peas, frozen snacks, and frozen meats. Keep rock-hard with no soft spots.
              </div>
            </div>

            {/* DRY STORAGE */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #E2E8F0',
              borderRadius: 18,
              padding: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14
              }}>
                <Sun size={22} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AMBIENT &amp; SHELVING
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '4px 0 8px' }}>
                DRY STORAGE
              </h2>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                Keep food clean, dry, protected and appropriately separated.
              </p>
              <div style={{ fontSize: 12.5, color: '#64748B', background: '#FFFBEB', padding: '10px 12px', borderRadius: 10 }}>
                💡 <em>Includes:</em> Rice, atta, pulses, spices, oil, biscuits, and canned foods. Keep elevated on pallets/shelves.
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE CORE SEPARATION RULE: RAW FOOD -> SEPARATED -> READY-TO-EAT FOOD */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #ef4444',
          borderRadius: 20,
          padding: '26px 28px',
          marginBottom: 32,
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                The Golden Separation Rule
              </h2>
              <span style={{ fontSize: 12.5, color: '#64748B' }}>Never allow juices or contaminants to cross into ready-to-eat foods</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 14,
            padding: '20px',
            margin: '14px 0 18px',
            textAlign: 'center'
          }}>
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #dc2626',
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 900,
              fontSize: 16,
              color: '#dc2626',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.1)'
            }}>
              🥩 RAW FOOD
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontWeight: 800, fontSize: 13 }}>
              <ArrowDown size={18} />
              <span>Keep appropriately separated from</span>
              <ArrowDown size={18} />
            </div>

            <div style={{
              background: '#ffffff',
              border: '1.5px solid #059669',
              borderRadius: 12,
              padding: '12px 24px',
              fontWeight: 900,
              fontSize: 16,
              color: '#059669',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1)'
            }}>
              🥗 READY-TO-EAT FOOD
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: 0 }}>
            Raw meat, poultry, seafood, or unwashed root vegetables carry bacteria that cooking destroys. But ready-to-eat foods (deli cheeses, cut fruits, bakery, dairy) are eaten raw without further cooking. Always store raw items on lower shelves or in dedicated separate chillers so drips never reach ready-to-eat foods.
          </p>
        </div>

        {/* 3. FIFO / FEFO IN VERY SIMPLE TERMS */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: 20,
          padding: '26px 28px',
          marginBottom: 32,
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCw size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Stock Rotation: FIFO &amp; FEFO
              </h2>
              <span style={{ fontSize: 12.5, color: '#64748B' }}>Two simple rules to keep store inventory fresh and avoid expired products</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 14 }}>
            {/* FIFO */}
            <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 14, padding: '18px' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RULE A
              </div>
              <strong style={{ fontSize: 20, color: '#0369a1', display: 'block', margin: '4px 0 2px' }}>
                FIFO
              </strong>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 8 }}>
                First In → First Out
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                The stock that arrived first should be displayed and sold first. When unboxing new cartons, place newer cartons behind older ones on the shelves.
              </p>
            </div>

            {/* FEFO */}
            <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 14, padding: '18px' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                RULE B (EXPIRY-BASED)
              </div>
              <strong style={{ fontSize: 20, color: '#065f46', display: 'block', margin: '4px 0 2px' }}>
                FEFO
              </strong>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#064e3b', marginBottom: 8 }}>
                First Expiry → First Out
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                The item that expires soonest goes to the front of the shelf where shoppers reach first. Never hide expiring items behind new deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* 4. CLEAR CALL TO ACTION BUTTON */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: 20,
          padding: '28px',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 560, margin: '0 auto 20px' }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
              Check Your Store Storage
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Verify that your chillers, freezers, and dry ambient storage zones follow proper separation and temperature rules.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/grocery/storage"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
              }}
            >
              <Layers size={18} />
              <span>CHECK MY STORAGE</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/grocery/learn/temperature"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f1f5f9',
                color: '#334155',
                padding: '14px 22px',
                borderRadius: 12,
                fontSize: 14.5,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Next Lesson: Control Temperature</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
