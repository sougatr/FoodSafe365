'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Thermometer,
  Sparkles,
  Search,
  ArrowRight,
  UtensilsCrossed,
  AlertOctagon,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Droplets,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Microscope,
  Bug,
  Zap,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const FAQS: FAQItem[] = [
  {
    id: 'food-poisoning-causes',
    category: 'Acute Health Risks',
    question: 'What causes acute food poisoning and how fast does it strike after dining out?',
    answer: 'Food poisoning is an acute gastrointestinal illness caused by ingesting food contaminated with pathogenic bacteria (such as Salmonella, Staphylococcus aureus, Bacillus cereus, and Campylobacter) or their pre-formed toxins. Onset can occur as quickly as 30 minutes to 6 hours for toxin-mediated bacteria (Staphylococcus and Bacillus cereus in reheated rice/gravy), presenting with sudden nausea, violent vomiting, severe abdominal cramps, and watery diarrhea. In severe cases, dehydration and electrolyte collapse require emergency hospitalization.',
    tags: ['food poisoning', 'bacteria', 'vomiting', 'salmonella', 'short term']
  },
  {
    id: 'amoebiasis-infection',
    category: 'Acute Health Risks',
    question: 'What is amoebiasis and how does Entamoeba histolytica enter restaurant food?',
    answer: 'Amoebiasis is an intestinal infection caused by the microscopic protozoan parasite Entamoeba histolytica. It enters commercial food chains when food handlers carrying the parasite fail to wash hands after using the washroom (fecal-oral route), or when raw salad vegetables, mint chutneys, and ice are washed or made with non-potable, unchlorinated water. Ingested amoebic cysts burrow into the large intestine lining, causing amoebic dysentery with bloody diarrhea, severe cramping, persistent fever, and in chronic cases, dangerous amoebic liver abscesses.',
    tags: ['amoebiasis', 'parasite', 'water', 'hygiene', 'dysentery', 'salad']
  },
  {
    id: 'acute-infections-how-why',
    category: 'Acute Health Risks',
    question: 'How and why do Acute Short-Term Infections occur in restaurant kitchens?',
    answer: 'Acute infections occur through three distinct biological pathways: (1) Intoxication (Pre-formed Toxins): Pathogens like Staphylococcus aureus or Bacillus cereus grow in room-temperature foods and synthesize heat-stable enterotoxins. Ingestion triggers the vagus nerve and brain vomiting center within 30 mins to 6 hours—even if food is reheated. (2) Invasive Proliferation (Infection): Living bacteria like Salmonella, E. coli, and Campylobacter survive stomach acid, attach to intestinal enterocytes, invade the mucosa, and trigger acute inflammation, mucosal cell destruction, and cytokine cascades within 6 to 48 hours (fever, cramping, profuse diarrhea). (3) Parasitic Excystation (Amoebiasis): Acid-resistant Entamoeba histolytica cysts ingested via unwashed salads or contaminated water excyst in the ileum/colon into motile trophozoites, secreting cysteine proteases and amoebapores that carve out classic flask-shaped mucosal ulcers, bloody dysentery, and potential liver abscesses. Operationally, they occur because of 5 kitchen failures: Temperature Danger Zone abuse (5°C–60°C), improper hand scrubbing after restroom use, shared cutting boards transferring raw poultry juices to salads, dormant spore survival during slow cooling, and non-potable ice or rinse water.',
    tags: ['acute infections', 'how and why', 'pathogenesis', 'staph', 'salmonella', 'amoebiasis', 'cereus']
  },
  {
    id: 'reheated-cooking-oil-ruco',
    category: 'Toxic Chemicals & Carcinogens',
    question: 'Why is repeatedly reheated cooking oil toxic and what is the FSSAI RUCO (25% TPC) limit?',
    answer: 'When cooking oil is repeatedly heated at high frying temperatures (>180°C), it undergoes thermal oxidation, hydrolysis, and polymerization. This chemical breakdown generates toxic Total Polar Compounds (TPC), acrylamides, trans-fatty acids, polycyclic aromatic hydrocarbons (PAHs), and carcinogenic lipid peroxides. Ingesting food cooked in oxidized oil severely inflames the gut lining, damages endothelial arterial cells (accelerating atherosclerosis and hypertension), and significantly elevates the risk of colorectal, esophageal, and liver cancers. FSSAI mandates under the RUCO initiative that any cooking oil crossing 25% Total Polar Compounds (TPC) is legally unfit for human consumption and must be handed over to authorized biodiesel recyclers.',
    tags: ['used oil', 'reheated oil', 'ruco', 'tpc', 'cancer', 'frying', 'heart']
  },
  {
    id: 'artificial-colors-rhodamine',
    category: 'Toxic Chemicals & Carcinogens',
    question: 'Why are synthetic food colors like Rhodamine B and Metanil Yellow banned?',
    answer: 'Unregulated street and budget eateries often use industrial textile dyes like Rhodamine B (to produce an intensely glowing crimson red in Gobi Manchurian, chicken tandoori, and cotton candy) and Metanil Yellow (an illegal dye used to fake turmeric or saffron in biryanis and sweets). Rhodamine B is an industrial dye classified as cytotoxic and carcinogenic by international oncology authorities; chronic ingestion damages cellular DNA, induces hepatic/renal failure, and triggers tumor formation. Several Indian states (Karnataka, Tamil Nadu, Goa, HP) have imposed strict bans with severe criminal penalties under the Food Safety Act.',
    tags: ['colors', 'rhodamine b', 'dyes', 'cancer', 'chemicals', 'gobi manchurian']
  },
  {
    id: 'preservatives-ajinomoto-msg',
    category: 'Toxic Chemicals & Carcinogens',
    question: 'What are the risks of synthetic preservatives and excessive Ajinomoto (MSG)?',
    answer: 'Excess chemical preservatives—such as synthetic sodium benzoates, potassium metabisulphites in bulk industrial sauces, and sodium nitrites in cheap processed meats—can form carcinogenic nitrosamines when heated in the human stomach. While food-grade Monosodium Glutamate (MSG / Ajinomoto) is permitted in regulated quantities, commercial kitchens frequently use heavily adulterated, non-food grade flavor enhancers in high doses to mask stale or low-grade raw materials. High heat degradation combined with reused fats can cause severe gastric mucosal burning, peptic ulceration, excitotoxicity, acute headaches, and long-term metabolic inflammation.',
    tags: ['preservatives', 'ajinomoto', 'msg', 'cancer', 'additives', 'stomach']
  },
  {
    id: 'old-curry-pastes-danger',
    category: 'Kitchen Practices & Storage',
    question: 'Why is holding partially cooked food and old curry pastes in bulk so hazardous?',
    answer: 'In commercial Indian kitchens, preparing massive pots of base gravies (onion-tomato masala, cashew makhani paste, korma base) for multi-day use is a widespread shortcut. When these thick, dense gravies are cooled slowly at room temperature, their core remains trapped in the Temperature Danger Zone (5°C to 60°C) for many hours. Spore-forming anaerobic bacteria—specifically Clostridium perfringens and Bacillus cereus—germinate rapidly. As the gravy ages in improper refrigeration, it ferments and produces heat-stable enterotoxins that cannot be deactivated even by boiling before service, causing severe gastrointestinal poisoning.',
    tags: ['curry paste', 'gravy', 'partially cooked', 'danger zone', 'spores', 'storage']
  },
  {
    id: 'danger-zone-two-hour-rule',
    category: 'Kitchen Practices & Storage',
    question: 'What is the "Temperature Danger Zone" (5°C to 60°C) and the 2-Hour / 4-Hour Rule?',
    answer: 'The Temperature Danger Zone spans from 5°C (41°F) to 60°C (140°F), where bacterial populations double every 15 to 20 minutes. Under professional food safety standards: Food kept in the danger zone for under 2 hours must be immediately consumed or chilled to below 5°C; food held in the danger zone between 2 to 4 hours must be consumed immediately and cannot be re-chilled; any perishable food held in the danger zone for more than 4 hours MUST be discarded immediately because toxin loads become lethal.',
    tags: ['danger zone', 'temperature', 'two hour rule', 'bacteria growth']
  },
  {
    id: 'five-star-blast-chillers',
    category: '5-Star Best Practices',
    question: 'Why do 5-star hotel kitchens use blast chillers instead of standard domestic refrigerators?',
    answer: 'A standard domestic refrigerator cools food through passive ambient air convection, which takes 8 to 12 hours to cool a deep pot of curry, leaving the core in the bacterial danger zone. In contrast, 5-star properties (Taj, Oberoi, Marriott, Hyatt) use high-velocity blast chillers that force refrigerated air across food surfaces, crashing the internal core temperature from 70°C to below 3°C within 90 minutes. This flash-chilling halts microbial reproduction instantly, protects cellular texture, and prevents fermentation.',
    tags: ['5 star', 'blast chiller', 'cooling', 'michelin', 'taj', 'marriott']
  },
  {
    id: 'five-star-color-coding',
    category: '5-Star Best Practices',
    question: 'What is the 6-color cutting board and knife matrix used in luxury commercial kitchens?',
    answer: 'To achieve zero cross-contamination between raw animal bacteria and ready-to-eat foods, 5-star kitchens strictly mandate a 6-color coded board and handle system: 🔴 Red = Raw Red Meats (Beef/Mutton/Pork); 🟡 Yellow = Raw Poultry & Chicken; 🔵 Blue = Raw Fish & Seafood; 🟢 Green = Fresh Washed Fruits & Vegetables; ⚪ White = Bakery, Dairy, Pastry & Cheese; 🟤 Brown = Cooked Meats & Charcuterie. Knives and prep stations correspond directly to these colors.',
    tags: ['5 star', 'cutting boards', 'color coding', 'cross contamination']
  },
  {
    id: 'customer-red-flags',
    category: 'Diner Awareness',
    question: 'How can a customer identify food safety red flags when dining out or ordering food?',
    answer: 'Key warning signs include: (1) Unnaturally vibrant fluorescent neon-red or yellow colors in gravies or fried snacks (indicating textile dyes); (2) A dark, viscous, bitter, or pungent smell in fried items (signaling reheated oil past 25% TPC); (3) Luke-warm soups or gravies served under 60°C; (4) Food handlers handling currency notes and then plating food without handwashing; (5) Odor of sour fermentation or excessive acidity in restaurant gravies; and (6) Absence of a verified digital FoodSafe365 or FSSAI inspection passport on tables.',
    tags: ['red flags', 'customer', 'diner tips', 'smell', 'colors', 'signs']
  }
];

