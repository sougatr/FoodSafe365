'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle2,
  Star,
  Clock,
  ShieldCheck,
  Wrench,
  Search,
  Calendar,
  Phone,
  User,
  MapPin,
  X,
  ArrowRight,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Bug,
  Flame,
  Droplets,
  Building2,
  Award,
  Send,
  Check,
  TrendingUp,
  FileCheck,
  Home,
  Mail,
  KeyRound,
  UtensilsCrossed,
  Smartphone
} from 'lucide-react';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  AuditTrailEvent
} from '@/lib/foodsafety28';
import ThemeToggle from '@/components/ThemeToggle';
import GlobalHeader from '@/components/GlobalHeader';

export type ServiceCategory =
  | 'all'
  | 'pest-control'
  | 'deep-cleaning'
  | 'waste-management'
  | 'cooking-oil'
  | 'water-testing'
  | 'food-testing'
  | 'calibration'
  | 'hvac'
  | 'equipment'
  | 'garbage-bags'
  | 'fire-safety'
  | 'ppe-hygiene'
  | 'occupational-health'
  | 'hygiene-engineering';

export type ServiceItem = {
  id: string;
  category: ServiceCategory;
  categoryLabel: string;
  icon: string;
  title: string;
  rating: string;
  reviewCount: string;
  tat: string; // Turn-around time
  badge?: string;
  description: string;
  inclusions: string[];
  resolvesChecks: string[];
  complianceStandard: string;
};

const CATEGORIES: { id: ServiceCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Services', icon: '✨' },
  { id: 'pest-control', label: 'Pest Control', icon: '🪲' },
  { id: 'deep-cleaning', label: 'Deep Cleaning Services', icon: '🧼' },
  { id: 'waste-management', label: 'Waste-management companies', icon: '♻️' },
  { id: 'cooking-oil', label: 'Used cooking-oil collectors', icon: '🛢️' },
  { id: 'water-testing', label: 'Water-testing laboratories', icon: '💧' },
  { id: 'food-testing', label: 'Food-testing laboratories', icon: '🧪' },
  { id: 'calibration', label: 'Calibration agencies', icon: '⚖️' },
  { id: 'hvac', label: 'Refrigeration/HVAC technicians', icon: '❄️' },
  { id: 'equipment', label: 'Kitchen equipment service', icon: '🔧' },
  { id: 'garbage-bags', label: 'Garbage/Sullage Bag Supplier', icon: '🗑️' },
  { id: 'fire-safety', label: 'Fire-safety providers', icon: '🧯' },
  { id: 'ppe-hygiene', label: 'PPE & hygiene suppliers', icon: '🧤' },
  { id: 'occupational-health', label: 'Occupational health providers', icon: '🩺' },
  { id: 'hygiene-engineering', label: 'Kitchen hygiene/engineering services', icon: '🏗️' }
];

