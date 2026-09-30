'use client';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, Building2, Users, Wrench } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function AboutPage() {
  return (
    <main>
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 840, paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="pill good" style={{ marginBottom: 12 }}>MISSION &amp; PURPOSE</span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: '12px 0 16px' }}>
            About FoodSafe365
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted, #475569)', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            The operational food hygiene and FSSAI compliance operating system connecting kitchens, accredited service providers, and informed dining guests.
          </p>
        </div>

        {/* Core Utility Grid */}
        <div className="grid grid3" style={{ gap: 20, marginBottom: 40 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🏪</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>For Restaurants</h3>
            <p style={{ fontSize: 14, color: 'var(--muted, #475569)', lineHeight: 1.5, margin: 0 }}>
              15-minute daily digital checks, real-time danger zone alerts, cooking oil TPM tracking, and daily verified badges for customers.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🍽️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>For the General Public</h3>
            <p style={{ fontSize: 14, color: 'var(--muted, #475569)', lineHeight: 1.5, margin: 0 }}>
              Instant QR code scan to review today&apos;s kitchen verification status and submit a 5-point food safety rating with feedback.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🛠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>For Service Providers</h3>
            <p style={{ fontSize: 14, color: 'var(--muted, #475569)', lineHeight: 1.5, margin: 0 }}>
              Direct marketplace connection to food businesses needing NABL medical tests, pest control, 24/7 refrigeration repair, and FoSTaC training.
            </p>
          </div>
        </div>

        {/* Why We Built It */}
        <div className="card" style={{ padding: 32, marginBottom: 40, borderLeft: '4px solid #059669' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>The Regulatory Reality</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text, #334155)', margin: '0 0 16px' }}>
            FSSAI and state FDA inspections do not audit culinary creativity. Food establishments face suspension notices over preventable back-of-house breakdowns: warm refrigerators operating above 5°C, unverified cooking oil, missing staff medical fitness certificates (Form 1A), and unchecked pest activity.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text, #334155)', margin: 0 }}>
            FoodSafe365 replaces lost clipboards with an automated digital system that protects public health, keeps kitchens inspection-ready, and builds customer trust.
          </p>
        </div>

        {/* Direct Action Hub */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/home" className="btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Launch Kitchen Dashboard <ArrowRight size={16} />
          </Link>
          <Link href="/diner" className="btn secondary">
            Public Diner Rating
          </Link>
          <Link href="/providers" className="btn secondary">
            Services Marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
