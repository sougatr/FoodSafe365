'use client';

import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  Info,
  Check,
  Tag
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function LearnAllergensPage() {
  const ALLERGEN_CATEGORIES = [
    {
      num: 1,
      name: 'Cereals containing Gluten',
      items: 'Wheat, rye, barley, oats, spelt, and their hybridised strains and products',
      example: 'Flours, maida, sooji, bread, biscuits, pasta, breakfast cereals'
    },
    {
      num: 2,
      name: 'Crustaceans and their products',
      items: 'Prawns, crabs, lobsters, shrimp, and paste/extracts',
      example: 'Fresh, dried, chilled, or frozen shellfish; shrimp pastes'
    },
    {
      num: 3,
      name: 'Eggs and Egg Products',
      items: 'Whole eggs, egg powders, albumin, egg-based noodles, mayonnaise',
      example: 'Fresh shell eggs, bakery goods, mayonnaise, salad dressings'
    },
    {
      num: 4,
      name: 'Fish and Fish Products',
      items: 'Fresh, dried, frozen fish, fish pastes, fish oils, gelatin',
      example: 'Fresh/frozen fish, dried fish packs, fish sauces, surimi'
    },
    {
      num: 5,
      name: 'Peanuts, Soybeans and their products',
      items: 'Groundnuts, peanut butter, soya chunks, edamame, tofu, soya lecithin',
      example: 'Packaged peanuts, peanut chikki, soya oil, soy sauce, protein powders'
    },
    {
      num: 6,
      name: 'Milk and Milk Products',
      items: 'Cow/buffalo milk, cheese, paneer, butter, ghee, milk powder, lactose, whey',
      example: 'Pouches of milk, yogurt/curd, paneer, butter, sweets/mithai'
    },
    {
      num: 7,
      name: 'Tree Nuts and their products',
      items: 'Almonds, walnuts, cashews, pistachios, hazelnuts, pecans, Brazil nuts',
      example: 'Raw and roasted nuts, nut mixes, almond milk, marzipan, sweets'
    },
    {
      num: 8,
      name: 'Sulphite (in concentration ≥ 10 mg/kg)',
      items: 'Sulphur dioxide and sulphite salts used as preservatives',
      example: 'Dried fruits (raisins, apricots), fruit juices, wine, processed jams'
    }
  ];

  const PRACTICES = [
    {
      title: 'CHECK LABELS AT RECEIVING & STOCKING',
      subtitle: 'Look for mandatory allergen declarations',
      badge: 'IDENTIFICATION',
      color: '#7c3aed',
      icon: Tag,
      rule: 'Under the Food Safety and Standards (Labelling and Display) Regulations, 2020, packaged food manufacturers must declare allergens in the list of ingredients or as an explicit "CONTAINS: [ALLERGEN NAME]" statement.',
      action: 'When receiving and stocking shelves, verify that packaged food labels are intact and legible. Be familiar with common terms (e.g. casein/whey indicates milk; semolina/maida indicates gluten).'
    },
    {
      title: 'PHYSICAL SEGREGATION ON SHELVES',
      subtitle: 'Prevent powders, dust, and drips from falling onto non-allergenic foods',
      badge: 'STORAGE',
      color: '#0284c7',
      icon: Layers,
      rule: 'Allergens can contaminate non-allergenic goods through gravity spills, damaged seams, or dust circulation.',
      action: 'Store loose grains, flours, peanuts, and nut packs on lower shelves or in dedicated bays below ready-to-eat and allergen-free items. Never store opened allergen packs above plain foods.'
    },
    {
      title: 'DEDICATED BULK SCOOPS & CONTAINERS',
      subtitle: 'Never cross-mingle tools between loose dry goods',
      badge: 'HANDLING',
      color: '#059669',
      icon: Sparkles,
      rule: 'Even microscopic traces of peanut dust or wheat flour can trigger a life-threatening anaphylactic reaction in sensitive customers.',
      action: 'If your store dispenses loose nuts, dry fruits, or flours, use dedicated scoops and weighing pans for each item. Never use a peanut scoop in a cashew or raisin container.'
    },
    {
      title: 'DAMAGED PACKAGING & SPILL PROTOCOL',
      subtitle: 'Immediate containment without dry sweeping',
      badge: 'SPILL RESPONSE',
      color: '#ea580c',
      icon: AlertTriangle,
      rule: 'Dry brooms aerosolize allergen dust into the surrounding air, coating adjacent shelf goods with allergen particles.',
      action: 'If a bag of flour, peanuts, or milk tears: (1) Isolate the damaged package immediately into a clean sealed plastic bag; (2) Wet-wipe the spill with a damp disposable cloth and sanitizer; (3) Relocate the damaged pack to the Quarantine Holding Area.'
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
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(109, 40, 217, 0.2)'
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
            <ShieldAlert size={13} />
            <span>LEARNING MODULE 4</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Allergen Awareness &amp; Cross-Contact Prevention
          </h1>
          <p style={{ margin: 0, fontSize: 15.5, color: '#ede9fe', maxWidth: 660, lineHeight: 1.5, fontWeight: 500 }}>
            “Food allergies can cause severe, life-threatening reactions. Careful label checks, physical separation, and prompt spill containment protect our customers.”
          </p>
        </div>

        {/* SECTION 1: THE 8 MANDATORY ALLERGENS */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E2E8F0',
          borderRadius: 18,
          padding: '26px 28px',
          marginBottom: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(124, 58, 237, 0.1)',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Tag size={20} />
            </div>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                REGULATORY STANDARD
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                The 8 Regulated Allergen Categories
              </h2>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '8px 0 20px' }}>
            Under FSSAI labelling regulations and FoSTaC guidelines, the following eight categories must be declared on food packaging whenever present as an ingredient:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {ALLERGEN_CATEGORIES.map(cat => (
              <div
                key={cat.num}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#7c3aed',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 13,
                  flexShrink: 0
                }}>
                  {cat.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, marginBottom: 4 }}>
                    {cat.items}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#7c3aed', fontWeight: 600 }}>
                    Examples: {cat.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: 4 PRACTICAL FRONTLINE RULES */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            FRONTLINE BEST PRACTICES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PRACTICES.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 18,
                    padding: '22px 26px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${p.color}14`,
                      color: p.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: p.color, letterSpacing: '0.04em' }}>
                        {p.badge}
                      </span>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '2px 0 0' }}>
                        {p.title}
                      </h3>
                      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                        {p.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#F8FAFC',
                    borderLeft: `3px solid ${p.color}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#334155',
                    lineHeight: 1.5,
                    marginBottom: 10
                  }}>
                    <strong style={{ color: '#0F172A' }}>Why it matters: </strong>
                    {p.rule}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 13,
                    color: '#0F172A',
                    fontWeight: 600,
                    lineHeight: 1.45
                  }}>
                    <span style={{ color: p.color, fontWeight: 900 }}>✓ What to do:</span>
                    <span>{p.action}</span>
                  </div>
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
            This module provides operational food safety educational material derived from the FSSAI FoSTaC Training Manuals for Retail &amp; Distribution and the Food Safety and Standards (Labelling and Display) Regulations, 2020. Reading this material provides operational due-diligence assistance for frontline grocery teams and does not confer official FSSAI certification or prove statutory compliance.
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <Link
            href="/grocery/learn"
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
            <span>Learning Overview</span>
          </Link>

          <Link
            href="/grocery/learn/hygiene-pest"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#7c3aed',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
            }}
          >
            <span>Next: Hygiene &amp; Pest Management</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