const SERVICES: ServiceItem[] = [
  // 1. PEST CONTROL
  {
    id: 'srv-pest-emergency',
    category: 'pest-control',
    categoryLabel: 'Pest Control',
    icon: '🪲',
    title: 'Emergency Kitchen Pest Extermination & German Cockroach Gel Baiting',
    rating: '4.9',
    reviewCount: '3,410',
    tat: 'Arrives within 2 hours for active infestation',
    badge: '100% Food-Safe Chemicals',
    description: 'Rapid-response extermination and barrier application using odorless, non-toxic Bayer gel and micro-encapsulated spray safe for food preparation zones.',
    inclusions: [
      'Complete inspection of dark corners, motor housings, drains, and dry storage (#21)',
      'Odorless German cockroach gel baiting in all electrical points and joints',
      'Drain flushing with bio-enzymatic pest-repelling wash',
      'Digital Pest Elimination Certificate for manager verification & audit records',
      '30-day warranty with free re-treatment if pests reappear'
    ],
    resolvesChecks: ['Check #21: Signs of Pests', 'Check #22: Fly-Catchers & Pest Bait Stations'],
    complianceStandard: 'FSSAI Schedule 4 Integrated Pest Management (IPM)'
  },
  {
    id: 'srv-pest-amc',
    category: 'pest-control',
    categoryLabel: 'Pest Control',
    icon: '🛡️',
    title: 'Annual Pest Management AMC with Rodent Stations & ILT Servicing',
    rating: '4.8',
    reviewCount: '1,120',
    tat: 'Scheduled monthly visits + free on-call emergency visits',
    badge: 'Complete IPM Vendor Contract',
    description: 'Routine scheduled preventive pest management contract covering rodent baiting, fly management, and regulatory compliance paperwork.',
    inclusions: [
      'Monthly audit and chemical rotation service per CIB&RC regulations',
      'Tamper-resistant rodent bait stations placed at kitchen perimeter',
      'Insect Light Trap (ILT) maintenance & UV bulb/glue pad replacements (#22)',
      'Service Logbook kept on-site with MSDS chemical safety data sheets',
      'FSSAI inspection audit defense representation'
    ],
    resolvesChecks: ['Check #21: Signs of Pests', 'Check #22: Fly-Catchers & Pest Bait Stations'],
    complianceStandard: 'FSSAI Schedule 4 Annual Pest Maintenance Requirement'
  },

  // 2. DEEP CLEANING SERVICES
  {
    id: 'srv-deep-exhaust',
    category: 'deep-cleaning',
    categoryLabel: 'Deep Cleaning Services',
    icon: '🧼',
    title: 'Commercial Kitchen Exhaust Hood & Grease Duct Steam Cleaning',
    rating: '4.9',
    reviewCount: '2,890',
    tat: 'After-hours / Night shift service (4–6 hours)',
    badge: 'Fire Safety & Hygiene',
    description: 'Intensive commercial cleaning by trained kitchen sanitation crews targeting burnt grease, exhaust filters, under-counter grime, and floor drains.',
    inclusions: [
      'Exhaust hood baffle filters soaked in heavy degreaser and high-pressure steam washed',
      'Duct interior grease scraping to eliminate kitchen fire hazards',
      'Behind and under heavy equipment floor scrub with food-grade sanitiser',
      'Floor drain descaling and bio-enzymatic odor neutralization',
      'Before/After photo audit report uploaded for compliance verification'
    ],
    resolvesChecks: ['Check #1: Clean & Clutter-Free Counters & Floors', 'Check #2: Drains Flowing Freely'],
    complianceStandard: 'FSSAI Schedule 4 Premises Sanitation & Fire Safety Standards'
  },
  {
    id: 'srv-deep-kitchen',
    category: 'deep-cleaning',
    categoryLabel: 'Deep Cleaning Services',
    icon: '✨',
    title: 'Kitchen Floor, Wall & Equipment Deep Degreasing Sanitation',
    rating: '4.85',
    reviewCount: '1,420',
    tat: 'Scheduled weekend or off-peak shift',
    badge: 'FSSAI Deep Sanitation Protocol',
    description: 'Deep mechanical scrubbing of tiled walls, grouting, slip-resistant floors, and prep tables using NSF-certified food-grade detergents.',
    inclusions: [
      'Tile grout descaling and steam sanitization across all cooking lines',
      'Heavy degreasing of prep tables, under-shelves, and storage racks',
      'Stainless steel surface polish with food-grade sanitizing wash',
      'Sanitary swab test validation post-cleaning',
      'Digital sanitation checklist signed by master cleaning supervisor'
    ],
    resolvesChecks: ['Check #1: Counters, Floors & Prep Areas Clean', 'Check #15: Food-Contact Equipment Cleaned'],
    complianceStandard: 'FSSAI Good Hygiene Practices (GHP)'
  },

  // 3. WASTE-MANAGEMENT COMPANIES
  {
    id: 'srv-waste-mgmt',
    category: 'waste-management',
    categoryLabel: 'Waste-management companies',
    icon: '♻️',
    title: 'Commercial Kitchen Solid & Wet Waste Segregation & Bio-Compost Collection',
    rating: '4.85',
    reviewCount: '780',
    tat: 'Daily scheduled morning & evening pickups',
    badge: 'Pollution Control Board Authorized',
    description: 'Authorized wet and dry waste management service ensuring kitchen segregation, odor-free collection, and verifiable disposal certificates.',
    inclusions: [
      'Daily bio-degradable wet waste pickup from kitchen premises',
      'Segregated dry waste sorting and authorized recycling dispatch',
      'Sanitization of waste staging bins and collection point',
      'Monthly Waste Disposal Certificate for municipality and FDA inspections',
      'Composting and green audit compliance report'
    ],
    resolvesChecks: ['Check #23: Kitchen Dustbins Covered & Outside Garbage Area Clean'],
    complianceStandard: 'Solid Waste Management Rules 2016 & FSSAI Schedule 4'
  },

  // 4. USED COOKING-OIL COLLECTORS
  {
    id: 'srv-ruco-oil',
    category: 'cooking-oil',
    categoryLabel: 'Used cooking-oil collectors',
    icon: '🛢️',
    title: 'FSSAI RUCO Certified Used Cooking Oil (UCO) Collection & Biodiesel Conversion',
    rating: '4.9',
    reviewCount: '1,340',
    tat: 'Scheduled weekly pickup · Immediate RUCO certificate',
    badge: 'FSSAI RUCO Empaneled Aggregator',
    description: 'Empaneled Used Cooking Oil (UCO) collector under FSSAI RUCO initiative. Collects degraded frying oil (TPC > 25%) and provides official sale vouchers for biodiesel production.',
    inclusions: [
      'Free food-grade leakproof collection drums provided on-site',
      'On-site Total Polar Compounds (TPC) tester verification before collection',
      'Official RUCO Purchase Voucher issued for every batch collected',
      'Direct traceability documentation to protect restaurant against illegal resale',
      'Free monthly frying oil management guidelines and disposal log'
    ],
    resolvesChecks: ['Check #12: Safe Oil Quality (FSSAI RUCO Limit TPC ≤ 25%)'],
    complianceStandard: 'FSSAI RUCO (Repurpose Used Cooking Oil) Regulation'
  },

  // 5. WATER-TESTING LABORATORIES
  {
    id: 'srv-water-testing',
    category: 'water-testing',
    categoryLabel: 'Water-testing laboratories',
    icon: '💧',
    title: 'Drinking & Cooking Water Potability Testing (BIS IS 10500 NABL Lab)',
    rating: '4.9',
    reviewCount: '1,420',
    tat: 'Sterile sample pickup · NABL Lab report in 48 hrs',
    badge: 'NABL Accredited Lab Report',
    description: 'Mandatory testing for restaurant cooking, ice-making, and drinking water per Bureau of Indian Standards IS 10500:2012.',
    inclusions: [
      'Sterile on-site water sample collection by certified lab phlebotomist',
      'Microbiological parameters: E. coli, Total Coliforms, Faecal streptococci',
      'Chemical parameters: TDS, pH, Hardness, Free Residual Chlorine, Heavy metals',
      'NABL Accredited Laboratory Test Report with QR verification code',
      'FSSAI audit-compliant potability certificate'
    ],
    resolvesChecks: ['Check #4: Hand-wash Station Water', 'Safe Drinking Water at Catering / Prep'],
    complianceStandard: 'FSSAI Section 2.1.3 & BIS IS 10500:2012 Drinking Water Standards'
  },

  // 6. FOOD-TESTING LABORATORIES
  {
    id: 'srv-food-pathogen-test',
    category: 'food-testing',
    categoryLabel: 'Food-testing laboratories',
    icon: '🧪',
    title: 'Cooked Food & Ingredient Pathogen Laboratory Analysis (NABL Lab)',
    rating: '4.95',
    reviewCount: '1,150',
    tat: 'Sample pickup · Complete micro report in 72 hrs',
    badge: 'NABL Accredited (ISO/IEC 17025)',
    description: 'Comprehensive microbiological and chemical screening of prepared foods, raw meats, dairy, and gravies for foodborne pathogens.',
    inclusions: [
      'Sterile insulated cold-chain sample transit to NABL laboratory',
      'Quantitative pathogen testing: Salmonella, E. coli, Listeria monocytogenes, Bacillus cereus',
      'Total Plate Count (TPC) and Yeast/Mold enumeration',
      'Official NABL Certificate of Analysis with digital verification QR',
      'Direct compliance upload to restaurant audit locker'
    ],
    resolvesChecks: ['Check #9: Raw Material Quality Check', 'Check #19: Cooking Temperature & Pathogen Kill'],
    complianceStandard: 'FSSAI Food Safety and Standards (Contaminants, Toxins & Residues) Regulations'
  },
  {
    id: 'srv-surface-swab-test',
    category: 'food-testing',
    categoryLabel: 'Food-testing laboratories',
    icon: '🧫',
    title: 'Kitchen Surface Swab & Cutting Board Microbial Safety Analysis',
    rating: '4.85',
    reviewCount: '680',
    tat: 'Sample collection · Report in 48 hrs',
    badge: 'HACCP Hygiene Validation',
    description: 'Microbiological surface swab testing for chopping boards, prep counters, slicers, and ice-makers to verify sanitation efficacy.',
    inclusions: [
      'Sterile swab collection from 5 high-risk food contact surfaces',
      'Aerobic Plate Count (APC) and Coliform count analysis',
      'Listeria monocytogenes and Staphylococcus aureus screening',
      'Sanitation effectiveness certification for HACCP audit compliance',
      'Detailed hygiene corrective recommendation report'
    ],
    resolvesChecks: ['Check #1: Food Prep Area Cleanliness', 'Check #14: Color-Coded Cutting Boards'],
    complianceStandard: 'FSSAI Good Hygiene Practices (GHP) & ISO 22000'
  },

  // 7. CALIBRATION AGENCIES
  {
    id: 'srv-calibration-service',
    category: 'calibration',
    categoryLabel: 'Calibration agencies',
    icon: '⚖️',
    title: 'NABL-Traceable Thermometer & Temperature Probe Calibration',
    rating: '4.9',
    reviewCount: '620',
    tat: 'On-site calibration · Certificates same day',
    badge: 'NABL Traceable Certificate',
    description: 'Precision calibration of kitchen thermometers, needle probes, walk-in digital controllers, and infrared guns against NABL-traceable reference standards.',
    inclusions: [
      '3-point calibration test at cold (-18°C), chilled (4°C), and cooking (75°C) points',
      'Official Calibration Certificate with serial number and validity sticker',
      'Error margin tolerance calculation and instrument adjustment',
      'Required documentation for FSSAI and HACCP compliance files',
      '12-month recalibration reminder scheduled in FoodSafe365'
    ],
    resolvesChecks: ['Check #17: Fridge (<5°C)', 'Check #18: Freezer (<-18°C)', 'Check #19: Cooking Core Temp (≥75°C)'],
    complianceStandard: 'FSSAI Schedule 4 Equipment Calibration Mandate'
  },

  // 8. REFRIGERATION/HVAC TECHNICIANS
  {
    id: 'srv-refrigeration-repair',
    category: 'hvac',
    categoryLabel: 'Refrigeration/HVAC technicians',
    icon: '❄️',
    title: 'Cool Room (<5°C) & Cold Room (<-18°C) Emergency Breakdown Repair',
    rating: '4.88',
    reviewCount: '870',
    tat: 'Arrives within 2 hours (Emergency temperature restoration)',
    badge: 'Cold Chain Rescue',
    description: 'Certified commercial HVAC & refrigeration technician for Cool Rooms (<5°C) and Cold Rooms (<-18°C), walk-ins, reach-in chillers, and compressor repairs.',
    inclusions: [
      'Compressor gas pressure, condenser coil cleaning, and thermostat repair',
      'Magnetic door gasket seal inspection and on-site replacement',
      'Defrost cycle testing and fan motor servicing',
      'Emergency temperature restoration before perishable stock abuse occurs',
      'Service report with pre/post temperature telemetry log'
    ],
    resolvesChecks: ['Check #17: Refrigerator Storage (< 5°C)', 'Check #18: Deep Freezer Storage (< −18°C)'],
    complianceStandard: 'FSSAI Schedule 4 Cold Chain Storage Regulations'
  },
  {
    id: 'srv-hvac-amc',
    category: 'hvac',
    categoryLabel: 'Refrigeration/HVAC technicians',
    icon: '⚙️',
    title: 'Commercial Refrigeration & Walk-In Compressor Quarterly AMC',
    rating: '4.8',
    reviewCount: '510',
    tat: 'Quarterly comprehensive servicing visits',
    badge: 'Zero Spoilage Guarantee',
    description: 'Preventive maintenance contract for commercial chillers, freezers, ice machines, and cold storage to avert unexpected compressor burnout.',
    inclusions: [
      'Chemical cleaning of condenser coils and evaporator fin combs',
      'Refrigerant leak detection and pressure check',
      'Electrical connection tightening and thermostat accuracy test',
      'Priority 2-hour emergency breakdown response included',
      'Quarterly health certificate issued for food safety audits'
    ],
    resolvesChecks: ['Check #17: Refrigerator Storage (< 5°C)', 'Check #18: Deep Freezer Storage (< −18°C)'],
    complianceStandard: 'Preventive Food Safety Equipment Maintenance'
  },

  // 9. KITCHEN EQUIPMENT SERVICE
  {
    id: 'srv-equipment-maintenance',
    category: 'equipment',
    categoryLabel: 'Kitchen equipment service',
    icon: '🔧',
    title: 'Commercial Cooking Range, Combi-Oven & Dishwasher Servicing',
    rating: '4.85',
    reviewCount: '940',
    tat: 'On-site technician within 3 hours',
    badge: 'Certified Kitchen Engineers',
    description: 'Maintenance and repair for heavy commercial kitchen appliances including gas burners, combi-ovens, fryers, slicers, and pass-through dishwashers.',
    inclusions: [
      'Burner flame nozzle cleaning, gas pressure regulation, and leak detection',
      'High-temperature dishwasher chemical dispenser calibration (final rinse ≥ 82°C)',
      'Slicer, mixer, and food processor blade inspection and sanitization check',
      'Genuine OEM replacement parts with 90-day warranty',
      'Equipment health report for kitchen insurance and safety audits'
    ],
    resolvesChecks: ['Check #15: Shared Tools & Food-Contact Equipment', 'Check #19: Cooking Equipment Performance'],
    complianceStandard: 'Commercial Kitchen Equipment Safety Standards'
  },

  // 10. GARBAGE/SULLAGE BAG SUPPLIER
  {
    id: 'srv-garbage-bags-supply',
    category: 'garbage-bags',
    categoryLabel: 'Garbage/Sullage Bag Supplier',
    icon: '🗑️',
    title: 'Heavy-Duty Biodegradable Wet/Dry Garbage & Sullage Bags (Color-Coded)',
    rating: '4.8',
    reviewCount: '630',
    tat: 'Same-day bulk kitchen delivery',
    badge: '100% CPCB Certified Biodegradable',
    description: 'Puncture-resistant, leak-proof garbage and sullage bags color-coded for kitchen waste segregation (Green for wet/food, Black for dry/packaging).',
    inclusions: [
      'Heavy-duty 50+ micron tear-proof bags resistant to hot liquids and kitchen bones',
      'CPCB (Central Pollution Control Board) certified compostable & biodegradable',
      'Green bags for organic prep waste and Black bags for inorganic packaging',
      'Bulk pack options with dispenser boxes for kitchen waste stations',
      'Prevents bin leakage, odor release, and pest attraction'
    ],
    resolvesChecks: ['Check #23: Covered Kitchen Dustbins & Outside Waste Storage'],
    complianceStandard: 'CPCB Plastic Waste Management Regulations 2021'
  },

  // 11. FIRE-SAFETY PROVIDERS
  {
    id: 'srv-fire-safety-kitchen',
    category: 'fire-safety',
    categoryLabel: 'Fire-safety providers',
    icon: '🧯',
    title: 'Kitchen Wet Chemical (Class K/F) Fire Extinguisher & Hood Suppression Servicing',
    rating: '4.9',
    reviewCount: '1,280',
    tat: 'Annual servicing & on-site inspection within 24 hrs',
    badge: 'Certified Fire Safety Engineers',
    description: 'Specialized commercial kitchen fire safety: Wet Chemical (Class F/K) extinguishers for hot cooking oil fires and automatic exhaust hood suppression system maintenance.',
    inclusions: [
      'Inspection and hydraulic pressure testing of Class K/F Wet Chemical extinguishers',
      'Automatic fusible link and nozzle inspection over cooking ranges and fryers',
      'Fire safety certificate and inspection tags affixed to all kitchen equipment',
      'Kitchen staff training on operating fire blankets and suppression triggers',
      'Form 15/Annual Fire Safety Audit compliance documentation'
    ],
    resolvesChecks: ['Kitchen Fire Safety & Exhaust Hood Compliance'],
    complianceStandard: 'National Building Code (NBC) Part 4 & BIS 15683 Fire Standards'
  },

  // 12. PPE & HYGIENE SUPPLIERS
  {
    id: 'srv-ppe-hygiene-supplies',
    category: 'ppe-hygiene',
    categoryLabel: 'PPE & hygiene suppliers',
    icon: '🧤',
    title: 'Food-Grade Nitrile Gloves, Hairnets, Aprons & Touchless Sanitizer Supplies',
    rating: '4.85',
    reviewCount: '1,670',
    tat: 'Next-day restaurant door delivery',
    badge: 'Food-Grade Certified PPE',
    description: 'Certified protective wear and kitchen hygiene consumables including powder-free nitrile gloves, non-woven hairnets, heavy-duty aprons, and tissue rolls.',
    inclusions: [
      'Powder-free food-contact certified blue nitrile gloves (all sizes)',
      'Breathable bouffant hairnets and beard covers for food handlers',
      'Waterproof heavy-duty kitchen aprons and slip-resistant footwear',
      'Multi-fold absorbent paper tissue rolls and wall-mounted dispensers',
      'WHO-formulation alcohol hand sanitizers and antibacterial hand soaps'
    ],
    resolvesChecks: ['Check #4: Hand-wash Stations Soap & Tissue', 'Check #6: Clean Uniform, Apron & Hairnet'],
    complianceStandard: 'FSSAI Personal Hygiene Mandate Section 3.2'
  },

  // 13. OCCUPATIONAL HEALTH PROVIDERS
  {
    id: 'srv-medical-camp',
    category: 'occupational-health',
    categoryLabel: 'Occupational health providers',
    icon: '🩺',
    title: 'Food Handler 6-Monthly Medical Checkup & Form 1A Certification Camp',
    rating: '4.9',
    reviewCount: '1,840',
    tat: 'On-site medical camp · Reports in 24 hrs',
    badge: 'Mandatory FSSAI Compliance',
    description: 'Comprehensive physical fitness examination by registered MBBS medical practitioners. Screens for skin, respiratory, eye infections, and general fitness with Form 1A certificates issued.',
    inclusions: [
      'Physical medical examination by MBBS registered doctor',
      'FSSAI Form 1A Medical Fitness Certificate issued per employee',
      'Skin, eye, nails, and communicable respiratory illness screening',
      'De-worming administration and fitness endorsement',
      'Digital compliance records uploaded directly to restaurant profile'
    ],
    resolvesChecks: ['Check #8: Staff Medical Fitness Certificates (Form 1A)'],
    complianceStandard: 'FSSAI Schedule 4 Section 3.1 & 6-Monthly Health Examination Mandate'
  },
  {
    id: 'srv-lab-stool-test',
    category: 'occupational-health',
    categoryLabel: 'Occupational health providers',
    icon: '🔬',
    title: 'Food Handler Stool Examination for Enteric Pathogens (NABL Lab)',
    rating: '4.95',
    reviewCount: '2,420',
    tat: 'Sterile kit pickup · NABL Lab report in 24–48 hrs',
    badge: 'Mandatory FSSAI Check #8',
    description: 'Government-mandated laboratory stool culture and microscopy for kitchen food handlers to eliminate carriers of Salmonella, Vibrio, and intestinal parasites.',
    inclusions: [
      'Sterile stool collection kit dispatched directly to your kitchen',
      'Microscopic examination for Ova, Cysts, and Trophozoites',
      'Culture screening for Salmonella enterica, Vibrio cholerae, and Shigella',
      'NABL Accredited Laboratory Test Report with QR verification',
      'Physician clearance certificate integration into Check #8 compliance log'
    ],
    resolvesChecks: ['Check #8: 6-Monthly Stool Test Records'],
    complianceStandard: 'FSSAI Schedule 4 Section 3.1 Stool Examination Mandate'
  },
  {
    id: 'srv-vaccination-typhoid-hepa',
    category: 'occupational-health',
    categoryLabel: 'Occupational health providers',
    icon: '💉',
    title: 'Food Handler Immunization: Typhoid Conjugate & Hepatitis A',
    rating: '4.9',
    reviewCount: '920',
    tat: 'Administered on-site by certified nurses',
    badge: 'FSSAI Mandatory Vaccines',
    description: 'Essential immunization drive for kitchen, bar, and service staff against waterborne and foodborne enteric pathogens.',
    inclusions: [
      'Typhoid Conjugate Vaccine (TCV) — 3-year immunization',
      'Hepatitis A Vaccine (Single dose / primary course)',
      'Cold-chain verified batch-tracked vaccine vials',
      'Official Vaccination Certificate with doctor registration number',
      'Automated renewal reminder tracking in restaurant compliance dashboard'
    ],
    resolvesChecks: ['Check #8: Staff Medical Fitness & Immunizations'],
    complianceStandard: 'FSSAI Food Safety & Standards (Licensing & Registration) Regulations'
  },
  {
    id: 'srv-fostac-training',
    category: 'occupational-health',
    categoryLabel: 'Occupational health providers',
    icon: '🎓',
    title: 'FoSTaC Food Safety Supervisor & Food Handler Certification',
    rating: '4.8',
    reviewCount: '2,150',
    tat: 'Half-day interactive workshop (In-person / Live Digital)',
    badge: 'Official FSSAI FoSTaC Certificate',
    description: 'Government-recognized Food Safety Training & Certification (FoSTaC) delivered by empaneled FSSAI trainers for catering, bakery, and restaurant staff.',
    inclusions: [
      'Certified FoSTaC Food Safety Supervisor Certificate (valid across India)',
      'Basic & Advanced Catering hygiene, cross-contamination, and CCP training',
      'Allergen management, temperature danger zones & rapid cooling rules',
      'Employee Training Logbook signed and stamped for food safety audits',
      'Laminated kitchen hygiene SOP posters provided'
    ],
    resolvesChecks: ['Check #7: Supervisor FoSTaC & Staff Training Certificates'],
    complianceStandard: 'FSSAI FoSTaC Mandate (1 certified supervisor per 25 food handlers)'
  },

  // 14. KITCHEN HYGIENE/ENGINEERING SERVICES
  {
    id: 'srv-hygiene-engineering',
    category: 'hygiene-engineering',
    categoryLabel: 'Kitchen hygiene/engineering services',
    icon: '🏗️',
    title: 'Commercial Kitchen Drain Unblocking, Stainless Steel Grease Traps & Odor Control',
    rating: '4.9',
    reviewCount: '810',
    tat: 'On-site engineering team within 4 hours',
    badge: 'Structural FSSAI Compliance',
    description: 'Specialized plumbing and kitchen engineering: High-pressure drain hydro-jetting, commercial SS 304 grease trap installation, and non-return valve fitting to eliminate foul odors and insect backflow.',
    inclusions: [
      'High-pressure water jetting of kitchen grease lines and main header pipes',
      'Fabrication and installation of customized SS 304 food-grade grease interceptors',
      'Trap seal maintenance and anti-rodent floor drain grating installation',
      'Biological enzymatic grease digesting bacterial treatment for continuous flow',
      'Structural drainage compliance report signed by sanitary engineers'
    ],
    resolvesChecks: ['Check #2: Kitchen Drains Flowing Freely With No Foul Smell', 'Check #3: Physical Barriers & Fly-Screens'],
    complianceStandard: 'FSSAI Schedule 4 Drainage & Sanitary Installation Norms'
  }
];

