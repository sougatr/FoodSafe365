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
  ClipboardCheck,
  ChevronLeft
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function GroceryLearnPage() {
  const MODULES = [
    {
      id: 'receiving',
      title: '1. Receive Food Safely',
      tag: 'LEARNING MODULE 1',
      color: '#059669',
      bgLight: 'rgba(5, 150, 105, 0.08)',
      icon: Truck,
      href: '/grocery/learn/receiving',
      quote: '“Every delivery is an opportunity to prevent unsafe food from entering your store.”',
      summary: 'Learn how to check products, intact packaging, date markings, temperatures, condition, and make accept/reject decisions.',
      steps: ['1. Check product', '2. Check packaging', '3. Check dates', '4. Check temperature', '5. Check condition', '6. Accept or set aside'],
      cta: 'Open Lesson: Receive Food Safely'
    },
    {
      id: 'storage',
      title: '2. Store Food Safely',
      tag: 'LEARNING MODULE 2',
      color: '#0284c7',
      bgLight: 'rgba(2, 132, 199, 0.08)',
      icon: Layers,
      href: '/grocery/learn/storage',
      quote: '“Keep chilled cold, frozen rock-solid, and raw food separated from ready-to-eat.”',
      summary: 'Learn chilled, frozen, and dry storage environments, separation of raw meats from ready-to-eat foods, and simple FIFO/FEFO rotation.',
      steps: ['Chilled storage', 'Frozen storage', 'Dry ambient storage', 'Raw vs ready separation', 'FIFO (First In First Out)', 'FEFO (First Expiry First Out)'],
      cta: 'Open Lesson: Store Food Safely'
    },
    {
      id: 'temperature',
      title: '3. Control Temperature',
      tag: 'LEARNING MODULE 3',
      color: '#ea580c',
      bgLight: 'rgba(234, 88, 12, 0.08)',
      icon: Thermometer,
      href: '/grocery/learn/temperature',
      quote: '“Temperature control helps keep food safe and maintain quality.”',
      summary: 'Understand the three daily concepts: CHECK, RECORD, ACT, followed by the corrective sequence: CHECK → ACT → RECORD → VERIFY.',
      steps: ['Measure temperature', 'Record results twice daily', 'Act if out of spec', 'Check → Act → Record → Verify sequence'],
      cta: 'Open Lesson: Control Temperature'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* Navigation Breadcrumb */}
        <Link
          href="/grocery"
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
          <ChevronLeft size={16} /> Back to Grocery Home
        </Link>

        {/* Hero Header with Journey Flow */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(6, 78, 59, 0.2)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '3px 12px',
            borderRadius: 999,
            fontSize: 11.5,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 10
          }}>
            <BookOpen size={13} />
            <span>LEARN BEFORE YOU CHECK</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Learn Food Safety
          </h1>
          <p style={{ margin: '0 0 16px', fontSize: 15.5, color: '#d1fae5', maxWidth: 640, lineHeight: 1.5 }}>
            FoodSafe365 teaches your grocery store team what to do and why before asking you to complete daily checks.
          </p>

          {/* Core Journey Flow Bar */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 12,
            padding: '10px 16px',
            fontSize: 12.5,
            fontWeight: 700,
            color: '#a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ color: '#ffffff', fontWeight: 900 }}>JOURNEY:</span>
            <span>LEARN</span>
            <span>→</span>
            <span>RECEIVE</span>
            <span>→</span>
            <span>STORE</span>
            <span>→</span>
            <span>TEMPERATURE</span>
            <span>→</span>
            <span>DAILY CHECK</span>
            <span>→</span>
            <span>ACT</span>
            <span>→</span>
            <span>VERIFY</span>
          </div>
        </div>

        {/* 3 Core Lessons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          {MODULES.map(m => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 18,
                  padding: '24px 28px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: m.bgLight,
                      color: m.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: m.color, letterSpacing: '0.04em' }}>
                        {m.tag}
                      </span>
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '2px 0 0' }}>
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
                    <span>{m.cta}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>

                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: m.color,
                  marginBottom: 10,
                  fontStyle: 'italic'
                }}>
                  {m.quote}
                </div>

                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 14px' }}>
                  {m.summary}
                </p>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  background: '#F8FAFC',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748B'
                }}>
                  {m.steps.map((st, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: m.color }}>✓</span> {st}
                      {i < m.steps.length - 1 && <span style={{ color: '#CBD5E1', marginLeft: 4 }}>•</span>}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* READY FOR DAILY CHECK CTA */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #059669',
          borderRadius: 20,
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
            Ready to Start Today's Store Check?
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', maxWidth: 520, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Put your learning into action with the 22 routine checks. Takes about 5 minutes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/grocery/daily-check"
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
              <ClipboardCheck size={18} />
              <span>START DAILY CHECK</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/grocery"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '14px 22px',
                borderRadius: 12,
                fontSize: 14.5,
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
