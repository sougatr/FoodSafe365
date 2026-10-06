'use client';

import Link from 'next/link';
import {
  Thermometer,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  ClipboardList,
  Wrench,
  ShieldCheck,
  Check
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

export default function LearnTemperaturePage() {
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
          background: 'linear-gradient(135deg, #9a3412 0%, #ea580c 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.2)'
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            LEARNING MODULE 3
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 900, margin: '10px 0 8px', letterSpacing: '-0.02em' }}>
            CONTROL TEMPERATURE
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: '#ffedd5', maxWidth: 640, lineHeight: 1.5, fontWeight: 600 }}>
            “Temperature control helps keep food safe and maintain quality.”
          </p>
        </div>

        {/* 1. THREE SIMPLE CONCEPTS: CHECK -> RECORD -> ACT */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #FED7AA',
          borderRadius: 20,
          padding: '26px 28px',
          marginBottom: 32,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            CORE PRINCIPLE
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
            Three Simple Daily Concepts
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {/* CONCEPT 1: CHECK */}
            <div style={{ background: '#FFF7ED', border: '1.5px solid #FDBA74', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15 }}>
                  1
                </div>
                <strong style={{ fontSize: 17, color: '#9a3412' }}>
                  CHECK
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#7c2d12', lineHeight: 1.5, fontWeight: 600 }}>
                Measure the temperature.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                Read the external digital gauge or insert a calibrated clean probe thermometer.
              </p>
            </div>

            {/* CONCEPT 2: RECORD */}
            <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15 }}>
                  2
                </div>
                <strong style={{ fontSize: 17, color: '#0369a1' }}>
                  RECORD
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#0c4a6e', lineHeight: 1.5, fontWeight: 600 }}>
                Record the result.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                Log the number in FoodSafe365 twice daily to build a clear proof-of-safety record.
              </p>
            </div>

            {/* CONCEPT 3: ACT */}
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15 }}>
                  3
                </div>
                <strong style={{ fontSize: 17, color: '#991b1b' }}>
                  ACT
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d', lineHeight: 1.5, fontWeight: 600 }}>
                If outside applicable requirement, take corrective action.
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#64748B', lineHeight: 1.4 }}>
                Check door seals, adjust thermostat, move stock to backup chiller, or call technician.
              </p>
            </div>
          </div>
        </div>

        {/* 2. VISUAL TEMPERATURE EXAMPLES (WITHOUT UNIVERSAL TEMPERATURE FALLACY) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E2E8F0',
          borderRadius: 20,
          padding: '26px 28px',
          marginBottom: 32,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            TEMPERATURE GUIDANCE
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
            Visual Temperature Examples
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, margin: '0 0 18px' }}>
            Different foods have different storage needs. Always verify the specific manufacturer label or store SOP requirement.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* FROZEN */}
            <div style={{
              background: '#EEF2FF',
              border: '1.5px solid #C7D2FE',
              borderRadius: 16,
              padding: '20px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                FROZEN FOODS
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#312e81', margin: '4px 0 6px' }}>
                Generally −18°C or below
              </div>
              <div style={{ fontSize: 13, color: '#4338ca', fontWeight: 600, marginBottom: 8 }}>
                Where applicable
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Keeps ice cream, frozen veggies, and frozen meats rock-solid. Prevents ice melting and bacterial awakening.
              </p>
            </div>

            {/* CHILLED */}
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: 16,
              padding: '20px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CHILLED FOODS
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#064e3b', margin: '4px 0 6px' }}>
                Product / SOP Requirement
              </div>
              <div style={{ fontSize: 13, color: '#047857', fontWeight: 600, marginBottom: 8 }}>
                Follow applicable specifications
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                Perishables (dairy, paneer, cut salads, fresh meats) need continuous cold holding. Check specific product packaging guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* 3. WHAT SHOULD YOU DO IF THE TEMPERATURE IS WRONG? (CHECK -> ACT -> RECORD -> VERIFY) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #ea580c',
          borderRadius: 20,
          padding: '26px 28px',
          marginBottom: 32,
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                What should you do if the temperature is wrong?
              </h2>
              <span style={{ fontSize: 13, color: '#64748B' }}>Follow the 4-step corrective action sequence</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            marginTop: 18
          }}>
            {/* Step A: CHECK */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#c2410c', textTransform: 'uppercase' }}>
                STEP 1
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#9a3412', margin: '4px 0 4px' }}>
                CHECK
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#7c2d12', lineHeight: 1.4 }}>
                Identify the deviation. Check if door was left open during restocking or if power failed.
              </p>
            </div>

            {/* Step B: ACT */}
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#b91c1c', textTransform: 'uppercase' }}>
                STEP 2
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#991b1b', margin: '4px 0 4px' }}>
                ACT
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#7f1d1d', lineHeight: 1.4 }}>
                Close door securely, check power plug, move vulnerable stock to backup chiller, or call technician.
              </p>
            </div>

            {/* Step C: RECORD */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#0284c7', textTransform: 'uppercase' }}>
                STEP 3
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0369a1', margin: '4px 0 4px' }}>
                RECORD
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#0c4a6e', lineHeight: 1.4 }}>
                Log the actual temperature reading and notes in FoodSafe365 temperature log immediately.
              </p>
            </div>

            {/* Step D: VERIFY */}
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#059669', textTransform: 'uppercase' }}>
                STEP 4
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#065f46', margin: '4px 0 4px' }}>
                VERIFY
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#064e3b', lineHeight: 1.4 }}>
                Re-check in 30 minutes. Confirm reading returned to compliant range before closing the ticket.
              </p>
            </div>
          </div>
        </div>

        {/* 4. PROMINENT CTA */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #ea580c',
          borderRadius: 20,
          padding: '28px',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 560, margin: '0 auto 20px' }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
              Ready to Log Your Store Chillers?
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Record digital thermostat or needle probe readings for display chillers and freezers now.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
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
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
              }}
            >
              <Thermometer size={18} />
              <span>CHECK TEMPERATURE</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/grocery/daily-check"
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
              <span>Go to Daily Food Safety Check</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