export type ProviderColumnGroup = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  items: {
    id: string;
    name: string;
    icon: string;
    rating: string;
    reviews: string;
    desc: string;
    tat: string;
  }[];
};

const PROVIDER_COLUMNS: ProviderColumnGroup[] = [
  {
    id: 'sanitation',
    title: 'Sanitation & Waste',
    subtitle: 'Pest control, deep clean & waste disposal',
    icon: '🧼',
    accent: '#059669',
    items: [
      {
        id: 'srv-pest-emergency',
        name: 'Emergency Pest Control & Gel Baiting',
        icon: '🪲',
        rating: '4.9',
        reviews: '3,410',
        desc: 'Odorless cockroach gel baiting, rodent stations & bio-drain flushing.',
        tat: 'Arrives in 2h'
      },
      {
        id: 'srv-deep-exhaust',
        name: 'Exhaust Hood & Grease Duct Steam Wash',
        icon: '🧼',
        rating: '4.9',
        reviews: '2,890',
        desc: 'High-pressure steam degreasing of hood filters, ducts & kitchen floors.',
        tat: 'Night shift'
      },
      {
        id: 'srv-waste-mgmt',
        name: 'Solid & Wet Waste Disposal',
        icon: '♻️',
        rating: '4.85',
        reviews: '780',
        desc: 'Daily kitchen segregation & municipal compliance certificates.',
        tat: 'Daily pickup'
      },
      {
        id: 'srv-ruco-oil',
        name: 'Used Cooking Oil (RUCO) Collection',
        icon: '🛢️',
        rating: '4.9',
        reviews: '1,340',
        desc: 'FSSAI RUCO bio-diesel conversion with official purchase vouchers.',
        tat: 'Weekly pickup'
      },
      {
        id: 'srv-garbage-bags',
        name: 'Heavy-Duty Sullage Bin Liners',
        icon: '🗑️',
        rating: '4.8',
        reviews: '610',
        desc: 'Color-coded tear-resistant biohazard & wet waste garbage bags.',
        tat: 'Next-day delivery'
      }
    ]
  },
  {
    id: 'labs',
    title: 'Testing & Calibration Labs',
    subtitle: 'NABL & BIS certified diagnostic laboratories',
    icon: '🧪',
    accent: '#2563eb',
    items: [
      {
        id: 'srv-water-testing',
        name: 'Drinking Water Potability (IS 10500)',
        icon: '💧',
        rating: '4.9',
        reviews: '1,420',
        desc: 'E. coli, coliforms & chemical potability testing with QR certificate.',
        tat: 'Report in 48h'
      },
      {
        id: 'srv-food-testing',
        name: 'Food Pathogen & Surface Swabs',
        icon: '🧪',
        rating: '4.9',
        reviews: '1,180',
        desc: 'Microbiological testing (Salmonella, Listeria) & hygiene swab analysis.',
        tat: 'Report in 72h'
      },
      {
        id: 'srv-calibration',
        name: 'Thermometer & Gauge Calibration',
        icon: '⚖️',
        rating: '4.8',
        reviews: '890',
        desc: 'NABL calibration for probe thermometers, chillers & scales.',
        tat: 'On-site 24h'
      }
    ]
  },
  {
    id: 'engineering',
    title: 'Kitchen Engineering & HVAC',
    subtitle: 'Chillers, equipment maintenance & plumbing',
    icon: '❄️',
    accent: '#0284c7',
    items: [
      {
        id: 'srv-hvac-coolroom',
        name: 'Walk-in Chiller & Freezer Servicing',
        icon: '❄️',
        rating: '4.9',
        reviews: '1,650',
        desc: 'Emergency repair for <5°C chillers & < -18°C freezers with gasket fitting.',
        tat: 'Emergency 3h'
      },
      {
        id: 'srv-equipment-amc',
        name: 'Kitchen Equipment Servicing & AMC',
        icon: '🔧',
        rating: '4.85',
        reviews: '1,240',
        desc: 'Maintenance for commercial stoves, dishwashers, steamers & blowers.',
        tat: 'Same day'
      },
      {
        id: 'srv-hygiene-engineering',
        name: 'Drain Jetting & SS Grease Traps',
        icon: '🏗️',
        rating: '4.9',
        reviews: '810',
        desc: 'High-pressure line jetting, SS 304 grease interceptors & odor seals.',
        tat: 'On-site in 4h'
      },
      {
        id: 'srv-fire-suppression',
        name: 'Kitchen Fire Safety & Suppression',
        icon: '🧯',
        rating: '4.9',
        reviews: '940',
        desc: 'Wet chemical fire extinguishers & automated hood suppression maintenance.',
        tat: 'Next-day inspection'
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Staff Health & Compliance',
    subtitle: 'Form 1A medicals, vaccines & FoSTaC training',
    icon: '🩺',
    accent: '#7c3aed',
    items: [
      {
        id: 'srv-medical-camp',
        name: 'Staff Medical Fitness (Form 1A)',
        icon: '🩺',
        rating: '4.9',
        reviews: '4,120',
        desc: 'Doctor on-site medical checkup, skin inspection & stool test report.',
        tat: 'Certificates in 24h'
      },
      {
        id: 'srv-fostac-training',
        name: 'FoSTaC Food Safety Supervisor',
        icon: '🎓',
        rating: '4.8',
        reviews: '2,150',
        desc: 'Government recognized FSSAI supervisor certification workshop.',
        tat: 'Half-day course'
      },
      {
        id: 'srv-immunization',
        name: 'Food Handler Immunization',
        icon: '💉',
        rating: '4.9',
        reviews: '920',
        desc: 'Typhoid conjugate & Hepatitis A vaccination drive for kitchen staff.',
        tat: 'On-site drive'
      },
      {
        id: 'srv-ppe-supplies',
        name: 'PPE & Hand Hygiene Consumables',
        icon: '🧤',
        rating: '4.8',
        reviews: '1,560',
        desc: 'Food-grade nitrile gloves, hairnets, beard masks & sanitizers.',
        tat: 'Fast delivery'
      }
    ]
  }
];

export default function ProvidersPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookingService, setActiveBookingService] = useState<ServiceItem | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{ id: string; service: ServiceItem; slot: string } | null>(null);

  // Authentication State for Providers & Restaurant Owners
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInRole, setSignInRole] = useState<'provider' | 'restaurant'>('provider');
  const [signInMethod, setSignInMethod] = useState<'mobile' | 'email'>('mobile');
  const [signInPhone, setSignInPhone] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInOtp, setSignInOtp] = useState('');
  const [signInStep, setSignInStep] = useState<'input' | 'otp' | 'success'>('input');
  const [signInError, setSignInError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<{ role: string; contact: string } | null>(null);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('foodsafe365_user_role');
      const savedPhone = localStorage.getItem('foodsafe365_customer_phone');
      const savedEmail = localStorage.getItem('foodsafe365_user_email');
      if (savedRole && (savedPhone || savedEmail)) {
        setLoggedInUser({
          role: savedRole,
          contact: savedPhone ? `+91 ${savedPhone}` : (savedEmail || '')
        });
      }
    } catch {}
  }, []);

  function handleSendSignInOtp(e: React.FormEvent) {
    e.preventDefault();
    setSignInError('');
    if (signInMethod === 'mobile') {
      if (!/^\d{10}$/.test(signInPhone.trim())) {
        setSignInError('Please enter a valid 10-digit mobile number.');
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInEmail.trim())) {
        setSignInError('Please enter a valid email address.');
        return;
      }
    }
    setSignInStep('otp');
  }

  function handleVerifySignInOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!signInOtp.trim()) {
      setSignInError('Please enter the 4-digit verification code.');
      return;
    }
    try {
      localStorage.setItem('foodsafe365_user_role', signInRole);
      if (signInMethod === 'mobile') {
        localStorage.setItem('foodsafe365_customer_phone', signInPhone);
      } else {
        localStorage.setItem('foodsafe365_user_email', signInEmail);
      }
      setLoggedInUser({
        role: signInRole,
        contact: signInMethod === 'mobile' ? `+91 ${signInPhone}` : signInEmail
      });
    } catch {}
    setSignInStep('success');
    setTimeout(() => {
      setShowSignInModal(false);
      setSignInStep('input');
      setSignInOtp('');
    }, 1200);
  }

  // Provider Partner Application State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState<{
    id: string;
    orgName: string;
    category: string;
    city: string;
    contactPerson: string;
    phone: string;
    email: string;
    accreditation: string;
    capacity: string;
    notes: string;
  } | null>(null);
  const [providerForm, setProviderForm] = useState({
    orgName: '',
    category: 'Pest Control',
    accreditation: 'NABL Accredited (ISO/IEC 17025)',
    city: 'Bangalore',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: '10–25 Technicians / Staff',
    notes: ''
  });

  // Restaurant Booking Form State
  const [restaurantName, setRestaurantName] = useState('ABC Restaurant');
  const [contactPerson, setContactPerson] = useState('Rajesh Sharma (Supervisor)');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [preferredDate, setPreferredDate] = useState('Tomorrow');
  const [preferredSlot, setPreferredSlot] = useState('Morning (09:00 AM - 12:00 PM)');
  const [staffCount, setStaffCount] = useState('12 food handlers');
  const [bookingNotes, setBookingNotes] = useState('');

  // Handle URL query parameters (e.g. ?service=medical or ?check=FS28-08)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const cat = q.get('category') as ServiceCategory;
    const srv = q.get('service');
    const chk = q.get('check');

    if (cat) {
      setSelectedCategory(cat);
    } else if (srv === 'training' || chk === 'FS28-07') {
      setSelectedCategory('occupational-health');
      const found = SERVICES.find(s => s.id === 'srv-fostac-training');
      if (found) setActiveBookingService(found);
    } else if (srv === 'medical' || chk === 'FS28-08') {
      setSelectedCategory('occupational-health');
      const found = SERVICES.find(s => s.id === 'srv-medical-camp');
      if (found) setActiveBookingService(found);
    } else if (srv === 'pest' || chk === 'FS28-21' || chk === 'FS28-22') {
      setSelectedCategory('pest-control');
    } else if (srv === 'refrigeration' || chk === 'FS28-17' || chk === 'FS28-18') {
      setSelectedCategory('hvac');
    }
  }, []);

  const filteredServices = SERVICES.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.inclusions.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.resolvesChecks.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Handle Restaurant Booking Submission
  function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBookingService) return;

    const bookingId = `FS-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const slotString = `${preferredDate} · ${preferredSlot}`;

    // Record audit trail event in localStorage
    try {
      const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
      const state: AppPhase1State = raw ? JSON.parse(raw) : {};
      const newEvent: AuditTrailEvent = {
        id: `event-${Date.now()}`,
        at: new Date().toISOString(),
        type: 'Service Provider Booked',
        detail: `Booked [${activeBookingService.title}] (${bookingId}) for ${restaurantName}. Slot: ${slotString}. Staff/Scope: ${staffCount}. Terms: Agreed post-onboarding.`,
        status: 'pro_dispatched'
      };
      state.timeline = [newEvent, ...(state.timeline || [])];
      localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('foodsaf365:update'));
    } catch {
      // Local fallback
    }

    setBookingSuccess({
      id: bookingId,
      service: activeBookingService,
      slot: slotString
    });
    setActiveBookingService(null);
  }

  // Handle Service Provider Onboarding Submission
  function handleProviderApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!providerForm.orgName.trim() || !providerForm.phone.trim()) return;

    const appId = `FS-PARTNER-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
      const state: AppPhase1State = raw ? JSON.parse(raw) : {};
      const newEvent: AuditTrailEvent = {
        id: `event-partner-${Date.now()}`,
        at: new Date().toISOString(),
        type: 'Provider Application Received',
        detail: `New provider registered: ${providerForm.orgName} (${appId}) for [${providerForm.category}] in ${providerForm.city}. Contact: ${providerForm.contactPerson} (${providerForm.phone}).`,
        status: 'partner_applied'
      };
      state.timeline = [newEvent, ...(state.timeline || [])];
      localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('foodsaf365:update'));
    } catch {
      // Local fallback
    }

    setPartnerSuccess({
      id: appId,
      orgName: providerForm.orgName,
      category: providerForm.category,
      city: providerForm.city,
      contactPerson: providerForm.contactPerson,
      phone: providerForm.phone,
      email: providerForm.email,
      accreditation: providerForm.accreditation,
      capacity: providerForm.capacity,
      notes: providerForm.notes
    });
    setIsPartnerModalOpen(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      <GlobalHeader />
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pill good" style={{ fontSize: 11, padding: '2px 8px' }}>
              <Sparkles size={11} style={{ marginRight: 4, display: 'inline' }} />
              On-Demand Compliance Network
            </span>
            <span className="muted" style={{ fontSize: 13 }}>Verified Diagnostic Labs, Trainers, Technicians &amp; Exterminators</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {loggedInUser ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                color: '#065f46',
                fontWeight: 700
              }}>
                <span>👤 {loggedInUser.role === 'provider' ? 'Provider' : 'Restaurant'}: {loggedInUser.contact}</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('foodsafe365_user_role');
                    localStorage.removeItem('foodsafe365_user_email');
                    localStorage.removeItem('foodsafe365_customer_phone');
                    setLoggedInUser(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    textDecoration: 'underline'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSignInRole('provider');
                    setShowSignInModal(true);
                    setSignInStep('input');
                    setSignInError('');
                  }}
                  style={{
                    fontSize: 12.5,
                    padding: '6px 12px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <KeyRound size={13} /> Provider Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInRole('restaurant');
                    setShowSignInModal(true);
                    setSignInStep('input');
                    setSignInError('');
                  }}
                  style={{
                    fontSize: 12.5,
                    padding: '6px 12px',
                    background: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <UtensilsCrossed size={13} /> Restaurant Sign In
                </button>
              </>
            )}
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="btn primary"
              style={{
                fontSize: 12.5,
                padding: '6px 14px',
                background: '#0f172a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Building2 size={14} /> Partner With Us
            </button>
            <Link href="/checks" className="btn secondary" style={{ fontSize: 12.5, padding: '6px 12px' }}>
              Today’s Checks
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 16 }}>
          <Link href="/home" className="nav-link muted back-row" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <ChevronLeft size={16} /> Home
          </Link>
        </div>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 20,
          padding: '32px 28px',
          marginBottom: 28,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>
              <ShieldCheck size={14} /> ON-DEMAND FOOD SAFETY SERVICE DISPATCH
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Instant Compliance &amp; Certified Services
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>
              Failed a supervisor check or compliance due? Dispatch accredited diagnostic labs, FoSTaC trainers, licensed pest exterminators, and HVAC technicians with automated FSSAI audit certificates.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            padding: '16px 20px',
            minWidth: 240
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Provider Network Status
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>540+ Verified Partners</div>
            <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={13} /> NABL &amp; FSSAI Empaneled
            </div>
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              style={{
                marginTop: 10,
                width: '100%',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Apply as Service Provider →
            </button>
          </div>
        </div>

        {/* Search & Provider Columns Layout */}
        <div style={{ marginBottom: 20 }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 20
          }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search providers or services: 'Cockroach gel', 'Water testing', 'Chiller repair', 'Form 1A'..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 16px 13px 44px',
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                color: '#0f172a',
                borderRadius: 14,
                outline: 'none'
              }}
            />
          </div>

          {/* Section Header: Directory Listed in Columns */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                All 14 Accredited Compliance Services
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Direct quote dispatch with verified NABL laboratories, licensed technicians, and trainers.
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: 8 }}>
              ⚡ 4 Specialized Divisions · Direct GM Dispatch
            </span>
          </div>

          {/* 4-COLUMN PROVIDER DIRECTORY GRID (Clean, minimal text, vertical columns) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            alignItems: 'start',
            marginBottom: 36
          }}>
            {PROVIDER_COLUMNS.map(col => {
              const filteredItems = col.items.filter(item =>
                searchQuery.trim() === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.desc.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div
                  key={col.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Column Header */}
                  <div style={{
                    padding: '14px 16px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    borderTop: `3px solid ${col.accent}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 18 }}>{col.icon}</span>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                        {col.title}
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                      {col.subtitle}
                    </p>
                  </div>

                  {/* Column Provider Items */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredItems.map(item => {
                      const matchedService = SERVICES.find(s => s.id === item.id) || {
                        id: item.id,
                        category: 'pest-control' as ServiceCategory,
                        categoryLabel: col.title,
                        icon: item.icon,
                        title: item.name,
                        rating: item.rating,
                        reviewCount: item.reviews,
                        tat: item.tat,
                        description: item.desc,
                        inclusions: [item.desc],
                        resolvesChecks: ['Standard Compliance Requirement'],
                        complianceStandard: 'FSSAI Mandate'
                      };

                      return (
                        <div
                          key={item.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            borderRadius: 12,
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 16 }}>{item.icon}</span>
                                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                                  {item.name}
                                </h4>
                              </div>
                            </div>

                            <p style={{ margin: '4px 0 8px', fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
                              {item.desc}
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #edf2f7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#d97706' }}>
                              <span>★ {item.rating}</span>
                              <span style={{ color: '#94a3b8', fontWeight: 500 }}>({item.reviews})</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveBookingService(matchedService)}
                              style={{
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 11px',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              Request Quote <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Callout Section: For Service Providers & Labs */}
        <div style={{
          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          color: '#ffffff',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 4px 15px rgba(5, 150, 105, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ maxWidth: 640 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: 999,
                display: 'inline-block',
                marginBottom: 8
              }}>
                SUPPLIER &amp; PROVIDER PARTNERSHIP NETWORK
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
                Are You a Diagnostic Lab, HVAC Technician, Pest Exterminator, or FoSTaC Trainer?
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: '#d1fae5', lineHeight: 1.6 }}>
                Partner with FoodSafe365 to receive daily qualified service requests from restaurants in your city when daily checks fail or regulatory audits are due.
              </p>
            </div>

            <button
              onClick={() => setIsPartnerModalOpen(true)}
              style={{
                background: '#ffffff',
                color: '#065f46',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Building2 size={16} /> Apply to Partner With Us
            </button>
          </div>

          {/* 4 Core Value Propositions for Providers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: 20
          }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>🎯</div>
              <strong style={{ fontSize: 13, display: 'block', color: '#ffffff' }}>Zero Customer Acquisition Cost</strong>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a7f3d0' }}>
                Receive instant tickets when kitchen checks fail or periodic certifications expire.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>💼</div>
              <strong style={{ fontSize: 13, display: 'block', color: '#ffffff' }}>High-Ticket Commercial B2B</strong>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a7f3d0' }}>
                Bulk 6-monthly medical camps (10–50 staff), annual pest AMCs, and HVAC maintenance contracts.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>⚡</div>
              <strong style={{ fontSize: 13, display: 'block', color: '#ffffff' }}>Guaranteed Direct Payouts</strong>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a7f3d0' }}>
                Automated corporate billing with guaranteed milestone disbursements directly to your bank account.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>📜</div>
              <strong style={{ fontSize: 13, display: 'block', color: '#ffffff' }}>Digital Audit Integration</strong>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a7f3d0' }}>
                Upload Form 1A docs and NABL reports straight to the client&apos;s FSSAI passport for instant approval.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RESTAURANT SERVICE REQUEST MODAL (NO MONEY CHARGED UPFRONT) */}
      {activeBookingService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 540,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '24px 28px',
            position: 'relative'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveBookingService(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f1f5f9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 28 }}>{activeBookingService.icon}</div>
              <div>
                <span className="pill good" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {activeBookingService.categoryLabel}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  Request {activeBookingService.title}
                </h2>
              </div>
            </div>

            {/* Commercial Terms Strip (No Direct Price) */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Commercial Pricing
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Custom Quotation on Onboarding
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Agreed directly with verified partner based on outlet scope &amp; staff count
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                {activeBookingService.tat}
              </div>
            </div>

            {/* Request Form */}
            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Restaurant Name &amp; Location
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Contact Person
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={e => setContactPerson(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Preferred Date
                  </label>
                  <select
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Today (Emergency 2h Dispatch)">Today (Emergency 2h Dispatch)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Within 3 Days">Within 3 Days</option>
                    <option value="Upcoming Weekend">Upcoming Weekend</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={e => setPreferredSlot(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (02:30 PM - 05:30 PM)">Afternoon (02:30 PM - 05:30 PM)</option>
                    <option value="Night After-Hours (11:00 PM - 03:00 AM)">Night After-Hours (11:00 PM - 03:00 AM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Staff Count / Scope Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 food handlers, 2 walk-in chillers, 1,200 sq ft kitchen"
                  value={staffCount}
                  onChange={e => setStaffCount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Specific Symptoms / Notes for Pro
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cool room currently reading 8.4°C; need urgent compressor and thermostat check."
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveBookingService(null)}
                  className="btn secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  style={{ flex: 2, padding: '12px', background: '#059669' }}
                >
                  Confirm &amp; Dispatch Partner →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTAURANT BOOKING CONFIRMATION MODAL */}
      {bookingSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            padding: '32px 28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <span className="pill good" style={{ fontSize: 11, padding: '3px 10px', textTransform: 'uppercase' }}>
              Dispatch Requested
            </span>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '10px 0 6px' }}>
              Service Pro Dispatched!
            </h2>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Your request for <strong>{bookingSuccess.service.title}</strong> has been allocated to an empaneled partner in your city.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              fontSize: 13,
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Booking Reference:</span>
                <strong style={{ color: '#0f172a' }}>{bookingSuccess.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Scheduled Slot:</span>
                <strong style={{ color: '#0f172a' }}>{bookingSuccess.slot}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Commercial Terms:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Custom Quote Agreed Post-Onboarding</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>● Assigned &amp; Kit Dispatched</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Audit Log:</span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>Recorded in Daily Trail</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/records" className="btn secondary" style={{ flex: 1, padding: '12px' }}>
                View Audit Trail
              </Link>
              <button
                onClick={() => setBookingSuccess(null)}
                className="btn primary"
                style={{ flex: 1, padding: '12px', background: '#059669' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE PROVIDER ONBOARDING APPLICATION MODAL ("PARTNER WITH US") */}
      {isPartnerModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 580,
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsPartnerModalOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f1f5f9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#047857',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={24} />
              </div>
              <div>
                <span className="pill good" style={{ fontSize: 10, padding: '2px 8px' }}>
                  Provider Onboarding
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  Partner With FoodSafe365
                </h2>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
              Join our network of verified diagnostic laboratories, FoSTaC training institutes, pest control operators, and HVAC service contractors. Receive high-value, recurring restaurant bookings.
            </p>

            {/* Direct Onboarding Desk Contact Banner */}
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  FoodSafe365 Partner Onboarding Desk
                </div>
                <div style={{ fontSize: 13, color: '#1e293b', marginTop: 2 }}>
                  ✉️ Email: <a href="mailto:ray.health.ai@gmail.com?subject=FoodSafe365%20Provider%20Partnership" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>ray.health.ai@gmail.com</a>
                </div>
              </div>
              <a
                href="mailto:ray.health.ai@gmail.com?subject=FoodSafe365%20Provider%20Partnership%20Query"
                className="btn secondary"
                style={{ fontSize: 12, padding: '6px 12px', background: '#ffffff', color: '#166534', borderColor: '#86efac', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Mail size={13} /> Email Partner Desk
              </a>
            </div>

            <form onSubmit={handleProviderApplication} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Organization / Provider Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Diagnostic Labs / Apex Pest Management / FrostTech HVAC"
                  value={providerForm.orgName}
                  onChange={e => setProviderForm({ ...providerForm, orgName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Primary Specialization *
                  </label>
                  <select
                    value={providerForm.category}
                    onChange={e => setProviderForm({ ...providerForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Pest Control">Pest Control</option>
                    <option value="Deep Cleaning Services">Deep Cleaning Services</option>
                    <option value="Waste-management companies">Waste-management companies</option>
                    <option value="Used cooking-oil collectors">Used cooking-oil collectors</option>
                    <option value="Water-testing laboratories">Water-testing laboratories</option>
                    <option value="Food-testing laboratories">Food-testing laboratories</option>
                    <option value="Calibration agencies">Calibration agencies</option>
                    <option value="Refrigeration/HVAC technicians">Refrigeration/HVAC technicians</option>
                    <option value="Kitchen equipment service">Kitchen equipment service</option>
                    <option value="Garbage/Sullage Bag Supplier">Garbage/Sullage Bag Supplier</option>
                    <option value="Fire-safety providers">Fire-safety providers</option>
                    <option value="PPE & hygiene suppliers">PPE &amp; hygiene suppliers</option>
                    <option value="Occupational health providers">Occupational health providers</option>
                    <option value="Kitchen hygiene/engineering services">Kitchen hygiene/engineering services</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Key License / Accreditation *
                  </label>
                  <select
                    value={providerForm.accreditation}
                    onChange={e => setProviderForm({ ...providerForm, accreditation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="NABL Accredited (ISO/IEC 17025)">NABL Accredited (ISO/IEC 17025)</option>
                    <option value="FSSAI FoSTaC Training Partner">FSSAI FoSTaC Training Partner</option>
                    <option value="CIB&RC Certified Commercial Pest License">CIB&amp;RC Certified Pest License</option>
                    <option value="MBBS / Registered Medical Practitioner">Registered Medical Practitioner</option>
                    <option value="Authorized HVAC OEM Service Dealer">Authorized HVAC OEM Dealer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Operating City / Territory *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore (Indiranagar, Koramangala)"
                    value={providerForm.city}
                    onChange={e => setProviderForm({ ...providerForm, city: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Daily Field Capacity
                  </label>
                  <select
                    value={providerForm.capacity}
                    onChange={e => setProviderForm({ ...providerForm, capacity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="1–5 Technicians / Staff">1–5 Technicians / Staff</option>
                    <option value="5–15 Technicians / Staff">5–15 Technicians / Staff</option>
                    <option value="15–50+ Technicians (City-wide fleet)">15–50+ Technicians (City-wide fleet)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Anil Verma / Vikram Rao"
                    value={providerForm.contactPerson}
                    onChange={e => setProviderForm({ ...providerForm, contactPerson: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={providerForm.phone}
                    onChange={e => setProviderForm({ ...providerForm, phone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Business Email Address
                </label>
                <input
                  type="email"
                  placeholder="partnerships@yourcompany.com"
                  value={providerForm.email}
                  onChange={e => setProviderForm({ ...providerForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Notes / Certifications Link (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add details on NABL scope, emergency SLA capabilities, or existing restaurant client portfolio..."
                  value={providerForm.notes}
                  onChange={e => setProviderForm({ ...providerForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="btn secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  style={{ flex: 2, padding: '12px', background: '#0f172a' }}
                >
                  Submit Partner Application →
                </button>
              </div>

              <p style={{ fontSize: 11.5, color: '#64748b', margin: '6px 0 0', textAlign: 'center', lineHeight: 1.4 }}>
                🔒 Your application is submitted directly to our Partner Desk at <strong>ray.health.ai@gmail.com</strong>. Our team verifies NABL/FSSAI credentials and contacts you directly via phone &amp; email within 24 business hours.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* PROVIDER APPLICATION SUCCESS CONFIRMATION */}
      {partnerSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            padding: '32px 28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <span className="pill good" style={{ fontSize: 11, padding: '3px 10px', textTransform: 'uppercase' }}>
              Application Submitted
            </span>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '10px 0 6px' }}>
              Welcome to FoodSafe Network!
            </h2>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Thank you for applying, <strong>{partnerSuccess.orgName}</strong>. Your application has been logged for <strong>{partnerSuccess.category}</strong>.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 16px',
              textAlign: 'left',
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Application Reference:</span>
                <strong style={{ color: '#0f172a' }}>{partnerSuccess.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Category:</span>
                <strong style={{ color: '#0f172a' }}>{partnerSuccess.category}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Assigned Desk:</span>
                <strong style={{ color: '#059669' }}>ray.health.ai@gmail.com</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Verification SLA:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>● Under Review (Within 24 Hours)</span>
              </div>
            </div>

            {/* Direct Contact & Action Box */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 14,
              padding: '14px 16px',
              textAlign: 'left',
              marginBottom: 20
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                📬 How We Connect With You:
              </div>
              <p style={{ fontSize: 12, color: '#14532d', margin: '0 0 12px', lineHeight: 1.5 }}>
                Our team will reach out directly to <strong>{partnerSuccess.contactPerson}</strong> ({partnerSuccess.phone}). You can also send a pre-filled confirmation email to our desk or connect via WhatsApp immediately:
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={`mailto:ray.health.ai@gmail.com?subject=${encodeURIComponent(`FoodSafe365 Provider Onboarding: ${partnerSuccess.orgName} (${partnerSuccess.category}) - Ref ${partnerSuccess.id}`)}&body=${encodeURIComponent(
`Hi FoodSafe365 Partnerships Team,

Here are the details of our service provider application:
- Application Ref: ${partnerSuccess.id}
- Organization: ${partnerSuccess.orgName}
- Category: ${partnerSuccess.category}
- License / Accreditation: ${partnerSuccess.accreditation}
- Operating City: ${partnerSuccess.city}
- Daily Field Capacity: ${partnerSuccess.capacity}
- Contact Person: ${partnerSuccess.contactPerson}
- Phone: ${partnerSuccess.phone}
- Email: ${partnerSuccess.email}
- Notes: ${partnerSuccess.notes || 'None'}

Please confirm our onboarding and empanelment.

Regards,
${partnerSuccess.contactPerson}
${partnerSuccess.orgName}`
                  )}`}
                  className="btn primary"
                  style={{ fontSize: 12, padding: '7px 12px', background: '#059669', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Mail size={13} /> Email Application to Desk
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi FoodSafe365 Team, I have submitted a provider application for ${partnerSuccess.orgName} (${partnerSuccess.category}) with Ref: ${partnerSuccess.id}. Please connect with us.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn secondary"
                  style={{ fontSize: 12, padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  💬 Connect via WhatsApp
                </a>
              </div>
            </div>

            <button
              onClick={() => setPartnerSuccess(null)}
              className="btn primary"
              style={{ width: '100%', padding: '12px', background: '#0f172a' }}
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL: PROVIDER & RESTAURANT OWNER SIGN IN (MOBILE OTP OR EMAIL) */}
      {/* ========================================================================= */}
      {showSignInModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 440,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              background: signInRole === 'provider'
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              padding: '20px 24px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {signInRole === 'provider' ? <Wrench size={20} /> : <UtensilsCrossed size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    {signInRole === 'provider' ? 'Service Provider Sign In' : 'Restaurant Owner Sign In'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.85 }}>
                    {signInRole === 'provider' ? 'Access lead dispatch & quotations' : 'Kitchen compliance dashboard'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 22 }}>
              {/* Role Toggle Tabs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 16,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 10
              }}>
                <button
                  type="button"
                  onClick={() => { setSignInRole('provider'); setSignInError(''); }}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: 'none',
                    background: signInRole === 'provider' ? '#ffffff' : 'transparent',
                    color: signInRole === 'provider' ? '#065f46' : '#64748b',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    boxShadow: signInRole === 'provider' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  🛠️ Service Provider
                </button>
                <button
                  type="button"
                  onClick={() => { setSignInRole('restaurant'); setSignInError(''); }}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: 'none',
                    background: signInRole === 'restaurant' ? '#ffffff' : 'transparent',
                    color: signInRole === 'restaurant' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    boxShadow: signInRole === 'restaurant' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  🍴 Restaurant Owner
                </button>
              </div>

              {/* Method Switcher: Mobile vs Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => { setSignInMethod('mobile'); setSignInError(''); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: signInMethod === 'mobile' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    background: signInMethod === 'mobile' ? '#ecfdf5' : '#ffffff',
                    color: signInMethod === 'mobile' ? '#065f46' : '#475569'
                  }}
                >
                  <Smartphone size={13} /> Mobile (SMS OTP)
                </button>
                <button
                  type="button"
                  onClick={() => { setSignInMethod('email'); setSignInError(''); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: signInMethod === 'email' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    background: signInMethod === 'email' ? '#ecfdf5' : '#ffffff',
                    color: signInMethod === 'email' ? '#065f46' : '#475569'
                  }}
                >
                  <Mail size={13} /> Email Address
                </button>
              </div>

              {signInStep === 'input' && (
                <form onSubmit={handleSendSignInOtp}>
                  {signInMethod === 'mobile' ? (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Enter 10-Digit Mobile Number *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, padding: '9px 12px', gap: 8, background: '#ffffff' }}>
                        <span style={{ fontWeight: 800, color: '#64748b', fontSize: 14 }}>🇮🇳 +91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          autoFocus
                          placeholder="9876543210"
                          value={signInPhone}
                          onChange={e => setSignInPhone(e.target.value.replace(/\D/g, ''))}
                          style={{ border: 'none', outline: 'none', fontSize: 15, width: '100%', fontWeight: 600, color: '#0f172a' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Enter Registered Email Address *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, padding: '9px 12px', gap: 8, background: '#ffffff' }}>
                        <Mail size={16} color="#64748b" />
                        <input
                          type="email"
                          autoFocus
                          placeholder={signInRole === 'provider' ? 'contact@pestguard.com' : 'manager@bistro.com'}
                          value={signInEmail}
                          onChange={e => setSignInEmail(e.target.value)}
                          style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', fontWeight: 600, color: '#0f172a' }}
                        />
                      </div>
                    </div>
                  )}

                  {signInError && (
                    <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, background: '#fef2f2', padding: '6px 10px', borderRadius: 6 }}>
                      {signInError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn primary"
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#059669',
                      fontSize: 14,
                      fontWeight: 700,
                      borderRadius: 10,
                      justifyContent: 'center'
                    }}
                  >
                    {signInMethod === 'mobile' ? 'Send OTP (Instant SMS) →' : 'Send Verification Code (Email) →'}
                  </button>
                </form>
              )}

              {signInStep === 'otp' && (
                <form onSubmit={handleVerifySignInOtp}>
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: '#64748b' }}>
                      Verification code sent to <strong>{signInMethod === 'mobile' ? `+91 ${signInPhone}` : signInEmail}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setSignInStep('input')}
                      style={{ background: 'none', border: 'none', color: '#059669', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change {signInMethod === 'mobile' ? 'mobile' : 'email'}
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={4}
                    autoFocus
                    placeholder="3650"
                    value={signInOtp}
                    onChange={e => setSignInOtp(e.target.value)}
                    style={{
                      border: '2px solid #059669',
                      borderRadius: 10,
                      padding: '10px',
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '0.3em',
                      width: '100%',
                      boxSizing: 'border-box',
                      marginBottom: 10
                    }}
                  />

                  {/* 1-Click Demo Auto-fill Helper */}
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setSignInOtp('3650')}
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#059669',
                        borderRadius: 999,
                        padding: '3px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ Fill Demo Code (3650)
                    </button>
                  </div>

                  {signInError && (
                    <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, background: '#fef2f2', padding: '6px 10px', borderRadius: 6, textAlign: 'center' }}>
                      {signInError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn primary"
                    style={{ width: '100%', padding: '11px', background: '#059669', fontSize: 14, fontWeight: 700, borderRadius: 10, justifyContent: 'center' }}
                  >
                    Verify &amp; Continue →
                  </button>
                </form>
              )}

              {signInStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Check size={28} />
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                    Signed In Successfully!
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    Welcome back to FoodSafe365!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
