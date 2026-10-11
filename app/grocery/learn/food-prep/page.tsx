'use client';

import Link from 'next/link';
import {
  UtensilsCrossed,
  ArrowRight,
  ChevronLeft,
  Flame,
  Snowflake,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldAlert,
  Clock,
  Thermometer
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function LearnFoodPrepPage() {
  const PREP_STANDARDS = [
    {
      num: 1,
      title: 'HOT HOLDING DISPLAY (≥ 65°C)',
      classification: 'REGULATORY MANDATE & FOSTAC STANDARD',
      source: 'FSSAI Schedule 4 (General Hygiene) & FoSTaC Advance Manual Sec 3.6(d), p. 38, Sec 6.3, p. 61',
      color: '#dc2626',
      icon: Flame,
      summary: 'Cooked hot food on display in bain-maries, hot cabinets, or hot bars must be kept continuously hot at 65°C or above.',
      rules: [
        'Preheat hot-holding equipment before loading cooked food.',
        'Verify internal food temperature periodically using a clean, sanitized probe thermometer.',
        'Stir gravies, curries, and soups occasionally to prevent cold spots.',
        'Discard hot food that has dropped below 65°C for longer than 2 hours.'
      ]
    },
    {
      num: 2,
      title: '2-STAGE COOLING PROTOCOL',
      classification: 'RECOMMENDED FOSTAC EDUCATIONAL GUIDANCE',
      source: 'FoSTaC Advance Retail Manual Sec 3.6(f), p. 38 (Good Practice Recommendation)',
      color: '#0284c7',
      icon: Clock,
      summary: 'Cooked foods intended for chilled storage must pass through the danger zone as rapidly as possible.',
      rules: [
        'Stage 1: Cool hot food from 60°C down to 21°C within 2 hours.',
        'Stage 2: Cool food from 21°C down to ≤ 5°C within an additional 4 hours (total maximum 6 hours).',
        'Divide large batches into shallow pans (depth ≤ 5 cm) to accelerate heat dissipation.',
        'Use ice baths, stirring paddles, or blast chillers; never put large steaming pots directly into small display chillers.'
      ]
    },
    {
      num: 3,
      title: 'REHEATING OF COOKED FOOD (≥ 74°C)',
      classification: 'FOSTAC OPERATIONAL STANDARD',
      source: 'FoSTaC Advance Retail Manual Sec 3.6(f), p. 38 & FSS Schedule 4 Catering Requirements',
      color: '#ea580c',
      icon: RotateCcw,
      summary: 'Reheating must rapidly reach piping-hot temperatures to destroy pathogens that may have multiplied during storage.',
      rules: [
        'Reheat cooked food rapidly until the internal core temperature reaches ≥ 74°C for at least 15 seconds.',
        'Use direct heat (stoves, ovens, steamers); never use hot-holding bain-maries to reheat cold food.',
        'Strict Rule: Reheat cooked food only once. Any unconsumed reheated leftovers must be discarded.'
      ]
    },
    {
      num: 4,
      title: 'COOKING OIL REUSE & POLAR COMPOUNDS (RUCO)',
      classification: 'STATUTORY REGULATORY MANDATE',
      source: 'FSSAI Order 1-2/Standards/SP(L&C/A)/2017 (RUCO) & FoSTaC Advance Manual Sec 3.2(d), p. 32',
      color: '#d97706',
      icon: Scale,
      summary: 'Repeated heating of frying oil forms Total Polar Compounds (TPC), creating toxic trans-fatty acids and health hazards.',
      rules: [
        'Statutory Limit: Total Polar Compounds (TPC) in cooking oil must not exceed 25%.',
        'Discard oil that turns dark, viscous, sticky, foams excessively, or smokes at normal frying temperatures.',
        'Filter oil daily to remove charred food debris and sediment.',
        'Prohibition: Never top up exhausted or degraded oil with fresh oil.'
      ]
    },
    {
      num: 5,
      title: 'SAFE THAWING & DEFROSTING',
      classification: 'REGULATORY REQUIREMENT & FOSTAC STANDARD',
      source: 'FSSAI Schedule 4 Part II & FoSTaC Advance Retail Manual Sec 3.6(i), pp. 38–39',
      color: '#0891b2',
      icon: Snowflake,
      summary: 'Thawing at ambient room temperatures allows surface bacteria to multiply rapidly while the interior remains frozen.',
      rules: [
        'Approved Method 1: Inside a chiller at ≤ 4°C (recommended; place in drip-proof pan on the lowest shelf).',
        'Approved Method 2: Under continuous running potable water at ≤ 21°C for under 2 hours.',
        'Approved Method 3: In a microwave oven, only if the food is cooked immediately thereafter.',
        'Strict Rule: Never refreeze thawed or defrosted foods.'
      ]
    },
    {
      num: 6,
      title: 'SLICING MACHINE & PREPARATION HYGIENE',
      classification: 'FOSTAC OPERATIONAL STANDARD',
      source: 'FoSTaC Advance Retail Manual Sec 3.2(b), p. 33',
      color: '#059669',
      icon: Sparkles,
      summary: 'Commercial meat slicers, cheese cutters, and prep boards collect meat fats and juice residues that breed Listeria.',
      rules: [
        'Disassemble and clean slicer blades, carriage, and guards between raw and ready-to-eat meats.',
        'Sanitize slicers and knives at least every 4 hours during continuous operation.',
        'Use color-coded cutting boards (e.g. Red for raw meat, Green for vegetables, Yellow for cooked meat).',
        'Wash hands and change disposable food-handling gloves between tasks.'
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #F7F8F5)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />

      <main className="container" style={{ maxWidth: 960, paddingTop: 32, paddingBottom: 64 }}>
        {/* Navigation Breadcrumb */}
        <Link
          href="/food-safety-why"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--muted, #64748B)',
            textDecoration: 'none',
            marginBottom: 20
          }}
        >
          <ChevronLeft size={16} /> FoSTaC Learning Hub
        </Link>

        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #78350f 0%, #9a3412 60%, #c2410c 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 20,
          boxShadow: '0 4px 16px rgba(154, 52, 18, 0.2)'
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
            <UtensilsCrossed size={13} />
            <span>LEARNING MODULE 6</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            In-Store Food Preparation &amp; Deli Operations
          </h1>
          <p style={{ margin: 0, fontSize: 15.5, color: '#ffedd5', maxWidth: 660, lineHeight: 1.5, fontWeight: 500 }}>
            “In-store food preparation requires disciplined temperature control, strict oil quality monitoring, and rigid physical segregation to prevent foodborne illness.”
          </p>
        </div>

        {/* ACTIVITY-SCOPED CALLOUT */}
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 28,
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}>
          <Info size={22} style={{ color: '#d97706', flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.45 }}>
            <strong style={{ display: 'block', color: '#78350f', marginBottom: 2 }}>
              Activity-Scoped Lesson:
            </strong>
            This module applies specifically to retail establishments undertaking <strong>in-store cooking, hot food display, bakery counters, live meat/fish slicing, or fresh juice/salad preparation</strong>. Purely pre-packaged dry grocery shops and kirana stores may review this for information or skip directly to store checks.
          </div>
        </div>

        {/* STANDARDS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          {PREP_STANDARDS.map(std => {
            const Icon = std.icon;
            const isStatutory = std.classification.includes('MANDATE') || std.classification.includes('REQUIREMENT');

            return (
              <div
                key={std.num}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 18,
                  padding: '24px 26px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${std.color}14`,
                    color: std.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: isStatutory ? 'rgba(220, 38, 38, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                        color: isStatutory ? '#dc2626' : '#0284c7',
                        letterSpacing: '0.04em'
                      }}>
                        {std.classification}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '2px 0 0' }}>
                      {std.title}
                    </h3>
                    <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                      Authoritative Source: {std.source}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: '0 0 14px' }}>
                  {std.summary}
                </p>

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                    Standard Operating Rules:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
                    {std.rules.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* STATUTORY & EDUCATIONAL DISCLAIMER */}
        <div style={{
          background: '#F8FAFC',
          border: '1.5px solid #CBD5E1',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 32,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start'
        }}>
          <Info size={22} style={{ color: '#64748B', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: 4 }}>
              Educational Guidance Notice &amp; Regulatory Context
            </strong>
            This module provides operational food safety educational material derived from the FSSAI FoSTaC Advance Retail &amp; Distribution Manual and Schedule 4 of the Food Safety and Standards (Licensing &amp; Registration of Food Businesses) Regulations, 2011. Numerical limits reflect statutory mandates (such as RUCO oil TPC limits and hot holding display thresholds) or authoritative FoSTaC guidance. Reading this material provides operational due-diligence assistance for frontline grocery teams and does not confer official FSSAI certification or prove statutory compliance.
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <Link
            href="/grocery/learn/hygiene-pest"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#f1f5f9',
              color: '#334155',
              padding: '12px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <ChevronLeft size={16} />
            <span>Prev: Hygiene &amp; Pest</span>
          </Link>

          <Link
            href="/grocery/daily-check"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span>Proceed to Daily Checks</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
