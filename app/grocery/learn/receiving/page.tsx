'use client';

import Link from 'next/link';
import {
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  Calendar,
  Thermometer,
  Package,
  ShieldCheck,
  FileText
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function LearnReceivingPage() {
  const STEPS = [
    {
      num: 1,
      title: 'Check the Supplier',
      subtitle: 'Is this an authorized, reputable delivery?',
      icon: FileText,
      why: 'Unauthorized or unknown vendors might supply counterfeit or uninspected items without hygiene audits.',
      doWhat: 'Verify the delivery challan matches your store order and comes from an approved vendor list.',
      check: 'Vendor name on invoice, vehicle branding, delivery driver identification.',
      wrong: 'If vendor is unrecognized or unapproved, halt delivery and call store manager before unloading.'
    },
    {
      num: 2,
      title: 'Check Delivery Condition',
      subtitle: 'Is the delivery truck clean, cool, and odor-free?',
      icon: Truck,
      why: 'Dirty trucks or trucks transporting chemicals and trash alongside food will contaminate food packaging.',
      doWhat: 'Step inside the truck cargo area before boxes are offloaded. Check for chemical odors, dirt, or signs of pests.',
      check: 'Clean cargo floor, no diesel or chemical odors, no flies, rodents, or water pools.',
      wrong: 'Refuse unloading if truck has spilled chemicals, rotting odors, or dead/live pests inside.'
    },
    {
      num: 3,
      title: 'Check Packaging',
      subtitle: 'Are packages clean, sealed, and undamaged?',
      icon: Package,
      why: 'Torn bags, dented cans, broken vacuum seals, or crushed cartons let bacteria, mold, and insects enter.',
      doWhat: 'Examine primary food containers and cartons for punctures, leakage, bulging tops, or tape tampering.',
      check: 'Cans without rust or bulges; milk pouches without leaks; dry staple sacks without insect holes.',
      wrong: 'Reject punctured or leaking units; ask driver for replacement or debit credit note.'
    },
    {
      num: 4,
      title: 'Check Date Markings',
      subtitle: 'Are expiry / best-before dates clear and valid?',
      icon: Calendar,
      why: 'Selling near-expiry or expired food endangers customers, causes food waste, and violates food safety rules.',
      doWhat: 'Check manufacture date, use-by date, or best-before stamp on cartons and retail packages.',
      check: 'Ensure delivery has at least 75% of total shelf life remaining (or store standard policy).',
      wrong: 'Reject stock delivered with passed expiry date or missing date stamps.'
    },
    {
      num: 5,
      title: 'Check Temperature When Applicable',
      subtitle: 'For milk, meat, fish, cut salads, and frozen foods',
      icon: Thermometer,
      why: 'Cold chain breaks allow rapid microbial growth. Once chilled food warms up, bacteria multiply in minutes.',
      doWhat: 'Probe incoming chilled items with a clean, sanitized needle probe thermometer or read infrared surface temp.',
      check: 'Chilled items (milk, meat, poultry, cut fruit): ≤5°C. Frozen items: −18°C (rock-hard, no thawing ice).',
      wrong: 'If chilled food arrived warm (>5°C) or ice cream is soft/melted, do NOT accept. Temperature abuse cannot be reversed.'
    },
    {
      num: 6,
      title: 'Decide: Accept, Hold, or Reject',
      subtitle: 'Make the call and record it in FoodSafe365',
      icon: ShieldCheck,
      why: 'Clear decisions protect your store, maintain inventory integrity, and create accountability.',
      doWhat: 'Select one of three choices on your receiving clipboard or phone:',
      check: 'All 5 checks passed? → ACCEPT & STOCK. Lab cert pending? → HOLD FOR REVIEW. Warm or damaged? → REJECT SHIPMENT.',
      wrong: 'Never accept questionable food hoping someone else will catch it later.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
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
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
          borderRadius: 20,
          padding: '28px',
          color: '#ffffff',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.2)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
            Lesson 1 · Dockside Receiving
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 900, margin: '10px 0 6px' }}>
            Receive Food Safely
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: '#a7f3d0', maxWidth: 640, lineHeight: 1.5 }}>
            Learn how to check food when it arrives at your store dock in 6 easy steps.
          </p>
        </div>

        {/* 6 STEP WALKTHROUGH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
          {STEPS.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 16,
                  padding: '22px 24px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(5, 150, 105, 0.12)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 16,
                    flexShrink: 0
                  }}>
                    {s.num}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Step {s.num} — {s.title}
                    </h2>
                    <div style={{ fontSize: 12.5, color: '#64748B' }}>{s.subtitle}</div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  background: '#F8FAFC',
                  borderRadius: 12,
                  padding: '14px 16px',
                  border: '1px solid #E2E8F0',
                  fontSize: 13,
                  lineHeight: 1.45
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#059669', textTransform: 'uppercase', marginBottom: 2 }}>
                      Why
                    </strong>
                    <span style={{ color: '#334155' }}>{s.why}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#0284c7', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to do
                    </strong>
                    <span style={{ color: '#334155' }}>{s.doWhat}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to check
                    </strong>
                    <span style={{ color: '#334155' }}>{s.check}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#dc2626', textTransform: 'uppercase', marginBottom: 2 }}>
                      If something is wrong
                    </strong>
                    <span style={{ color: '#334155' }}>{s.wrong}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DECISION SUMMARY PANEL */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #059669',
          borderRadius: 18,
          padding: '24px',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F2922', margin: '0 0 14px' }}>
            The 3 Receiving Decisions in FoodSafe365
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                <CheckCircle2 size={18} />
                <span>ACCEPT &amp; STOCK</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                Everything is intact, clean, cold, and within expiry date. Product is automatically added to store FIFO/FEFO stock.
              </p>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #f59e0b', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                <AlertTriangle size={18} />
                <span>HOLD FOR REVIEW</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                Awaiting supplier certificate or quality inspection. Batch is marked quarantined and locked until supervisor release.
              </p>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                <XCircle size={18} />
                <span>REJECT SHIPMENT</span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                Product is spoiled, leaking, warm, or expired. Returned immediately to vendor with an automatic corrective action logged.
              </p>
            </div>
          </div>

          {/* FINAL PROMINENT CTA */}
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <Link
              href="/grocery/receiving"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
              }}
            >
              <Truck size={18} />
              <span>TRY A RECEIVING CHECK NOW</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
