'use client';

import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Bug,
  ShieldCheck,
  Info,
  Check,
  Droplets,
  HeartPulse,
  DoorClosed,
  Trash2,
  Home,
  Crosshair
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function LearnHygienePestPage() {
  const HANDWASHING_STEPS = [
    { step: '1', title: 'Wet & Lather', desc: 'Wet hands with clean potable water and apply sufficient soap.' },
    { step: '2', title: 'Palms & Backs', desc: 'Rub palms together vigorously, then rub back of each hand with fingers interlaced.' },
    { step: '3', title: 'Between Fingers', desc: 'Interlace fingers palm-to-palm and clean between all webbing.' },
    { step: '4', title: 'Backs of Fingers', desc: 'Grip fingers into opposing palm and rub side to side.' },
    { step: '5', title: 'Thumbs & Wrists', desc: 'Clasp thumb in opposite hand and rotate; clean both wrists.' },
    { step: '6', title: 'Fingertips & Dry', desc: 'Rub fingertips in palm; rinse clean; dry with single-use paper towel or air dryer.' }
  ];

  const FOUR_DS = [
    {
      code: 'D1',
      title: 'DENY ENTRY',
      tagline: 'Keep pests out of the store envelope',
      icon: DoorClosed,
      color: '#0284c7',
      bgLight: 'rgba(2, 132, 199, 0.08)',
      measures: [
        'Fit wire mesh screens (aperture ≤ 1.2 mm) on all windows, ventilators, and air vents.',
        'Keep external doors closed or install self-closing devices, strip curtains, or air curtains.',
        'Install tight-fitting rubber sweeps under exterior warehouse and loading dock doors.',
        'Seal all pipe, cable, and wall penetrations with concrete or metal mesh (never cardboard).'
      ]
    },
    {
      code: 'D2',
      title: 'DENY FOOD',
      tagline: 'Remove food and water that attract pests',
      icon: Trash2,
      color: '#059669',
      bgLight: 'rgba(5, 150, 105, 0.08)',
      measures: [
        'Adopt a strict "Clean As You Go" rule: clean food spills immediately with wet detergent.',
        'Keep waste in covered, pedal-operated garbage bins lined with plastic liners.',
        'Empty and wash waste bins at the end of each shift; never leave food waste overnight.',
        'Fix leaking pipes and refrigeration condensation trays so pests find no standing water.'
      ]
    },
    {
      code: 'D3',
      title: 'DENY HARBOURAGE',
      tagline: 'Eliminate hiding and nesting places',
      icon: Home,
      color: '#d97706',
      bgLight: 'rgba(217, 119, 6, 0.08)',
      measures: [
        'Store all food cartons and sacks on pallets/racks at least 15 cm (6 inches) off the floor.',
        'Maintain a 30 cm gap between shelving units and perimeter walls to allow inspection.',
        'Promptly discard corrugated cardboard delivery boxes (major breeding site for cockroaches).',
        'Eliminate dead storage, junk, broken wooden pallets, and scrap equipment from the premises.'
      ]
    },
    {
      code: 'D4',
      title: 'DESTROY & CONTROL',
      tagline: 'Safe, controlled eradication methods',
      icon: Crosshair,
      color: '#dc2626',
      bgLight: 'rgba(220, 38, 38, 0.08)',
      measures: [
        'Insect Light Traps (ILTs / UV fly killers): install away from sunlight, not directly above food.',
        'Use non-toxic glue boards and mechanical snap traps inside retail and food storage areas.',
        'Tamper-resistant, numbered rodent bait boxes must be placed strictly on the exterior perimeter.',
        'Never use loose chemical rodenticides, sprays, or poison powder inside food sales areas.'
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
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(13, 148, 136, 0.2)'
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
            <Sparkles size={13} />
            <span>LEARNING MODULE 5</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Staff Hygiene &amp; 4D Pest Management
          </h1>
          <p style={{ margin: 0, fontSize: 15.5, color: '#ccfbf1', maxWidth: 660, lineHeight: 1.5, fontWeight: 500 }}>
            “Good personal hygiene prevents food contamination at the source, while disciplined 4D pest prevention protects store premises from infestation.”
          </p>
        </div>

        {/* PART 1: PERSONAL HYGIENE & HANDWASHING */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E2E8F0',
          borderRadius: 18,
          padding: '26px 28px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplets size={20} />
            </div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                HYGIENE PRACTICE
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Effective Handwashing: 20-Second Routine
              </h2>
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '8px 0 18px' }}>
            Handwashing with potable water and soap for at least 20 seconds is the most critical defence against bacterial cross-contamination in retail food handling.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
            {HANDWASHING_STEPS.map(st => (
              <div
                key={st.step}
                style={{
                  background: '#F0FDFA',
                  border: '1px solid #CCFBF1',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 10
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: '#0d9488',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {st.step}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#134e4a', marginBottom: 2 }}>
                    {st.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.35 }}>
                    {st.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* When to wash */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: '#334155'
          }}>
            <strong style={{ color: '#0F172A', display: 'block', marginBottom: 6 }}>
              Mandatory Handwashing Triggers:
            </strong>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Before handling food, clean packaging, or clean display shelving</li>
              <li>Immediately after using the toilet or washroom facilities</li>
              <li>After handling garbage, waste bins, or soiled shipping cartons</li>
              <li>After coughing, sneezing, using a tissue, smoking, or touching the face/hair</li>
              <li>After handling cleaning chemicals, mops, or chemical spray bottles</li>
              <li>After handling currency notes, coins, or dirty delivery crates</li>
            </ul>
          </div>
        </div>

        {/* PART 2: HEALTH, ATTIRE & SICKNESS REPORTING */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E2E8F0',
          borderRadius: 18,
          padding: '26px 28px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartPulse size={20} />
            </div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                STAFF HEALTH &amp; WORKWEAR
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Illness Reporting &amp; Personal Attire Standards
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16 }}>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', marginBottom: 6 }}>
                Symptom Reporting &amp; Exclusion
              </div>
              <p style={{ fontSize: 12.5, color: '#7f1d1d', lineHeight: 1.45, margin: '0 0 10px' }}>
                Under Schedule 4 requirements, food handlers suffering from communicable illnesses must report symptoms immediately to the store manager.
              </p>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#991b1b', lineHeight: 1.5 }}>
                <li>Diarrhea, vomiting, or acute gastroenteritis</li>
                <li>Jaundice or hepatitis symptoms</li>
                <li>Fever accompanied by sore throat or persistent cough</li>
                <li>Infected skin lesions, cuts, or boils on hands/arms</li>
              </ul>
              <div style={{ marginTop: 10, fontSize: 11.5, fontWeight: 700, color: '#7f1d1d' }}>
                Action: Relieve from food contact; staff must be cleared by a medical practitioner or store manager before resuming food handling.
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Clean Workwear &amp; Grooming
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: '#334155', lineHeight: 1.55 }}>
                <li><strong>Aprons/Uniform:</strong> Clean work clothes worn only on duty; replaced when soiled.</li>
                <li><strong>Hair Covering:</strong> Hair neatly tied or restrained under clean caps/nets.</li>
                <li><strong>Nails &amp; Jewelry:</strong> Nails trimmed short and clean (no nail polish); no wristwatches or stone-set rings.</li>
                <li><strong>Cuts &amp; Wounds:</strong> Covered with waterproof, clean, brightly colored dressings.</li>
                <li><strong>Habits:</strong> No smoking, spitting, chewing tobacco/paan, or eating in food storage or sales aisles.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PART 3: CLEANING VS SANITIZING (SSOP & TACT) */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E2E8F0',
          borderRadius: 18,
          padding: '26px 28px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
            Cleaning vs. Sanitizing: The TACT Principle
          </h2>
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
            Cleaning removes visible dirt, soil, and grease using detergent and water. Sanitizing reduces invisible disease-causing micro-organisms to safe levels using food-grade sanitizers or heat.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <strong style={{ color: '#0d9488', display: 'block', fontSize: 14 }}>T — Time</strong>
              <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.35 }}>
                Allow sanitizers adequate contact time on surfaces (follow manufacturer label; typically 1–2 minutes).
              </span>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <strong style={{ color: '#0d9488', display: 'block', fontSize: 14 }}>A — Action</strong>
              <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.35 }}>
                Mechanical scrubbing or agitation dislodges stubborn food soils and biofilms that chemical sprays alone cannot penetrate.
              </span>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <strong style={{ color: '#0d9488', display: 'block', fontSize: 14 }}>C — Concentration</strong>
              <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.35 }}>
                Dilute sanitizers accurately using measuring cups. Too weak is ineffective; too strong leaves chemical residues.
              </span>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px' }}>
              <strong style={{ color: '#0d9488', display: 'block', fontSize: 14 }}>T — Temperature</strong>
              <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.35 }}>
                Warm water dissolves fats and oils faster, but avoid hot water for chlorine bleach as heat breaks down active chlorine.
              </span>
            </div>
          </div>

          <div style={{ fontSize: 12.5, color: '#64748B', fontStyle: 'italic' }}>
            Note: Store cleaning chemicals locked in their original labelled containers, completely separated from all food goods.
          </div>
        </div>

        {/* PART 4: THE 4D PEST MANAGEMENT PRINCIPLES */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(2, 132, 199, 0.1)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bug size={20} />
            </div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                PEST DEFENSE FRAMEWORK
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                The 4D Pest Management Principles
              </h2>
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
            The official FoSTaC curriculum structures integrated pest management around four distinct defensive lines:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FOUR_DS.map(d => {
              const Icon = d.icon;
              return (
                <div
                  key={d.code}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 18,
                    padding: '20px 24px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: d.bgLight,
                      color: d.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: d.color, letterSpacing: '0.04em' }}>
                        {d.code}
                      </span>
                      <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        {d.title} — {d.tagline}
                      </h3>
                    </div>
                  </div>

                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
                    {d.measures.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
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
            This module provides operational hygiene and pest management educational material derived from the FSSAI FoSTaC Training Manuals for Retail &amp; Distribution (Basic Level 1 and Advance Level 2) and Schedule 4 Part II hygiene standards. Reading this material provides operational due-diligence assistance for frontline grocery teams and does not confer official FSSAI certification or prove statutory compliance.
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <Link
            href="/grocery/learn/allergens"
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
            <span>Prev: Allergen Awareness</span>
          </Link>

          <Link
            href="/grocery/learn/food-prep"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#0d9488',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
            }}
          >
            <span>Next: In-Store Prep &amp; Deli</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
