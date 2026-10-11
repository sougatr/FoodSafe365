'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Layers,
  Thermometer,
  ShieldAlert,
  Sparkles,
  UtensilsCrossed,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ChevronLeft,
  Info,
  Filter,
  ShieldCheck,
  Zap,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function FoSTaCLearningHubPage() {
  const [filter, setFilter] = useState<'all' | 'core' | 'prep'>('all');

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
      summary: 'Learn how to check products, clean vehicles, intact packaging, date markings, temperatures, condition, and make accept/reject decisions.',
      steps: ['1. Check product', '2. Clean delivery vehicle', '3. Check packaging', '4. Check dates', '5. Check temperature', '6. Accept or set aside'],
      cta: 'Open Lesson: Receive Food Safely',
      scoped: false
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
      summary: 'Learn chilled, frozen, and dry storage environments, separation of raw meats from ready-to-eat foods, pallet clearance (≥15 cm), and simple FIFO/FEFO rotation.',
      steps: ['Chilled storage (≤5°C)', 'Frozen storage (≤-18°C)', 'Dry ambient storage', 'Raw vs ready separation', 'FIFO & FEFO rotation'],
      cta: 'Open Lesson: Store Food Safely',
      scoped: false
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
      steps: ['Measure temperature', 'Record results twice daily', 'Act if out of spec', 'Check → Act → Record → Verify sequence', 'Calibrate instruments'],
      cta: 'Open Lesson: Control Temperature',
      scoped: false
    },
    {
      id: 'allergens',
      title: '4. Allergen Awareness & Cross-Contact',
      tag: 'LEARNING MODULE 4',
      color: '#7c3aed',
      bgLight: 'rgba(124, 58, 237, 0.08)',
      icon: ShieldAlert,
      href: '/grocery/learn/allergens',
      quote: '“Careful label checks, physical separation, and prompt spill containment protect allergic consumers.”',
      summary: 'Identify the 8 mandatory FSSAI allergen groups, check product labels, prevent shelf cross-contact, use dedicated scoops, and follow the wet-clean spill response protocol.',
      steps: ['8 Regulated Allergens', 'Label reading', 'Lower-shelf segregation', 'Dedicated bulk scoops', 'Wet-clean spill protocol'],
      cta: 'Open Lesson: Allergen Awareness',
      scoped: false
    },
    {
      id: 'hygiene-pest',
      title: '5. Staff Hygiene & 4D Pest Management',
      tag: 'LEARNING MODULE 5',
      color: '#0d9488',
      bgLight: 'rgba(13, 148, 136, 0.08)',
      icon: Sparkles,
      href: '/grocery/learn/hygiene-pest',
      quote: '“Good personal hygiene prevents contamination at the source; disciplined 4D pest prevention protects store premises.”',
      summary: 'Learn the 6-step 20-second handwashing routine, clean workwear standards, symptom reporting/exclusion, cleaning vs sanitizing (TACT), and the 4Ds (Deny Entry, Deny Food, Deny Harbourage, Destroy).',
      steps: ['20-Sec handwashing', 'Clean workwear & grooming', 'Symptom reporting', 'TACT cleaning principles', 'The 4Ds pest defense'],
      cta: 'Open Lesson: Hygiene & Pest Management',
      scoped: false
    },
    {
      id: 'food-prep',
      title: '6. In-Store Prep & Deli Operations',
      tag: 'LEARNING MODULE 6 (ACTIVITY-SCOPED)',
      color: '#b45309',
      bgLight: 'rgba(180, 83, 9, 0.08)',
      icon: UtensilsCrossed,
      href: '/grocery/learn/food-prep',
      quote: '“In-store food preparation requires disciplined temperature holding, frying oil monitoring, and rigid cross-contamination barriers.”',
      summary: 'Authoritative operational rules for stores with live counters, bakery, or delis: hot holding (≥65°C), 2-stage cooling (2h/4h), cooking oil quality (RUCO/TPC ≤25%), safe thawing, and slicer hygiene.',
      steps: ['Hot holding ≥65°C', '2-Stage cooling protocol', 'Reheating ≥74°C', 'RUCO oil TPC ≤25%', 'Chiller thawing ≤4°C', 'Slicer 4-hour sanitizing'],
      cta: 'Open Lesson: In-Store Prep & Deli',
      scoped: true,
      scopedLabel: 'For stores with in-store cooking, hot counters, delis, or bakery operations'
    }
  ];

  const filteredModules = MODULES.filter(m => {
    if (filter === 'core') return !m.scoped;
    if (filter === 'prep') return m.scoped;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #F7F8F5)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />

      <main className="container" style={{ maxWidth: 1040, paddingTop: 32, paddingBottom: 64 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--muted, #64748B)',
              textDecoration: 'none'
            }}
          >
            <ChevronLeft size={16} /> Home
          </Link>
          <span style={{ color: '#CBD5E1' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>
            FoSTaC Learning Hub
          </span>
        </div>

        {/* Hero Header with Journey Flow */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 24,
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
            FoSTaC Learning Hub
          </h1>
          <p style={{ margin: '0 0 16px', fontSize: 15.5, color: '#d1fae5', maxWidth: 680, lineHeight: 1.5 }}>
            Practical food safety learning modules based on FSSAI FoSTaC Retail &amp; Distribution standards and Schedule 4 hygienic practices.
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
            <span>ALLERGENS</span>
            <span>→</span>
            <span>HYGIENE &amp; PEST</span>
            <span>→</span>
            <span>DAILY CHECK</span>
            <span>→</span>
            <span>ACT &amp; VERIFY</span>
          </div>
        </div>

        {/* ACTIVITY-BASED FILTER TABS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#64748B' }}>
            <Filter size={14} />
            <span>View:</span>
          </div>

          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: filter === 'all' ? '1.5px solid #059669' : '1px solid #CBD5E1',
              background: filter === 'all' ? '#ECFDF5' : '#ffffff',
              color: filter === 'all' ? '#065F46' : '#475569',
              cursor: 'pointer'
            }}
          >
            All Lessons ({MODULES.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('core')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: filter === 'core' ? '1.5px solid #059669' : '1px solid #CBD5E1',
              background: filter === 'core' ? '#ECFDF5' : '#ffffff',
              color: filter === 'core' ? '#065F46' : '#475569',
              cursor: 'pointer'
            }}
          >
            Core Grocery Retail (5)
          </button>

          <button
            type="button"
            onClick={() => setFilter('prep')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: filter === 'prep' ? '1.5px solid #b45309' : '1px solid #CBD5E1',
              background: filter === 'prep' ? '#FEF3C7' : '#ffffff',
              color: filter === 'prep' ? '#92400E' : '#475569',
              cursor: 'pointer'
            }}
          >
            In-Store Prep &amp; Deli (1)
          </button>
        </div>

        {/* LESSON CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
          {filteredModules.map(m => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  border: m.scoped ? '1.5px solid #FDE68A' : '1.5px solid #E2E8F0',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: m.color, letterSpacing: '0.04em' }}>
                          {m.tag}
                        </span>
                        {m.scoped && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            background: '#FEF3C7',
                            color: '#92400E',
                            padding: '2px 8px',
                            borderRadius: 6
                          }}>
                            ACTIVITY-SCOPED
                          </span>
                        )}
                      </div>
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

                {m.scopedLabel && (
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#92400e',
                    background: '#FEF3C7',
                    padding: '6px 12px',
                    borderRadius: 8,
                    marginBottom: 12,
                    display: 'inline-block'
                  }}>
                    ℹ {m.scopedLabel}
                  </div>
                )}

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

        {/* ========================================================================= */}
        {/* RETAINED SECTION: WHY FOOD CONTAMINATION OCCURS — AND HOW TO PREVENT IT   */}
        {/* ========================================================================= */}
        <section style={{
          background: '#ffffff',
          border: '1.5px solid #E2E8F0',
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 36,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(5, 150, 105, 0.1)',
              color: '#047857',
              padding: '3px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8
            }}>
              <UtensilsCrossed size={14} />
              <span>CORE SCIENTIFIC PRINCIPLES</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F2922', margin: '0 0 8px' }}>
              Why Food Contamination Occurs — and How to Prevent It
            </h2>
            <p style={{ color: '#475569', fontSize: 14.5, margin: 0, lineHeight: 1.55 }}>
              Food contamination is not an accident—it stems from identifiable temperature abuse, cross-contact vectors, and hygiene breakdowns in food preparation and handling. The five vectors below explain how failures occur and how FoodSafe365 preventive controls stop them.
            </p>
          </div>

          {/* FLOWCHART: THE "WHY" (Kitchen Vectors) */}
          <div style={{ marginBottom: 30 }}>
            <h3 style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: '#0F2922',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Zap size={16} color="#059669" />
              <span>Flowchart: Why Contamination Occurs in Food Operations</span>
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 12
            }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#DC2626', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>1. DANGER ZONE ABUSE</div>
                <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                  Food held between 5°C–60°C ➔ <strong>Bacteria doubles rapidly (~20 mins)</strong> ➔ Exponential bacterial proliferation
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#D97706', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>2. CROSS-CONTAMINATION</div>
                <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                  Raw meat tools used on ready-to-eat food ➔ <strong>Zero kill step</strong> ➔ Live pathogens transferred to customer food
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#0284C7', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>3. FAECAL–ORAL ROUTE</div>
                <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                  Post-restroom handwash breakdown ➔ <strong>Microscopic cysts &amp; pathogens</strong> ➔ Direct plating contamination
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#059669', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>4. SLOW AMBIENT COOLING</div>
                <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                  Deep pots cooled at room temperature ➔ <strong>Dormant spore germination</strong> ➔ Heat-stable toxin synthesis
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#475569', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>5. UNTREATED WATER / ICE</div>
                <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                  Unfiltered tap water in ice or dips ➔ <strong>Coliforms &amp; protozoan cysts</strong> ➔ Direct ingestion risk
                </div>
              </div>
            </div>
          </div>

          {/* TABLE: FAILURE POINT VS PREVENTIVE CONTROL */}
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <h3 style={{
              fontSize: 13.5,
              fontWeight: 800,
              color: '#0F2922',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12
            }}>
              Operational Breakdown Points vs. FoodSafe365 Preventive Controls
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              color: '#334155',
              background: '#FFFFFF',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}>
              <thead>
                <tr style={{ background: '#F8FAF7', borderBottom: '1.5px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: '#0F2922', fontWeight: 800 }}>Failure Point</th>
                  <th style={{ padding: '12px 16px', color: '#0F2922', fontWeight: 800 }}>Identified Risk</th>
                  <th style={{ padding: '12px 16px', color: '#0F2922', fontWeight: 800 }}>FoodSafe365 Control Mechanism</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Holding gravies/prepared food at ambient room temp</td>
                  <td style={{ padding: '12px 16px', color: '#DC2626' }}>Danger Zone bacterial proliferation (5°C–60°C)</td>
                  <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Strict 2-hour ambient rule &amp; chilled storage monitoring (≤5°C)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Shared prep knives &amp; chopping surfaces</td>
                  <td style={{ padding: '12px 16px', color: '#DC2626' }}>Cross-contamination to ready-to-eat foods</td>
                  <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Color-coded chopping board matrix &amp; tool segregation</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Slow passive cooling of deep containers</td>
                  <td style={{ padding: '12px 16px', color: '#D97706' }}>Spore germination (B. cereus / C. perfringens)</td>
                  <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>2-Stage rapid cooling: blast chiller or shallow pans in ice-baths</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Inadequate hand hygiene post-restroom</td>
                  <td style={{ padding: '12px 16px', color: '#DC2626' }}>Faecal–oral transmission of parasites &amp; pathogens</td>
                  <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Dedicated 20-second handwash routine + Form 1A health screening</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Untreated tap water for ice/chutneys</td>
                  <td style={{ padding: '12px 16px', color: '#D97706' }}>Protozoan cyst &amp; coliform ingestion</td>
                  <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Verified water filtration testing &amp; sanitized ice machines</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TECHNICAL CITATION & CLARIFICATION BOX */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 12,
            color: '#64748B',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: 2 }}>
              Authoritative Reference Notes:
            </strong>
            The Temperature Danger Zone (5°C–60°C) and chilled storage (≤5°C) limits are established under FSSAI Schedule 4 regulations. The 2-hour ambient limit and 2-stage cooling protocols represent international Codex/FoSTaC educational good practices to prevent spore activation. Bacterial doubling times (~20 mins) illustrate optimum mesophilic growth rates in laboratory conditions and vary with food pH and water activity.
          </div>
        </section>

        {/* EDUCATIONAL GUIDANCE NOTICE */}
        <div style={{
          background: '#F8FAFC',
          border: '1.5px solid #CBD5E1',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start'
        }}>
          <Info size={22} style={{ color: '#64748B', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: 4 }}>
              Educational Guidance Notice &amp; Regulatory Context
            </strong>
            These lessons provide operational food safety training material based on the FSSAI FoSTaC Training Manuals for Retail &amp; Distribution (Basic Level 1 and Advance Level 2) and Schedule 4 hygienic standards. Reviewing this educational material provides due-diligence assistance for store teams and does not confer official FSSAI certification or prove statutory compliance.
          </div>
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
              Back to Grocery Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
