'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function AboutPage() {
  return (
    <main>
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 840, paddingTop: 40, paddingBottom: 60 }}>
        {/* Page Introduction */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="pill good" style={{ marginBottom: 12 }}>MISSION &amp; PURPOSE</span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: '12px 0 16px' }}>
            About FoodSafe365
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted, #475569)', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            A digital food-safety ecosystem connecting food businesses, service providers, and customers.
          </p>
        </div>

        {/* Core Utility Grid */}
        <div className="grid grid3" style={{ gap: 20, marginBottom: 36 }}>
          {/* Card 1: Restaurants & Food Businesses */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏪</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                For Restaurants &amp; Food Businesses
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0F2922' }}>
                Run food safety digitally.
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted, #475569)', lineHeight: 1.5, margin: '0 0 10px' }}>
                Complete daily checks, monitor critical controls, manage findings and corrective actions, maintain records, and stay inspection-ready.
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                Built for restaurants, hotels, cafés, bakeries, cloud kitchens, catering businesses, grocery stores, supermarkets and other food businesses.
              </p>
            </div>
            <div style={{ marginTop: 18 }}>
              <Link href="/home" style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Explore Food Business Dashboard →
              </Link>
            </div>
          </div>

          {/* Card 2: Customers & Shoppers */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🛒</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                For Customers &amp; Shoppers
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0F2922' }}>
                Make your food-safety experience count.
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted, #475569)', lineHeight: 1.5, margin: '0 0 10px' }}>
                Find restaurants, grocery stores and other food businesses, scan a FoodSafe365 QR code, rate your food-safety experience and share feedback.
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                Your feedback helps food businesses identify areas that need attention and improve their food-safety practices.
              </p>
            </div>
            <div style={{ marginTop: 18 }}>
              <Link href="/diner" style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Rate a Food Business →
              </Link>
            </div>
          </div>

          {/* Card 3: Food-Safety Service Providers */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🛠️</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                For Food-Safety Service Providers
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0F2922' }}>
                Connect with businesses that need you.
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted, #475569)', lineHeight: 1.5, margin: '0 0 10px' }}>
                Connect with food businesses that need professional food-safety and operational support.
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                Pest control, refrigeration and cold-chain services, laboratory testing, cleaning and sanitation, waste management, food-safety training, equipment maintenance and other specialist services.
              </p>
            </div>
            <div style={{ marginTop: 18 }}>
              <Link href="/providers" style={{ fontSize: 13, fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Join the Service Network →
              </Link>
            </div>
          </div>
        </div>

        {/* Connected Ecosystem Hierarchy */}
        <div className="card" style={{ padding: 26, marginBottom: 32, background: '#F8FAF7', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            ECOSYSTEM ARCHITECTURE
          </span>
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 10px', color: '#0F2922' }}>
            One Operating System Across the Food Spectrum
          </h2>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.55, margin: '0 0 16px' }}>
            FoodSafe365 structures food-safety controls around the central operations of the food business, while connecting customers and service providers in an accountable ecosystem:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
            <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F2922', marginBottom: 4 }}>🏢 Food Businesses</div>
              <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.45 }}>
                Restaurants · Hotels · Cafés · Bakeries · Cloud Kitchens · Catering · Grocery Stores · Supermarkets · Food Retailers
              </div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F2922', marginBottom: 4 }}>🛒 Customers &amp; Shoppers</div>
              <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.45 }}>
                Direct table and store QR feedback, transparency verification, and 5-point customer food-safety ratings.
              </div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F2922', marginBottom: 4 }}>🛠️ Service Providers</div>
              <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.45 }}>
                Cold-chain technicians, pest control specialists, testing laboratories, sanitization crews, and hygiene trainers.
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Reality Section */}
        <div className="card" style={{ padding: 32, marginBottom: 40, borderLeft: '4px solid #059669' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>The Regulatory Reality</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text, #334155)', margin: '0 0 16px' }}>
            FSSAI and state FDA inspections do not audit culinary creativity or store branding. Food establishments face suspension notices over preventable operational breakdowns: warm refrigeration operating above 5°C, unverified cooking oil, missing staff medical fitness certificates (Form 1A), hygiene lapses, and unchecked pest activity.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text, #334155)', margin: 0 }}>
            FoodSafe365 replaces fragmented paper-based processes with a digital food-safety system that helps food businesses manage risks, stay inspection-ready, and build customer trust.
          </p>
        </div>

        {/* Direct Action Hub */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/home" className="btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Explore Food Business Dashboard <ArrowRight size={16} />
          </Link>
          <Link href="/diner" className="btn secondary">
            Rate a Food Business
          </Link>
          <Link href="/providers" className="btn secondary">
            Join the Service Network
          </Link>
        </div>
      </div>
    </main>
  );
}
