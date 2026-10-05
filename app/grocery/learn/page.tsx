'use client';

import Link from 'next/link';
import {
  Truck,
  Layers,
  Thermometer,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function GroceryLearnPage() {
  const MODULES = [
    {
      id: 'receiving',
      title: 'A. Receive Food Safely',
      tag: 'STEP 1 · INCOMING INSPECTION',
      color: '#059669',
      bgLight: 'rgba(5, 150, 105, 0.08)',
      icon: Truck,
      href: '/grocery/learn/receiving',
      cta: 'Start Lesson: Receiving Food',
      why: 'Prevent spoiled, contaminated, or warm foods from ever entering your store and reaching customers.',
      whatToDo: 'Inspect delivery vehicle condition, product packaging, seals, dates, and cold temperature before signing the delivery challan.',
      whatToCheck: 'Check 6 points: Approved supplier, clean delivery vehicle, intact packaging, visible date markings, core temperature, and freshness.',
      whatIfWrong: 'Reject damaged or warm items immediately, write the reason on the delivery invoice, and record a rejection entry in FoodSafe365.'
    },
    {
      id: 'storage',
      title: 'B. Store Food Safely',
      tag: 'STEP 2 · STORAGE & SEPARATION',
      color: '#0284c7',
      bgLight: 'rgba(2, 132, 199, 0.08)',
      icon: Layers,
      href: '/grocery/learn/storage',
      cta: 'Start Lesson: Safe Storage',
      why: 'Keep food fresh and stop raw meat juices, allergens, and chemicals from dripping onto ready-to-eat items.',
      whatToDo: 'Store raw meat on lower shelves, keep all food off the floor (at least 15 cm), lock chemicals in a dedicated cabinet, and use FEFO.',
      whatToCheck: 'Check that raw meat is segregated, shelves are not overloaded, cartons are off the floor, and oldest batches are at the front.',
      whatIfWrong: 'Immediately move misplaced raw items below ready-to-eat foods; discard any contaminated open products into the red quarantine bin.'
    },
    {
      id: 'temperature',
      title: 'C. Control Temperature',
      tag: 'STEP 3 · CHILLERS & FREEZERS',
      color: '#ea580c',
      bgLight: 'rgba(234, 88, 12, 0.08)',
      icon: Thermometer,
      href: '/grocery/learn/temperature',
      cta: 'Start Lesson: Temperature Control',
      why: 'Bacteria multiply rapidly between 5°C and 60°C. Cold temperatures keep perishable food safe and extend shelf life.',
      whatToDo: 'Read and log chiller and freezer thermometers at least once every morning and evening. Ensure doors stay closed.',
      whatToCheck: 'Chilled foods general reference: ≤5°C. Frozen foods: −18°C or below. Follow manufacturer product labels for specifics.',
      whatIfWrong: 'If red breach occurs (>5°C in chiller), check door seals and power, move sensitive products to backup cold storage, and call refrigeration service.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 1050, margin: '0 auto', padding: '28px 20px 48px', width: '100%' }}>
        {/* Title */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(5, 150, 105, 0.1)',
            color: '#059669',
            padding: '4px 14px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8
          }}>
            <BookOpen size={14} />
            <span>FRONTLINE LEARNING</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
            Learn Food Safety
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', maxWidth: 620, margin: '0 auto', lineHeight: 1.5 }}>
            Simple, practical food-safety practices for your grocery store team. No complicated jargon.
          </p>
        </div>

        {/* 3 CORE LESSON CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {MODULES.map(m => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 20,
                  padding: '28px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: m.bgLight,
                      color: m.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: m.color, letterSpacing: '0.05em' }}>
                        {m.tag}
                      </span>
                      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '2px 0 0' }}>
                        {m.title}
                      </h2>
                    </div>
                  </div>

                  <Link
                    href={m.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: m.color,
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: 10,
                      fontSize: 13.5,
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span>Open Lesson</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* 4-Part Frontline Structure */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                  background: '#F8FAFC',
                  borderRadius: 14,
                  padding: '18px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      WHY THIS MATTERS
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                      {m.why}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      WHAT TO DO
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                      {m.whatToDo}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      WHAT TO CHECK
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                      {m.whatToCheck}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      IF SOMETHING IS WRONG
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                      {m.whatIfWrong}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM SUMMARY CARD */}
        <div style={{
          marginTop: 36,
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '20px 24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            Ready to test your knowledge on shift?
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 16px' }}>
            Put these practices into action during today's store routine.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/grocery/daily-check"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              Start Daily Check →
            </Link>
            <Link
              href="/grocery"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
