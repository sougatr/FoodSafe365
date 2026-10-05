'use client';

import Link from 'next/link';
import {
  Thermometer,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  RotateCw,
  Clock,
  Sparkles
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function LearnTemperaturePage() {
  const STATUS_GUIDE = [
    {
      status: 'GREEN',
      color: '#059669',
      border: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
      icon: CheckCircle2,
      meaning: 'Within Configured Safe Range',
      desc: 'The equipment is functioning perfectly. Food remains safe and fully within cold chain standards.',
      action: 'No action required. Log the reading and continue service.'
    },
    {
      status: 'AMBER',
      color: '#d97706',
      border: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)',
      icon: AlertTriangle,
      meaning: 'Attention Required (Warning Band)',
      desc: 'Temperature is drifting toward the upper safe boundary (e.g. 4.5°C in a 5°C chiller).',
      action: 'Check if the chiller door was left open during restocking. Inspect door rubber gasket and re-check in 30 minutes.'
    },
    {
      status: 'RED',
      color: '#dc2626',
      border: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      icon: XCircle,
      meaning: 'Corrective Action Required (Critical Breach)',
      desc: 'Temperature has exceeded the safe ceiling (e.g. 7.5°C in a dairy chiller or -12°C in a freezer).',
      action: 'FoodSafe365 immediately raises an alert. Move vulnerable stock to backup cold storage and call refrigeration service.'
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
          background: 'linear-gradient(135deg, #9a3412 0%, #ea580c 100%)',
          borderRadius: 20,
          padding: '28px',
          color: '#ffffff',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.2)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase' }}>
            Lesson 3 · Temperature Control
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 900, margin: '10px 0 6px' }}>
            Temperature Control
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: '#fed7aa', maxWidth: 640, lineHeight: 1.5 }}>
            Learn how to check chillers and freezers, what green, amber, and red mean, and what to do if temperatures drift.
          </p>
        </div>

        {/* WHY TEMPERATURE MATTERS */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 18,
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>
            Why Temperature Matters
          </h2>
          <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.55, margin: '0 0 16px' }}>
            Between <strong>5°C and 60°C</strong> is known as the <em>Temperature Danger Zone</em>. In this zone, harmful bacteria such as <em>Salmonella</em> and <em>Listeria</em> can double in count every 20 minutes. Maintaining constant cold keeps bacteria dormant and guarantees food stays safe for customers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>
                CHILLED FOODS
              </div>
              <strong style={{ fontSize: 18, color: '#065F46', display: 'block', marginBottom: 4 }}>
                ≤ 5°C
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                Use applicable cold-storage requirements; FoodSafe365 displays <strong>≤5°C</strong> as a general operational reference where appropriate.
              </p>
            </div>

            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: 4 }}>
                FROZEN FOODS
              </div>
              <strong style={{ fontSize: 18, color: '#1E40AF', display: 'block', marginBottom: 4 }}>
                −18°C or below
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                For food intended to remain frozen, use <strong>−18°C or below</strong> as the general operational reference.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            fontSize: 12.5,
            color: '#64748B'
          }}>
            ℹ️ <strong>Important:</strong> Not every food product has the exact same temperature requirement. Always <strong>follow product-specific requirements and manufacturer storage instructions</strong> printed on packaging labels.
          </div>
        </div>

        {/* 4-STEP TEMPERATURE LOOP: CHECK -> RECORD -> COMPARE -> ACT */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 18,
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
            The 4-Step Routine: CHECK → RECORD → COMPARE → ACT
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', marginBottom: 4 }}>
                STEP 1
              </div>
              <strong style={{ fontSize: 15, color: '#0F172A', display: 'block', marginBottom: 4 }}>
                CHECK
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                Look at the external digital thermostat on the chiller, or insert a calibrated needle probe into the test container.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: 4 }}>
                STEP 2
              </div>
              <strong style={{ fontSize: 15, color: '#0F172A', display: 'block', marginBottom: 4 }}>
                RECORD
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                Open FoodSafe365 on your mobile phone or tablet and enter the reading in 5 seconds.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 4 }}>
                STEP 3
              </div>
              <strong style={{ fontSize: 15, color: '#0F172A', display: 'block', marginBottom: 4 }}>
                COMPARE
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                The app automatically compares the reading against the equipment limits and shows GREEN, AMBER, or RED.
              </p>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>
                STEP 4
              </div>
              <strong style={{ fontSize: 15, color: '#0F172A', display: 'block', marginBottom: 4 }}>
                ACT
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                If RED appears, an action ticket is instantly created to safeguard food and dispatch refrigeration support.
              </p>
            </div>
          </div>
        </div>

        {/* STATUS COLORS EXPLAINED */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
            What the Status Colors Mean
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STATUS_GUIDE.map(sg => {
              const Icon = sg.icon;
              return (
                <div
                  key={sg.status}
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${sg.border}`,
                    borderRadius: 14,
                    padding: '18px 22px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: sg.bg, color: sg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 15, color: sg.color }}>
                        {sg.status}: {sg.meaning}
                      </strong>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                    {sg.desc}
                  </p>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                    👉 Action: {sg.action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROMINENT CTA */}
        <div style={{
          textAlign: 'center',
          background: '#ffffff',
          border: '1.5px solid #ea580c',
          borderRadius: 18,
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.1)'
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            Ready to log readings for your store chillers?
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 18px' }}>
            Record temperature logs for walk-ins, display chillers, and deep freezers right now.
          </p>
          <Link
            href="/grocery/temperature"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              padding: '14px 32px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
            }}
          >
            <Thermometer size={18} />
            <span>LOG TODAY'S TEMPERATURE</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}
