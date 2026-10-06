'use client';

import Link from 'next/link';
import {
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Calendar,
  Thermometer,
  PackageCheck,
  ShieldCheck,
  ClipboardList,
  Eye,
  Check
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function LearnReceivingPage() {
  const STEPS = [
    {
      num: 1,
      title: 'CHECK THE PRODUCT',
      question: 'Is it the product you ordered?',
      icon: ClipboardList,
      color: '#059669',
      why: 'Prevents incorrect stock, unexpected allergens, or unapproved suppliers from entering your inventory.',
      whatToDo: 'Compare the delivery invoice / challan with the actual crates. Verify the product name, brand, variety, and count.',
      check: 'Order invoice matches item name, brand, unit size, and quantity.',
      ifConcern: 'If items were not ordered or come from an unknown vendor, pause unloading and notify the store manager.'
    },
    {
      num: 2,
      title: 'CHECK THE PACKAGING',
      question: 'Is it clean, intact and undamaged?',
      icon: PackageCheck,
      color: '#0284c7',
      why: 'Torn bags, dented cans, broken tamper seals, or crushed cartons let bacteria, dust, and insects enter the food.',
      whatToDo: 'Inspect cartons, pouches, and cans before moving them into your store.',
      check: 'Sealed pouches without leaks, clean cartons free of water stains, cans without dents or swelling.',
      ifConcern: 'Do not accept punctured, crushed, leaking, or compromised packages.'
    },
    {
      num: 3,
      title: 'CHECK THE DATE',
      question: 'Check use-by/expiry/best-before as applicable.',
      icon: Calendar,
      color: '#7c3aed',
      why: 'Selling near-expiry or expired food risks customer health and violates food safety rules.',
      whatToDo: 'Check the date stamp on outer cartons and retail packs. Verify adequate remaining shelf life.',
      check: 'Valid use-by, expiry, or best-before date is clearly printed and legible.',
      ifConcern: 'Reject deliveries with passed expiry dates or faded, unreadable date stamps.'
    },
    {
      num: 4,
      title: 'CHECK TEMPERATURE',
      question: 'Check temperature where temperature control is required.',
      icon: Thermometer,
      color: '#ea580c',
      why: 'Warm temperatures allow harmful bacteria to multiply quickly in chilled or frozen foods.',
      whatToDo: 'For temperature-controlled items, check the vehicle temperature or probe sample products.',
      check: 'Check the applicable product/SOP temperature requirement.',
      ifConcern: 'If chilled food arrived warm or frozen items show soft spots, do not stock them. Temperature abuse cannot be reversed.'
    },
    {
      num: 5,
      title: 'CHECK CONDITION',
      question: 'Look for signs of spoilage, contamination or thawing where relevant.',
      icon: Eye,
      color: '#0891b2',
      why: 'Physical and sensory checks catch contamination that thermometers or invoices might miss.',
      whatToDo: 'Look for signs of moisture damage, unusual odors, discoloration, mold, insect activity, or ice crystal refreezing.',
      check: 'Fresh appearance, normal odor, clean transport container, no chemical or petroleum smells.',
      ifConcern: 'Refuse unloading if items smell abnormal, look off-color, or have rested near cleaning chemicals.'
    },
    {
      num: 6,
      title: 'ACCEPT OR SET ASIDE',
      question: 'Accept when satisfactory. Set aside/report when there is a concern.',
      icon: ShieldCheck,
      color: '#059669',
      why: 'Clear decisions at the receiving dock ensure that only safe, high-quality food enters your store.',
      whatToDo: 'Make an immediate decision and record the entry in FoodSafe365 dockside receiving.',
      check: 'All criteria passed → ACCEPT & STOCK. Question or concern → SET ASIDE / REPORT / REJECT.',
      ifConcern: 'Never accept questionable food hoping someone else will catch it later.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
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
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.2)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            LEARNING MODULE 1
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 900, margin: '10px 0 8px', letterSpacing: '-0.02em' }}>
            RECEIVE FOOD SAFELY
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: '#d1fae5', maxWidth: 640, lineHeight: 1.5, fontWeight: 600 }}>
            “Every delivery is an opportunity to prevent unsafe food from entering your store.”
          </p>
        </div>

        {/* The 6 Steps Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
          {STEPS.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 18,
                  padding: '22px 24px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${s.color}15`,
                    color: s.color,
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
                    <div style={{ fontSize: 12, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      STEP {s.num}
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '2px 0 2px' }}>
                      {s.title}
                    </h2>
                    <div style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>
                      {s.question}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                      Why this matters
                    </strong>
                    <span style={{ color: '#334155' }}>{s.why}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#0284c7', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to do
                    </strong>
                    <span style={{ color: '#334155' }}>{s.whatToDo}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 2 }}>
                      What to check
                    </strong>
                    <span style={{ color: '#334155' }}>{s.check}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 11, color: '#dc2626', textTransform: 'uppercase', marginBottom: 2 }}>
                      If there is a concern
                    </strong>
                    <span style={{ color: '#334155' }}>{s.ifConcern}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DECISION SUMMARY & ACTION CTA */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #059669',
          borderRadius: 20,
          padding: '28px',
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto 20px' }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
              Put Receiving Knowledge into Practice
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Use FoodSafe365 dockside inspection to record vendor deliveries, temperatures, and stock decisions in seconds.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
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
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
              }}
            >
              <Truck size={18} />
              <span>TRY A RECEIVING CHECK</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/grocery/learn/storage"
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
              <span>Next Lesson: Store Food Safely</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
