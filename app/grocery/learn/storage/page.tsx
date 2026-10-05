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
  Package,
  Sparkles
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function LearnStoragePage() {
  const CATEGORIES = [
    {
      name: 'Meat & Chicken',
      icon: '🍗',
      color: '#dc2626',
      where: 'Dedicated meat chiller or bottom shelves of cold room (≤4°C).',
      protect: 'Juices and drips must never reach any other food. Always keep trays covered and sealed.',
      separate: 'Keep strictly away from ready-to-eat salads, dairy, and cooked deli foods.',
      check: 'Check for dripping bloody liquid, torn cling-film, off-odors, or surface stickiness.'
    },
    {
      name: 'Fish & Seafood',
      icon: '🐟',
      color: '#0284c7',
      where: 'Sloped, drained crushed-ice bed or dedicated fish chiller (≤2°C to 4°C).',
      protect: 'Ensure melting ice water drains continuously into a plumbed drip tray; never let fish sit in stagnant water.',
      separate: 'Never store raw unscaled fish next to open cooked foods, cheeses, or raw poultry.',
      check: 'Check clear bright eyes, firm flesh that springs back, fresh ocean scent (no ammonia).'
    },
    {
      name: 'Milk & Dairy',
      icon: '🥛',
      color: '#059669',
      where: 'Dairy display multideck chiller or walk-in dairy chamber (≤5°C).',
      protect: 'Protect from warm air blasts and open sunlit doors. Keep air vents inside chillers unobstructed.',
      separate: 'Keep cheese and curd packets above any raw produce; never place near raw meats.',
      check: 'Check for puffed/bloated milk packets, leaking seams, sour odors, or curdling.'
    },
    {
      name: 'Fruits & Vegetables',
      icon: '🥗',
      color: '#16a34a',
      where: 'Whole produce in ventilated ambient/cool crates (10–15°C); cut fruits & salads in chiller (≤5°C).',
      protect: 'Wash and sanitize display bins daily; discard bruised or decaying items immediately to stop fruit flies.',
      separate: 'Keep cut melon/fruit boxes covered; never display raw cut salads alongside unwashed earthy root potatoes.',
      check: 'Check for mold fuzz on berries, slimy spots on greens, bad smells, and cut fruit display temperature.'
    },
    {
      name: 'Frozen Foods',
      icon: '🧊',
      color: '#0369a1',
      where: 'Commercial island freezer or deep-freeze cold room (−18°C or below).',
      protect: 'Never stack products above the maximum freezer load limit line, as air stops circulating above it.',
      separate: 'Keep vegetarian frozen foods segregated from non-veg frozen items.',
      check: 'Check that packs are rock-hard, without thick frost crystals (frost indicates prior thawing and re-freezing).'
    },
    {
      name: 'Bread & Bakery',
      icon: '🍞',
      color: '#d97706',
      where: 'Clean, dry display racks elevated off the floor, away from direct sunlight.',
      protect: 'Protect from moisture, steam, and pests (cockroaches and rodents love warm bread crumbs).',
      separate: 'Store gluten-free or allergen-free bakery items on dedicated upper shelves with clear labels.',
      check: 'Daily morning check for green/black mold spots, crushed loaves, and expired date tags.'
    },
    {
      name: 'Dry Groceries & Staples',
      icon: '🌾',
      color: '#475569',
      where: 'Dry ambient storage racks, stacked on food-grade pallets at least 15 cm off the floor.',
      protect: 'Keep bags and cartons 15 cm away from walls to allow ventilation and rodent inspection sweeps.',
      separate: 'Keep non-food cleaning chemicals and bug sprays in a separate locked room or metal cabinet.',
      check: 'Check for torn sacks, grain weevil activity, rat droppings, or water dampness on bottom cartons.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 950, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* Back Link */}
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

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #075985 0%, #0284c7 100%)',
          borderRadius: 20,
          padding: '28px',
          color: '#ffffff',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.2)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
            Lesson 2 · Storage &amp; Separation
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 900, margin: '10px 0 6px' }}>
            Store Food Safely
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: '#bae6fd', maxWidth: 640, lineHeight: 1.5 }}>
            Learn where different foods should be placed, what to separate, and how to practice First Expiry, First Out (FEFO).
          </p>
        </div>

        {/* FEFO HIGHLIGHT PANEL */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: 18,
          padding: '24px 28px',
          marginBottom: 32,
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCw size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                FEFO: First Expiry, First Out
              </h2>
              <span style={{ fontSize: 12.5, color: '#64748B' }}>The golden rule of retail food stock rotation</span>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, margin: '0 0 14px' }}>
            Whenever you restock shelves, <strong>never put newer boxes in front of older ones</strong>.
            The items that expire soonest must always sit at the front of the shelf where shoppers reach first.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            background: '#F0F9FF',
            borderRadius: 12,
            padding: '16px',
            border: '1px solid #BAE6FD'
          }}>
            <div>
              <strong style={{ fontSize: 13, color: '#0369a1', display: 'block', marginBottom: 2 }}>
                1. Pull Older Stock Forward
              </strong>
              <span style={{ fontSize: 12.5, color: '#475569' }}>
                When a new crate arrives, slide remaining cartons on the shelf to the front row.
              </span>
            </div>
            <div>
              <strong style={{ fontSize: 13, color: '#0369a1', display: 'block', marginBottom: 2 }}>
                2. Load New Stock at the Back
              </strong>
              <span style={{ fontSize: 12.5, color: '#475569' }}>
                Place newly arrived cartons behind the existing units on the shelf or pallet.
              </span>
            </div>
            <div>
              <strong style={{ fontSize: 13, color: '#0369a1', display: 'block', marginBottom: 2 }}>
                3. Daily Morning Date Sweep
              </strong>
              <span style={{ fontSize: 12.5, color: '#475569' }}>
                If an item reaches its expiry date today, remove it immediately into the Red Quarantine Area.
              </span>
            </div>
          </div>
        </div>

        {/* 7 CATEGORY CARDS */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
            Where to Store Each Category
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {CATEGORIES.map(c => (
              <div
                key={c.name}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: 16,
                  padding: '20px 24px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {c.name}
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  background: '#F8FAFC',
                  borderRadius: 12,
                  padding: '14px',
                  fontSize: 13,
                  lineHeight: 1.45
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#0284c7', textTransform: 'uppercase', marginBottom: 2 }}>
                      Where to Store
                    </strong>
                    <span style={{ color: '#334155' }}>{c.where}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#059669', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to Protect
                    </strong>
                    <span style={{ color: '#334155' }}>{c.protect}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#dc2626', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to Separate
                    </strong>
                    <span style={{ color: '#334155' }}>{c.separate}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to Check
                    </strong>
                    <span style={{ color: '#334155' }}>{c.check}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            Check Your Store's Current Inventory &amp; Expiry Dates
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 16px' }}>
            View tracked batches, active safety locks, and quarantine records.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/grocery/stock"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>View Stock &amp; FEFO Records</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/grocery/storage"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Check Storage Zones
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