export default function FoodSafetyWhy() {
  const [faqSearch, setFaqSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('reheated-cooking-oil-ruco');

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(FAQS.map(f => f.category)))];
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.toLowerCase().trim();
    return FAQS.filter(faq => {
      const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchQuery =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.tags.some(t => t.toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }, [faqSearch, activeCategory]);

  function toggleFaq(id: string) {
    setExpandedFaqId(prev => (prev === id ? null : id));
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAF7' }}>
      <GlobalHeader />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F7F2 100%)',
        borderBottom: '1px solid #E2E8F0',
        paddingTop: 40,
        paddingBottom: 48
      }}>
        <div className="container" style={{ maxWidth: 1180 }}>
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#065F46',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(5, 150, 105, 0.08)',
                padding: '5px 12px',
                borderRadius: 8,
                border: '1px solid rgba(5, 150, 105, 0.2)',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={15} /> Back to Home
            </Link>
            <Link
              href="/about"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#475569',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              About FoodSafe365
            </Link>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{
                background: 'rgba(5, 150, 105, 0.1)',
                color: '#047857',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                fontSize: 11,
                fontWeight: 800,
                padding: '5px 14px',
                borderRadius: 9999,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                🌿 FOOD SAFETY SCIENCE &amp; HYGIENE TRUTHS
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 4.5vw, 46px)',
              lineHeight: 1.18,
              fontWeight: 900,
              color: '#0F2922',
              margin: '0 0 16px',
              letterSpacing: '-0.025em'
            }}>
              Why Food Safety Matters:<br />The Science of Clean Kitchens
            </h1>

            <p style={{
              fontSize: 'clamp(15.5px, 2vw, 17.5px)',
              color: '#475569',
              margin: '0 auto 24px',
              maxWidth: 780,
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              Understanding how biological, chemical and physical hazards enter food operations — and how good food-safety systems control and reduce risk.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="container" style={{ maxWidth: 1180, paddingTop: 40, paddingBottom: 64 }}>

        {/* ========================================================================= */}
        {/* SECTION 1: THE CAUSES OF FOOD CONTAMINATION & HEALTH HAZARDS */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 28, maxWidth: 840 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#059669',
              background: 'rgba(5, 150, 105, 0.08)',
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid rgba(5, 150, 105, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'inline-block',
              marginBottom: 8
            }}>
              Core Contamination Vectors
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0F2922', margin: '4px 0 10px', letterSpacing: '-0.02em' }}>
              Causes of Food Contamination &amp; Their Impact
            </h2>
            <p style={{ color: '#475569', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
              Food contamination is not an accident—it stems from identifiable biological, chemical, and physical breakdowns in daily food preparation and handling.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            {/* 1. BIOLOGICAL HAZARDS */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: '4px solid #059669',
              borderRadius: 16,
              padding: '24px 22px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bug size={22} />
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    1. MICROBIAL &amp; PARASITIC
                  </span>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F2922', margin: 0 }}>
                    Biological Hazards
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                Living microorganisms and heat-stable toxins that proliferate rapidly under improper temperatures or hygiene failures.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.55 }}>
                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }}></span>
                    Bacterial Pathogens (Salmonella, Staph, E. coli)
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Multiplies exponentially in the Danger Zone (5°C–60°C). Toxin synthesis causes projectile vomiting, fever, and acute gastroenteritis within 30m–8h.
                  </span>
                </div>

                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }}></span>
                    Amoebiasis &amp; Parasites (E. histolytica)
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Transmitted via unchlorinated water or unwashed food-handler hands into salads and garnishes, leading to amoebic dysentery and liver abscesses.
                  </span>
                </div>

                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }}></span>
                    Spore-Formers (Bacillus cereus)
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Slow ambient cooling of rice and starch dishes activates heat-resistant spores, producing enterotoxins that survive subsequent reheating.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. CHEMICAL HAZARDS */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: '4px solid #0284C7',
              borderRadius: 16,
              padding: '24px 22px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    2. TOXINS &amp; DEGRADATION
                  </span>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F2922', margin: 0 }}>
                    Chemical Hazards
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                Harmful chemical compounds arising from reused thermal mediums, unapproved industrial colorants, or sanitizing agents.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.55 }}>
                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }}></span>
                    Repeatedly Reheated Frying Oil (TPC &gt; 25%)
                  </strong>
                  <span style={{ color: '#475569' }}>
                    High-heat breakdown produces Total Polar Compounds, acrylamides, and lipid peroxides associated with vascular endothelial inflammation and cellular damage.
                  </span>
                </div>

                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }}></span>
                    Prohibited Textile Dyes (Rhodamine B)
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Industrial dyes illegally used to produce fluorescent red in street gravies. Cytotoxic, non-permitted compounds with documented hepatic toxicity.
                  </span>
                </div>

                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284C7' }}></span>
                    Sanitizer Residues &amp; Excessive Additives
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Improperly rinsed chemical degreasers or chlorine solutions exceeding 200 PPM, leading to acute mucosal irritation and chemical contamination.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. PHYSICAL HAZARDS */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: '4px solid #D97706',
              borderRadius: 16,
              padding: '24px 22px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(217, 119, 6, 0.1)',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertOctagon size={22} />
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    3. FOREIGN MATERIALS
                  </span>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F2922', margin: 0 }}>
                    Physical Hazards
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                Inorganic and extraneous matter introduced via damaged prep utensils, raw produce, or structural kitchen wear.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.55 }}>
                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }}></span>
                    Glass Shards &amp; Brittle Plastics
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Shattered service ware or unprotected overhead light bulbs over open prep lines pose severe choking, laceration, and puncture risks.
                  </span>
                </div>

                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }}></span>
                    Metal Shavings &amp; Wire Scrubbers
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Loose bristles from cheap metal scourers dislodged into cooking vats, or metal fragments from worn commercial can openers.
                  </span>
                </div>

                <div style={{ background: '#F8FAF7', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <strong style={{ color: '#0F2922', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }}></span>
                    Pest Frass &amp; Extraneous Debris
                  </strong>
                  <span style={{ color: '#475569' }}>
                    Stones and chaff in uncleaned grain sacks, or insect fragments indicating compromised dry-storage integrity and inadequate screening.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1.5: FLOWCHARTS & TABLES: HOW & WHY ACUTE INFECTIONS OCCUR */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 52 }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderTop: '4px solid #059669',
            borderRadius: 18,
            padding: '28px 24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(5, 150, 105, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(5, 150, 105, 0.2)'
              }}>
                <Microscope size={22} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  RAPID DIAGNOSTIC FLOW
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F2922', margin: 0 }}>
                  Acute Short-Term Infections: How &amp; Why
                </h3>
              </div>
            </div>

            {/* FLOWCHART 1: THE "HOW" (Biological Mechanisms) */}
            <div style={{ marginBottom: 30 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F2922', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} color="#059669" /> Flowchart 1: How Pathogens Attack the Human Body
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Flow 1: Intoxication */}
                <div style={{
                  background: '#F8FAF7',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: 12.5
                }}>
                  <span style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#B91C1C', fontWeight: 800, padding: '3px 9px', borderRadius: 6, fontSize: 11, border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                    INTOXICATION (30m–6h)
                  </span>
                  <span style={{ color: '#334155' }}>Food left in Danger Zone</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#334155' }}>Staph / B. cereus synthesizes heat-stable toxins</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#334155' }}>Vagus nerve stimulation</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#991B1B', fontWeight: 700, background: 'rgba(220, 38, 38, 0.08)', padding: '2px 8px', borderRadius: 6 }}>
                    Severe Acute Vomiting
                  </span>
                </div>

                {/* Flow 2: Infection */}
                <div style={{
                  background: '#F8FAF7',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: 12.5
                }}>
                  <span style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#B45309', fontWeight: 800, padding: '3px 9px', borderRadius: 6, fontSize: 11, border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                    INFECTION (6h–48h)
                  </span>
                  <span style={{ color: '#334155' }}>Undercooked poultry / cross-contamination</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#334155' }}>Live Salmonella/E. coli survives gastric barrier</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#334155' }}>Intestinal mucosal inflammation &amp; cytokine cascade</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#92400E', fontWeight: 700, background: 'rgba(217, 119, 6, 0.08)', padding: '2px 8px', borderRadius: 6 }}>
                    Fever &amp; Severe Enteritis
                  </span>
                </div>

                {/* Flow 3: Amoebiasis */}
                <div style={{
                  background: '#F8FAF7',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: 12.5
                }}>
                  <span style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#047857', fontWeight: 800, padding: '3px 9px', borderRadius: 6, fontSize: 11, border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                    AMOEBIASIS (Days–Weeks)
                  </span>
                  <span style={{ color: '#334155' }}>Unwashed salad / raw water / unwashed hands</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#334155' }}>Ingested E. histolytica cysts</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#334155' }}>Excystation in colon; trophozoites erode mucosa</span>
                  <span style={{ color: '#94A3B8', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#065F46', fontWeight: 700, background: 'rgba(5, 150, 105, 0.08)', padding: '2px 8px', borderRadius: 6 }}>
                    Amoebic Dysentery &amp; Complications
                  </span>
                </div>
              </div>
            </div>

            {/* FLOWCHART 2: THE "WHY" (Kitchen Vectors) */}
            <div style={{ marginBottom: 30 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F2922', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UtensilsCrossed size={16} color="#059669" /> Flowchart 2: Why Contamination Occurs in Commercial Kitchens
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12
              }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ color: '#DC2626', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>1. DANGER ZONE ABUSE</div>
                  <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                    Food held between 5°C–60°C ➔ <strong>Bacteria doubles every 20 mins</strong> ➔ Exponential bacterial load
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ color: '#D97706', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>2. CROSS-CONTAMINATION</div>
                  <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                    Raw meat knife used on salads ➔ <strong>Zero kill step</strong> ➔ Live pathogens transferred to ready food
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ color: '#0284C7', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>3. FECAL-ORAL VECTOR</div>
                  <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                    Post-restroom hand breakdown ➔ <strong>Microscopic cysts under nails</strong> ➔ Direct plating contamination
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ color: '#059669', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>4. SLOW AMBIENT COOLING</div>
                  <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                    Large bulk gravy cooled at room temp ➔ <strong>Heat activates spores</strong> ➔ Toxin synthesis
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ color: '#475569', fontWeight: 800, fontSize: 12, marginBottom: 5 }}>5. UNTREATED WATER / ICE</div>
                  <div style={{ color: '#475569', fontSize: 12.5, lineHeight: 1.45 }}>
                    Unfiltered tap water in dips &amp; bar ice ➔ <strong>Coliforms &amp; cysts</strong> ➔ Ingestion risk
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE 2: KITCHEN FAILURE VS FOODSAFE365 CONTROL */}
            <div style={{ overflowX: 'auto' }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F2922', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Table 2: Kitchen Breakdown Point vs. FoodSafe365 Preventive Control
              </h4>
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
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Holding gravies at ambient room temp</td>
                    <td style={{ padding: '12px 16px', color: '#DC2626' }}>Danger Zone bacterial proliferation (5°C–60°C)</td>
                    <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Strict 2-hour discard rule &amp; chilled storage monitoring (&lt;5°C)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Shared prep knives &amp; chopping surfaces</td>
                    <td style={{ padding: '12px 16px', color: '#DC2626' }}>Cross-contamination to ready-to-eat foods</td>
                    <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>6-Color board matrix (Yellow = Poultry, Green = Washed Veg)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Slow passive cooling of deep pots</td>
                    <td style={{ padding: '12px 16px', color: '#D97706' }}>Spore germination (B. cereus / C. perfringens)</td>
                    <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Rapid cooling protocol: blast chiller or shallow pans in ice-baths</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Inadequate hand hygiene post-restroom</td>
                    <td style={{ padding: '12px 16px', color: '#DC2626' }}>Fecal-oral transmission of parasites &amp; pathogens</td>
                    <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Dedicated handwash stations + Form 1A medical fitness checks</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2922' }}>Untreated tap water for ice/chutneys</td>
                    <td style={{ padding: '12px 16px', color: '#D97706' }}>Protozoan cyst &amp; coliform ingestion</td>
                    <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 600 }}>Verified water filtration &amp; sanitized ice machine maintenance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: 5-STAR RESTAURANT & MICHELIN KITCHEN BEST PRACTICES */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LUXURY HOSPITALITY BENCHMARKS
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0F2922', margin: '4px 0 8px' }}>
              Best Practices Followed in 5-Star Kitchens
            </h2>
            <p style={{ color: '#475569', fontSize: 14.5, margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
              How premier hospitality kitchens and high-compliance food operations establish rigorous controls to minimize contamination risks:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {/* 1. Blast Chilling */}
            <div className="card" style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(5, 150, 105, 0.08)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F2922' }}>
                  1. Blast Chilling (&lt;90 Min Rule)
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Crashes hot core temperature from 70°C to &lt;3°C within 90 minutes, completely bypassing the bacterial danger zone.
              </p>
            </div>

            {/* 2. Color-Coded Board Matrix */}
            <div className="card" style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(2, 132, 199, 0.08)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F2922' }}>
                  2. 6-Color Chopping Matrix
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Strict color segregation: Red (Meat), Yellow (Poultry), Blue (Fish), Green (Produce), White (Dairy), Brown (Cooked).
              </p>
            </div>

            {/* 3. FIFO & Day-Dot Expiry */}
            <div className="card" style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(217, 119, 6, 0.08)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F2922' }}>
                  3. FIFO &amp; Day-Dot System
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Color-coded weekday dot stickers stamped with prep time, chef initials, and strict 48-hour discard deadlines.
              </p>
            </div>

            {/* 4. Digital Core Temp Probes */}
            <div className="card" style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Thermometer size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F2922' }}>
                  4. Core Temperature Probing
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Calibrated needle probes log internal cooking core (≥75°C), hot holding (≥63°C), and cold storage (&lt;4°C).
              </p>
            </div>

            {/* 5. Cooking Oil TPC Testing */}
            <div className="card" style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(13, 148, 136, 0.08)', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F2922' }}>
                  5. Digital Oil TPC Meters
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Twice-daily digital testing (Testo 270); discarded for biodiesel recycling the moment Total Polar Compounds hit 24%.
              </p>
            </div>

            {/* 6. Medical Fitness & PPM Sanitizers */}
            <div className="card" style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 16,
              padding: '20px 22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99, 102, 241, 0.08)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartPulse size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F2922' }}>
                  6. Medical Clearance (Form 1A)
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Mandatory 6-monthly stool cultures &amp; typhoid vaccines, plus chlorine test strips (100–200 PPM) for salad sinks.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: INTERACTIVE SEARCHABLE FAQ SECTION */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 24px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0F2922', margin: '6px 0 8px' }}>
              Common Questions on Food Safety, Toxins &amp; Hygiene
            </h2>
            <p style={{ color: '#475569', fontSize: 14.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              Search any food safety topic, chemical risk, or kitchen practice to see verified guidelines:
            </p>

            {/* Search Input Filter Box */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: 16,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              maxWidth: 620,
              margin: '0 auto 16px'
            }}>
              <Search size={20} color="#059669" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search FAQs (e.g. used oil, curry paste, amoebiasis, 5 star, ajinomoto)..."
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 14.5,
                  color: '#0F2922'
                }}
              />
              {faqSearch && (
                <button
                  type="button"
                  onClick={() => setFaqSearch('')}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: activeCategory === cat ? '#059669' : '#FFFFFF',
                    border: activeCategory === cat ? '1.5px solid #047857' : '1.5px solid #E2E8F0',
                    color: activeCategory === cat ? '#ffffff' : '#475569',
                    padding: '6px 14px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'all' ? 'All Questions' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion FAQ List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 920, margin: '0 auto' }}>
            {filteredFaqs.map(faq => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    background: '#FFFFFF',
                    border: isExpanded ? '1.5px solid #059669' : '1.5px solid #E2E8F0',
                    borderRadius: 14,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? '0 4px 16px rgba(5, 150, 105, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '16px 20px',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 14,
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#047857',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: 3
                      }}>
                        {faq.category}
                      </span>
                      <strong style={{ fontSize: 16, color: '#0F2922', lineHeight: 1.4, display: 'block' }}>
                        {faq.question}
                      </strong>
                    </div>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isExpanded ? 'rgba(5, 150, 105, 0.12)' : '#F1F5F9',
                      color: isExpanded ? '#059669' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 20px',
                      color: '#334155',
                      fontSize: 14,
                      lineHeight: 1.65,
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: 14
                    }}>
                      <p style={{ margin: '0 0 12px 0' }}>{faq.answer}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {faq.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              background: '#F1F5F9',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: '#FFFFFF',
                border: '1.5px dashed #CBD5E1',
                borderRadius: 14
              }}>
                <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
                  No FAQs match your search &ldquo;<strong>{faqSearch}</strong>&rdquo;. Try searching for <em>used oil, curry paste, blast chiller,</em> or <em>amoebiasis</em>.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION CTA BAR */}
        {/* ========================================================================= */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          border: '1.5px solid #047857',
          borderRadius: 20,
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.16)'
        }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#ffffff' }}>
              Ready to Upgrade Your Kitchen to 5-Star Compliance?
            </h3>
            <p style={{ margin: 0, fontSize: 13.5, color: '#A7F3D0' }}>
              Run time-phased daily checklists, monitor cold-chain temperatures, and generate your live FoodSafe365 Tabletop Passport.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              className="btn primary"
              style={{
                background: '#FFFFFF',
                borderColor: '#FFFFFF',
                color: '#065F46',
                fontWeight: 700,
                fontSize: 13.5,
                padding: '10px 18px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Onboard Your Restaurant <ArrowRight size={15} />
            </Link>
            <Link
              href="/haccp"
              className="btn secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 13.5,
                padding: '10px 18px',
                textDecoration: 'none'
              }}
            >
              View HACCP Principles →
            </Link>
          </div>
        </div>
      </div>

      {/* Persistent Global Footer */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        background: '#FFFFFF',
        padding: '24px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          maxWidth: 1180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>
            <Link href="/food-safety-why" style={{ color: '#047857', textDecoration: 'none', fontWeight: 600 }}>Food Safety — Why?</Link>
            <Link href="/haccp" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>HACCP Principles</Link>
            <Link href="/contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link>
            <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: '#64748B' }}>
            © {new Date().getFullYear()} FoodSafe365 · Digital Food-Safety Operating System
          </div>
        </div>
      </footer>
    </main>
  );
}
