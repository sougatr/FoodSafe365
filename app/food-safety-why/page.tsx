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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#2b0e04' }}>
      <GlobalHeader />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #240b03 0%, #3e1507 50%, #2b0e04 100%)',
        borderBottom: '1px solid rgba(251, 146, 60, 0.22)',
        paddingTop: 36,
        paddingBottom: 40
      }}>
        <div className="container" style={{ maxWidth: 1180 }}>
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#fed7aa',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                background: 'rgba(251, 146, 60, 0.12)',
                padding: '4px 10px',
                borderRadius: 8,
                border: '1px solid rgba(251, 146, 60, 0.2)'
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
                color: '#fed7aa',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              About FoodSafe365
            </Link>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                fontSize: 11,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 9999,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                🌿 FOOD SAFETY SCIENCE &amp; HYGIENE TRUTHS
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              lineHeight: 1.15,
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 14px',
              letterSpacing: '-0.02em'
            }}>
              Why Food Safety Matters: The Science of Clean Kitchens
            </h1>

            <p style={{
              fontSize: 'clamp(15.5px, 2vw, 17.5px)',
              color: '#fed7aa',
              margin: '0 auto 24px',
              maxWidth: 780,
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              From acute <strong style={{ color: '#ffffff' }}>food poisoning &amp; amoebiasis</strong> to chronic <strong style={{ color: '#ffffff' }}>carcinogens in reheated oils &amp; illegal dyes</strong> — understanding why food contaminates and how 5-star commercial kitchens eliminate risks.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="container" style={{ maxWidth: 1180, paddingTop: 36, paddingBottom: 60 }}>

        {/* ========================================================================= */}
        {/* SECTION 1: THE CAUSES OF FOOD CONTAMINATION & HEALTH HAZARDS */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CRITICAL HEALTH HAZARDS
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', margin: '4px 0 8px' }}>
              Causes of Food Contamination &amp; Their Impact
            </h2>
            <p style={{ color: '#fed7aa', fontSize: 14.5, margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
              Food contamination is not an accident—it happens through specific biological, chemical, and operational failures. Contaminants pose two distinct danger levels:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {/* 1. Short-Term Acute Infections */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderTop: '5px solid #ef4444',
              borderRadius: 18,
              padding: '24px 26px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase' }}>IMMEDIATE IMPACT (Hours to Days)</span>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    Acute Infections &amp; Food Poisoning
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: '#ffedd5', fontSize: 13.5, lineHeight: 1.55 }}>
                <div style={{ background: '#260c03', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.15)' }}>
                  <strong style={{ color: '#f87171', display: 'block', fontSize: 14, marginBottom: 3 }}>
                    🤮 Bacterial Food Poisoning (Salmonella, Staph, E. coli)
                  </strong>
                  Strikes within 30 minutes to 8 hours. Caused by temperature abuse, contaminated chicken/eggs, and unwashed staff hands. Bacteria multiply exponentially, releasing toxins that trigger projectile vomiting, explosive diarrhea, fever, and extreme dehydration.
                </div>

                <div style={{ background: '#260c03', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.15)' }}>
                  <strong style={{ color: '#fb923c', display: 'block', fontSize: 14, marginBottom: 3 }}>
                    🦠 Amoebiasis &amp; Amoebic Dysentery (Entamoeba histolytica)
                  </strong>
                  Enters when staff carrying protozoan cysts handle food without proper hand sanitization, or when raw salads and chutneys are washed in contaminated non-potable water. Causes severe bloody mucosal colitis, painful cramps, and life-threatening amoebic liver abscesses.
                </div>

                <div style={{ background: '#260c03', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.15)' }}>
                  <strong style={{ color: '#fde68a', display: 'block', fontSize: 14, marginBottom: 3 }}>
                    🍚 Fried Rice Bacillus cereus Syndrome
                  </strong>
                  Leaving cooked rice or boiled noodles cooling slowly at room temperature triggers dormant Bacillus cereus spores to germinate. They produce heat-stable enterotoxins that resist subsequent wok heating.
                </div>
              </div>
            </div>

            {/* 2. Long-Term Chronic & Carcinogenic Hazards */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderTop: '5px solid #f59e0b',
              borderRadius: 18,
              padding: '24px 26px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertOctagon size={24} />
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fde68a', textTransform: 'uppercase' }}>CHRONIC IMPACT (Months to Years)</span>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                    Carcinogens, Dyes &amp; Chemical Toxins
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: '#ffedd5', fontSize: 13.5, lineHeight: 1.55 }}>
                <div style={{ background: '#260c03', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.15)' }}>
                  <strong style={{ color: '#f87171', display: 'block', fontSize: 14, marginBottom: 3 }}>
                    🧪 Toxic Artificial Colors (Rhodamine B &amp; Metanil Yellow)
                  </strong>
                  Non-permitted industrial textile dyes used to impart neon red/yellow in chicken tandoori, Gobi Manchurian, and sweets. Severely toxic to the liver and kidneys; proven to damage cellular DNA and cause gastrointestinal and urinary tract cancers.
                </div>

                <div style={{ background: '#260c03', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.15)' }}>
                  <strong style={{ color: '#fb923c', display: 'block', fontSize: 14, marginBottom: 3 }}>
                    🔥 Repeatedly Reheated Oil (Total Polar Compounds &gt; 25%)
                  </strong>
                  Commercial deep fryers reused across multiple days accumulate Total Polar Compounds (TPC), acrylamide, and carcinogenic polycyclic aromatic hydrocarbons (PAHs). Directly linked to atherosclerosis, severe hypertension, and colorectal carcinoma.
                </div>

                <div style={{ background: '#260c03', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.15)' }}>
                  <strong style={{ color: '#fde68a', display: 'block', fontSize: 14, marginBottom: 3 }}>
                    🍲 Old Fermenting Curry Pastes &amp; Ajinomoto Abuse
                  </strong>
                  Reusing multi-day onion-tomato gravies that sat in warm conditions breeds anaerobic bacteria. Heavy doses of non-food grade MSG (Ajinomoto) and artificial preservatives used to mask sour, spoiled gravies cause severe mucosal erosion and gut dysbiosis.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1.5: FLOWCHARTS & TABLES: HOW & WHY ACUTE INFECTIONS OCCUR */}
        {/* ========================================================================= */}
        <section style={{ marginBottom: 48 }}>
          <div style={{
            background: 'linear-gradient(135deg, #351206 0%, #290d04 100%)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 20,
            padding: '28px 24px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)'
          }}>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(239, 68, 68, 0.35)'
              }}>
                <Microscope size={22} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  RAPID DIAGNOSTIC FLOW
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  Acute Short-Term Infections: How &amp; Why
                </h3>
              </div>
            </div>

            {/* FLOWCHART 1: THE "HOW" (Biological Mechanisms) */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={16} /> Flowchart 1: How Pathogens Attack the Human Body
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Flow 1: Intoxication */}
                <div style={{
                  background: '#220b03',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 12.5
                }}>
                  <span style={{ background: '#ef4444', color: '#ffffff', fontWeight: 800, padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>
                    INTOXICATION (30m–6h)
                  </span>
                  <span style={{ color: '#fed7aa' }}>Food left at room temp</span>
                  <span style={{ color: '#f87171', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa' }}>Staph / B. cereus secretes heat-stable toxins</span>
                  <span style={{ color: '#f87171', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa' }}>Vagus nerve stimulation</span>
                  <span style={{ color: '#f87171', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fca5a5', fontWeight: 700, background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                    Severe Projectile Vomiting
                  </span>
                </div>

                {/* Flow 2: Infection */}
                <div style={{
                  background: '#220b03',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 12.5
                }}>
                  <span style={{ background: '#f97316', color: '#ffffff', fontWeight: 800, padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>
                    INFECTION (6h–48h)
                  </span>
                  <span style={{ color: '#fed7aa' }}>Undercooked poultry / cross-contamination</span>
                  <span style={{ color: '#fb923c', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa' }}>Live Salmonella/E. coli survives stomach acid</span>
                  <span style={{ color: '#fb923c', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa' }}>Intestinal mucosal invasion &amp; IL-8 storm</span>
                  <span style={{ color: '#fb923c', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa', fontWeight: 700, background: 'rgba(249, 115, 22, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                    High Fever &amp; Cramping Diarrhea
                  </span>
                </div>

                {/* Flow 3: Amoebiasis */}
                <div style={{
                  background: '#220b03',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 12.5
                }}>
                  <span style={{ background: '#eab308', color: '#1f2937', fontWeight: 800, padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>
                    AMOEBIASIS (Days–Weeks)
                  </span>
                  <span style={{ color: '#fed7aa' }}>Unwashed salad / raw water / unwashed hands</span>
                  <span style={{ color: '#facc15', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa' }}>Ingest E. histolytica cysts</span>
                  <span style={{ color: '#facc15', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fed7aa' }}>Excysts in ileum; trophozoites lyse mucosa</span>
                  <span style={{ color: '#facc15', fontWeight: 800 }}>➔</span>
                  <span style={{ color: '#fef08a', fontWeight: 700, background: 'rgba(234, 179, 8, 0.2)', padding: '2px 8px', borderRadius: 6 }}>
                    Amoebic Dysentery &amp; Liver Abscess
                  </span>
                </div>
              </div>
            </div>

            {/* FLOWCHART 2: THE "WHY" (Kitchen Vectors) */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UtensilsCrossed size={16} /> Flowchart 2: Why Infections Occur in Commercial Kitchens
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12
              }}>
                <div style={{ background: '#1e0902', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: '#f87171', fontWeight: 800, fontSize: 12, marginBottom: 4 }}>1. DANGER ZONE ABUSE</div>
                  <div style={{ color: '#fed7aa', fontSize: 12, lineHeight: 1.4 }}>
                    Cooked food held between 5°C–60°C ➔ <strong>Bacteria doubles every 20 mins</strong> ➔ Microbial bloom
                  </div>
                </div>

                <div style={{ background: '#1e0902', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: '#fb923c', fontWeight: 800, fontSize: 12, marginBottom: 4 }}>2. CROSS-CONTAMINATION</div>
                  <div style={{ color: '#fed7aa', fontSize: 12, lineHeight: 1.4 }}>
                    Raw poultry knife used on salad ➔ <strong>No cooking step</strong> ➔ Live pathogens directly ingested
                  </div>
                </div>

                <div style={{ background: '#1e0902', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: '#facc15', fontWeight: 800, fontSize: 12, marginBottom: 4 }}>3. FECAL-ORAL VECTOR</div>
                  <div style={{ color: '#fed7aa', fontSize: 12, lineHeight: 1.4 }}>
                    Restroom visit without 20s soap scrub ➔ <strong>Microscopic cysts under nails</strong> ➔ Transferred to food
                  </div>
                </div>

                <div style={{ background: '#1e0902', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: '#34d399', fontWeight: 800, fontSize: 12, marginBottom: 4 }}>4. SLOW AMBIENT COOLING</div>
                  <div style={{ color: '#fed7aa', fontSize: 12, lineHeight: 1.4 }}>
                    Large pot cooled slowly on floor ➔ <strong>Heat shock awakens spores</strong> ➔ Toxins generated
                  </div>
                </div>

                <div style={{ background: '#1e0902', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 12, marginBottom: 4 }}>5. UNTREATED WATER / ICE</div>
                  <div style={{ color: '#fed7aa', fontSize: 12, lineHeight: 1.4 }}>
                    Unfiltered tap water for mint chutney &amp; bar ice ➔ <strong>Cysts &amp; coliforms</strong> ➔ Direct infection
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE 2: KITCHEN FAILURE VS FOODSAFE365 CONTROL */}
            <div style={{ overflowX: 'auto' }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Table 2: Kitchen Failure Point vs. FoodSafe365 Preventive Rule
              </h4>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12.5,
                color: '#fed7aa',
                background: '#220b03',
                borderRadius: 12,
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#1a0701', borderBottom: '1.5px solid rgba(251, 146, 60, 0.25)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', color: '#ffffff' }}>Failure Point</th>
                    <th style={{ padding: '10px 14px', color: '#ffffff' }}>Biological Risk</th>
                    <th style={{ padding: '10px 14px', color: '#ffffff' }}>FoodSafe365 Control</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(251, 146, 60, 0.12)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>Holding gravies at room temperature</td>
                    <td style={{ padding: '10px 14px' }}>Danger Zone bacterial doubling (5°C–60°C)</td>
                    <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }}>Strict 2-hour discard rule &amp; &lt;5°C refrigeration check</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(251, 146, 60, 0.12)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>Shared knives &amp; chopping boards</td>
                    <td style={{ padding: '10px 14px' }}>Cross-contamination to raw ready-to-eat salads</td>
                    <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }}>6-Color board matrix (Yellow = Poultry, Green = Veg)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(251, 146, 60, 0.12)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>Slow ambient cooling of deep pots</td>
                    <td style={{ padding: '10px 14px' }}>Dormant spore germination (B. cereus / C. perfringens)</td>
                    <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }}>Blast chilling &lt;90 mins or shallow pans in ice-baths</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(251, 146, 60, 0.12)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>Poor hand hygiene post-restroom</td>
                    <td style={{ padding: '10px 14px' }}>Fecal-oral transmission of Amoebiasis &amp; E. coli</td>
                    <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }}>Stocked sink check + Form 1A semi-annual stool test</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ffffff' }}>Untreated tap water for ice/chutneys</td>
                    <td style={{ padding: '10px 14px' }}>Protozoan cyst &amp; coliform ingestion</td>
                    <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }}>Certified RO filtration &amp; sanitized ice machines</td>
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
            <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LUXURY HOSPITALITY BENCHMARKS
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', margin: '4px 0 8px' }}>
              Best Practices Followed in 5-Star Kitchens
            </h2>
            <p style={{ color: '#fed7aa', fontSize: 14.5, margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
              How luxury properties like Taj, Oberoi, Marriott, and Michelin-rated restaurants ensure that hundreds of meals are prepared daily with zero risk of foodborne contamination:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {/* 1. Blast Chilling */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 16,
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  1. Blast Chilling (&lt;90 Min Rule)
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.45, margin: 0 }}>
                Crashes hot core temperature from 70°C to &lt;3°C within 90 minutes, completely bypassing the bacterial danger zone.
              </p>
            </div>

            {/* 2. Color-Coded Board Matrix */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 16,
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  2. 6-Color Chopping Matrix
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.45, margin: 0 }}>
                Strict color segregation: Red (Meat), Yellow (Poultry), Blue (Fish), Green (Produce), White (Dairy), Brown (Cooked).
              </p>
            </div>

            {/* 3. FIFO & Day-Dot Expiry */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 16,
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  3. FIFO &amp; Day-Dot System
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.45, margin: 0 }}>
                Color-coded weekday dot stickers stamped with prep time, chef initials, and strict 48-hour discard deadlines.
              </p>
            </div>

            {/* 4. Digital Core Temp Probes */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 16,
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Thermometer size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  4. Core Temperature Probing
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.45, margin: 0 }}>
                Calibrated needle probes log internal cooking core (≥75°C), hot holding (≥63°C), and cold storage (&lt;4°C).
              </p>
            </div>

            {/* 5. Cooking Oil TPC Testing */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 16,
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplets size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  5. Digital Oil TPC Meters
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.45, margin: 0 }}>
                Twice-daily digital testing (Testo 270); discarded for biodiesel recycling the moment Total Polar Compounds hit 24%.
              </p>
            </div>

            {/* 6. Medical Fitness & PPM Sanitizers */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 16,
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartPulse size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                  6. Medical Clearance (Form 1A)
                </h4>
              </div>
              <p style={{ fontSize: 13, color: '#fed7aa', lineHeight: 1.45, margin: 0 }}>
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
            <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', margin: '6px 0 8px' }}>
              Common Questions on Food Safety, Toxins &amp; Hygiene
            </h2>
            <p style={{ color: '#fed7aa', fontSize: 14.5, margin: '0 0 20px', lineHeight: 1.5 }}>
              Search any food safety topic, chemical risk, or kitchen practice to see verified guidelines:
            </p>

            {/* Search Input Filter Box */}
            <div style={{
              background: '#361205',
              border: '2px solid #ea580c',
              borderRadius: 16,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              maxWidth: 620,
              margin: '0 auto 16px'
            }}>
              <Search size={20} color="#fb923c" style={{ flexShrink: 0 }} />
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
                  color: '#ffffff'
                }}
              />
              {faqSearch && (
                <button
                  type="button"
                  onClick={() => setFaqSearch('')}
                  style={{ background: 'none', border: 'none', color: '#fed7aa', cursor: 'pointer', fontSize: 13 }}
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
                    background: activeCategory === cat ? '#059669' : '#361205',
                    border: activeCategory === cat ? '1.5px solid #34d399' : '1.5px solid rgba(251, 146, 60, 0.25)',
                    color: activeCategory === cat ? '#ffffff' : '#fed7aa',
                    padding: '4px 12px',
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
                    background: isExpanded ? '#381306' : '#321005',
                    border: isExpanded ? '1.5px solid #fb923c' : '1px solid rgba(251, 146, 60, 0.2)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? '0 8px 24px rgba(0,0,0,0.35)' : 'none'
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
                        color: '#fb923c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: 3
                      }}>
                        {faq.category}
                      </span>
                      <strong style={{ fontSize: 16, color: '#ffffff', lineHeight: 1.4, display: 'block' }}>
                        {faq.question}
                      </strong>
                    </div>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isExpanded ? '#ea580c' : 'rgba(251, 146, 60, 0.15)',
                      color: '#ffffff',
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
                      color: '#ffedd5',
                      fontSize: 14,
                      lineHeight: 1.65,
                      borderTop: '1px solid rgba(251, 146, 60, 0.15)',
                      paddingTop: 14
                    }}>
                      <p style={{ margin: '0 0 12px 0' }}>{faq.answer}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {faq.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              background: '#220b03',
                              color: '#fed7aa',
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
                background: '#321005',
                border: '1.5px dashed rgba(251, 146, 60, 0.3)',
                borderRadius: 14
              }}>
                <p style={{ color: '#fed7aa', fontSize: 14, margin: 0 }}>
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
          background: 'linear-gradient(135deg, #381306 0%, #4a1908 100%)',
          border: '1.5px solid rgba(251, 146, 60, 0.3)',
          borderRadius: 20,
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#ffffff' }}>
              Ready to Upgrade Your Kitchen to 5-Star Compliance?
            </h3>
            <p style={{ margin: 0, fontSize: 13.5, color: '#fed7aa' }}>
              Run time-phased daily checklists, monitor cold-chain temperatures, and generate your live FoodSafe365 Tabletop Passport.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              className="btn primary"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#047857',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13.5,
                padding: '10px 18px',
                textDecoration: 'none'
              }}
            >
              Onboard Your Restaurant <ArrowRight size={15} />
            </Link>
            <Link
              href="/haccp"
              className="btn secondary"
              style={{
                background: '#2b0e04',
                borderColor: 'rgba(251, 146, 60, 0.3)',
                color: '#fed7aa',
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
        borderTop: '1px solid rgba(251, 146, 60, 0.2)',
        background: '#1d0903',
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
            <Link href="/about" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>
            <Link href="/food-safety-why" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>Food Safety — Why?</Link>
            <Link href="/haccp" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>HACCP Principles</Link>
            <Link href="/contact" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link>
            <Link href="/privacy" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: '#fb923c' }}>
            © {new Date().getFullYear()} FoodSafe365 · Digital Food-Safety Operating System
          </div>
        </div>
      </footer>
    </main>
  );
}
