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
  Home
} from 'lucide-react';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  AuditTrailEvent
} from '@/lib/foodsafety28';
import ThemeToggle from '@/components/ThemeToggle';

export type ServiceCategory =
  | 'all'
  | 'medical'
  | 'lab-tests'
  | 'certification'
  | 'pest-control'
  | 'hvac'
  | 'deep-cleaning';

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
  { id: 'medical', label: 'Medical Check Up', icon: '🩺' },
  { id: 'lab-tests', label: 'Lab Tests', icon: '🧪' },
  { id: 'certification', label: 'Food Safety Certification', icon: '🎓' },
  { id: 'pest-control', label: 'Pest Control Services', icon: '🪲' },
  { id: 'hvac', label: 'HVAC Services', icon: '❄️' },
  { id: 'deep-cleaning', label: 'Kitchen Deep Cleaning', icon: '🧼' }
];

const SERVICES: ServiceItem[] = [
  // 1. MEDICAL CHECK UP
  {
    id: 'srv-medical-camp',
    category: 'medical',
    categoryLabel: 'Medical Check Up',
    icon: '🩺',
    title: 'Food Handler 6-Monthly Medical Checkup & Form 1A Certification',
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
    resolvesChecks: ['Check #8: Staff Medical Check-up, Form 1A & Vaccinations'],
    complianceStandard: 'FSSAI Schedule 4 Section 3.1 & 6-Monthly Health Examination Mandate'
  },
  {
    id: 'srv-vaccination-typhoid-hepa',
    category: 'medical',
    categoryLabel: 'Medical Check Up',
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
    resolvesChecks: ['Check #8: Staff Medical Check-up, Form 1A & Vaccinations'],
    complianceStandard: 'FSSAI Food Safety & Standards (Licensing & Registration) Regulations'
  },

  // 2. LAB TESTS
  {
    id: 'srv-lab-stool-test',
    category: 'lab-tests',
    categoryLabel: 'Lab Tests',
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
    resolvesChecks: ['Check #8: Staff Medical Check-up (Stool Test & Pathogen Screen)'],
    complianceStandard: 'FSSAI Schedule 4 Section 3.1 Stool Examination Mandate'
  },
  {
    id: 'srv-water-testing',
    category: 'lab-tests',
    categoryLabel: 'Lab Tests',
    icon: '🧪',
    title: 'Drinking & Cooking Water Potability Testing (BIS IS 10500)',
    rating: '4.9',
    reviewCount: '1,420',
    tat: 'Sterile sample pickup · NABL Lab report in 48 hrs',
    badge: 'NABL Accredited Lab Report',
    description: 'Mandatory water testing for restaurant cooking, ice-making, and drinking water per Bureau of Indian Standards IS 10500:2012.',
    inclusions: [
      'Sterile on-site water sample collection by certified lab phlebotomist',
      'Microbiological parameters: E. coli, Total Coliforms, Faecal streptococci',
      'Chemical parameters: TDS, pH, Hardness, Free Residual Chlorine, Heavy metals',
      'NABL Accredited Laboratory Test Report with QR verification code',
      'FSSAI audit-compliant potability certificate'
    ],
    resolvesChecks: ['Check #6: Handwashing Station Water', 'Premises Potable Water Compliance'],
    complianceStandard: 'FSSAI Section 2.1.3 & BIS IS 10500:2012 Drinking Water Standards'
  },
  {
    id: 'srv-surface-swab-test',
    category: 'lab-tests',
    categoryLabel: 'Lab Tests',
    icon: '🧫',
    title: 'Kitchen Surface Swab & Microbial Safety Analysis',
    rating: '4.85',
    reviewCount: '680',
    tat: 'Sample collection · Report in 48 hrs',
    badge: 'HACCP Hygiene Validation',
    description: 'Microbiological surface swab testing for chopping boards, prep counters, slicers, and ice-makers to verify sanitation efficacy and eliminate Listeria and E. coli risks.',
    inclusions: [
      'Sterile swab collection from 5 high-risk food contact surfaces',
      'Aerobic Plate Count (APC) and Coliform count analysis',
      'Listeria monocytogenes and Staphylococcus aureus screening',
      'Sanitation effectiveness certification for HACCP audit compliance',
      'Detailed hygiene corrective recommendation report'
    ],
    resolvesChecks: ['Check #1: Food Prep Areas Cleanliness', 'Check #24: Cleaning Schedule Completed'],
    complianceStandard: 'FSSAI Good Hygiene Practices (GHP) & ISO 22000'
  },

  // 3. FOOD SAFETY CERTIFICATION
  {
    id: 'srv-fostac-training',
    category: 'certification',
    categoryLabel: 'Food Safety Certification',
    icon: '🎓',
    title: 'FoSTaC Food Safety Supervisor & Food Handler Certification',
    rating: '4.8',
    reviewCount: '2,150',
    tat: 'Half-day interactive workshop (In-person / Live Digital)',
    badge: 'Official FSSAI FoSTaC Certificate',
    description: 'Government-mandated Food Safety Training & Certification (FoSTaC) delivered by empaneled FSSAI trainers for catering, bakery, and restaurant staff.',
    inclusions: [
      'Certified FoSTaC Food Safety Supervisor Certificate (valid across India)',
      'Basic & Advanced Catering hygiene, cross-contamination, and CCP training',
      'Allergen management, temperature danger zones & rapid cooling rules',
      'Employee Training Logbook signed and stamped for food safety audits',
      'Laminated kitchen hygiene SOP posters provided'
    ],
    resolvesChecks: ['Check #7: FoSTaC Food Safety Supervisor & Staff Training', 'Check #5 to #7: Personal Hygiene'],
    complianceStandard: 'FSSAI FoSTaC Mandate (1 certified supervisor per 25 food handlers)'
  },
  {
    id: 'srv-hygiene-rating-audit',
    category: 'certification',
    categoryLabel: 'Food Safety Certification',
    icon: '⭐',
    title: 'FSSAI Hygiene Rating Audit & Pre-Inspection Readiness Score',
    rating: '4.9',
    reviewCount: '1,120',
    tat: 'Full-day kitchen audit · Report in 24 hrs',
    badge: '5-Star Hygiene Rating Prep',
    description: 'Comprehensive mock audit conducted by FSSAI-recognized hygiene audit agencies to prepare your restaurant for the official 5-star "Eat Right" hygiene rating certificate.',
    inclusions: [
      'Comprehensive 48-point physical kitchen, store, and service audit',
      'Verification of statutory records, licenses, pest logs, and calibration records',
      'Gap identification matrix with immediate corrective action roadmap',
      'Pre-audit readiness certificate and official audit application filing assistance',
      'Direct synchronization with FoodSafe365 Daily Badge scoring'
    ],
    resolvesChecks: ['All 29 FSSAI Operational Controls', 'Annual Audit Compliance'],
    complianceStandard: 'FSSAI Hygiene Rating Scheme & Schedule 4 Audit Standards'
  },
  {
    id: 'srv-haccp-certification',
    category: 'certification',
    categoryLabel: 'Food Safety Certification',
    icon: '📜',
    title: 'HACCP & ISO 22000 Food Safety Management System Certification',
    rating: '4.88',
    reviewCount: '430',
    tat: 'Consultation & documentation in 5 days',
    badge: 'Global Food Safety Standard',
    description: 'End-to-end consulting, Hazard Analysis Critical Control Point (HACCP) plan drafting, and ISO 22000 readiness for premium dining establishments and franchise chains.',
    inclusions: [
      'Custom Hazard Analysis & Critical Control Point (HACCP) manual drafting',
      'Cook-chill, storage, and cross-contamination CCP boundary validation',
      'Staff standard operating procedure (SOP) documentation',
      'Accredited certification body audit facilitation',
      'Lifetime digital repository in FoodSafe365 document vault'
    ],
    resolvesChecks: ['HACCP Principles #1 to #7', 'Food Safety Management Systems'],
    complianceStandard: 'Codex Alimentarius HACCP & ISO 22000:2018'
  },

  // 4. PEST CONTROL SERVICES
  {
    id: 'srv-pest-emergency',
    category: 'pest-control',
    categoryLabel: 'Pest Control Services',
    icon: '🪲',
    title: 'Emergency Kitchen Pest Extermination & German Cockroach Gel Baiting',
    rating: '4.9',
    reviewCount: '3,410',
    tat: 'Arrives within 2 hours for active infestation',
    badge: '100% Food-Safe Chemicals',
    description: 'Rapid-response extermination and barrier application using odorless, non-toxic Bayer gel and micro-encapsulated spray safe for food preparation zones.',
    inclusions: [
      'Complete inspection of dark corners, motor housings, drains, and dry storage (#26)',
      'Odorless German cockroach gel baiting in all electrical points and joints',
      'Drain flushing with bio-enzymatic pest-repelling wash',
      'Digital Pest Elimination Certificate for manager verification & audit records',
      '30-day warranty with free re-treatment if pests reappear'
    ],
    resolvesChecks: ['Check #26: Pest Inspection (Signs of Pests)', 'Check #27: Pest-Control Devices & Vendor Service'],
    complianceStandard: 'FSSAI Schedule 4 Integrated Pest Management (IPM)'
  },
  {
    id: 'srv-pest-amc',
    category: 'pest-control',
    categoryLabel: 'Pest Control Services',
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
      'Insect Light Trap (ILT) maintenance & UV bulb/glue pad replacements (#27)',
      'Service Logbook kept on-site with MSDS chemical safety data sheets',
      'FSSAI inspection audit defense representation'
    ],
    resolvesChecks: ['Check #26: Pest Inspection', 'Check #27: Pest-Control Devices & Vendor Service'],
    complianceStandard: 'FSSAI Schedule 4 Annual Pest Maintenance Requirement'
  },

  // 5. HVAC SERVICES
  {
    id: 'srv-refrigeration-repair',
    category: 'hvac',
    categoryLabel: 'HVAC Services',
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
    resolvesChecks: ['Check #17: Refrigerator & Cool Storage (< 5°C)', 'Check #18: Freezer & Cold Storage (< −18°C)'],
    complianceStandard: 'FSSAI Schedule 4 Cold Chain Storage Regulations'
  },
  {
    id: 'srv-calibration-service',
    category: 'hvac',
    categoryLabel: 'HVAC Services',
    icon: '🌡️',
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
    resolvesChecks: ['Check #17: Cool Storage', 'Check #18: Cold Storage', 'Check #19: Cooking Core Temperature', 'Check #20: Rapid Cooling Protocol'],
    complianceStandard: 'FSSAI Schedule 4 Equipment Calibration Mandate'
  },
  {
    id: 'srv-hvac-amc',
    category: 'hvac',
    categoryLabel: 'HVAC Services',
    icon: '⚙️',
    title: 'Commercial Refrigeration & Walk-In Quarterly AMC',
    rating: '4.8',
    reviewCount: '510',
    tat: 'Quarterly comprehensive servicing visits',
    badge: 'Zero Spoilage Guarantee',
    description: 'Preventive maintenance contract for commercial chillers, freezers, ice machines, and cold storage to avert unexpected compressor burnout and costly food spoilage.',
    inclusions: [
      'Chemical cleaning of condenser coils and evaporator fin combs',
      'Refrigerant leak detection and pressure check',
      'Electrical connection tightening and thermostat accuracy test',
      'Priority 2-hour emergency breakdown response included',
      'Quarterly health certificate issued for food safety audits'
    ],
    resolvesChecks: ['Check #17: Refrigerator & Cool Storage (< 5°C)', 'Check #18: Freezer & Cold Storage (< −18°C)'],
    complianceStandard: 'Preventive Food Safety Equipment Maintenance'
  },

  // 6. KITCHEN DEEP CLEANING
  {
    id: 'srv-deep-cleaning',
    category: 'deep-cleaning',
    categoryLabel: 'Kitchen Deep Cleaning',
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
    resolvesChecks: ['Check #1: Food Prep Area Cleanliness', 'Check #2: Drains & Grease Traps', 'Premises Deep Sanitation'],
    complianceStandard: 'FSSAI Schedule 4 Premises Sanitation & Fire Safety Standards'
  }
];

export default function ProvidersPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookingService, setActiveBookingService] = useState<ServiceItem | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{ id: string; service: ServiceItem; slot: string } | null>(null);

  // Provider Partner Application State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState<{ id: string; orgName: string; category: string } | null>(null);
  const [providerForm, setProviderForm] = useState({
    orgName: '',
    category: 'Medical Check Up',
    accreditation: 'NABL Accredited (ISO/IEC 17025)',
    city: 'Bangalore',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: '10–25 Technicians / Phlebotomists',
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
    } else if (srv === 'training' || chk === 'FS28-08') {
      setSelectedCategory('certification');
      const found = SERVICES.find(s => s.id === 'srv-fostac');
      if (found) setActiveBookingService(found);
    } else if (srv === 'medical' || chk === 'FS28-09') {
      setSelectedCategory('medical');
      const found = SERVICES.find(s => s.id === 'srv-medical-camp');
      if (found) setActiveBookingService(found);
    } else if (srv === 'pest' || chk === 'FS28-26' || chk === 'FS28-27') {
      setSelectedCategory('pest-control');
    } else if (srv === 'refrigeration' || chk === 'FS28-19' || chk === 'FS28-20') {
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
      category: providerForm.category
    });
    setIsPartnerModalOpen(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 60 }}>
      {/* Top Navbar */}
      <div className="topbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: 17
          }}>
            FS
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16, color: '#0f172a' }}>FoodSafe Marketplace</strong>
              <span className="pill good" style={{ fontSize: 11, padding: '2px 8px' }}>
                <Sparkles size={11} style={{ marginRight: 4, display: 'inline' }} />
                On-Demand Compliance Network
              </span>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>Verified Diagnostic Labs, Trainers, Technicians &amp; Exterminators</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ThemeToggle />
          <Link
            href="/home"
            className="btn secondary"
            style={{
              fontSize: 13,
              padding: '7px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Home size={14} /> Home
          </Link>
          <button
            onClick={() => setIsPartnerModalOpen(true)}
            className="btn primary"
            style={{
              fontSize: 13,
              padding: '7px 14px',
              background: '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Building2 size={14} /> Partner With Us
          </button>
          <Link href="/checks" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
            Today’s Checks
          </Link>
          <Link href="/actions" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
            Actions Centre
          </Link>
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

        {/* Search & Categories Bar */}
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search services: 'Stool test', 'Medical check up', 'FoSTaC training', 'Cockroach gel', 'HVAC repair'..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                color: '#0f172a',
                borderRadius: 14,
                outline: 'none'
              }}
            />
          </div>

          {/* User-Requested Category Tabs */}
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollbarWidth: 'none'
          }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 18px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    background: active ? '#059669' : '#ffffff',
                    color: active ? '#ffffff' : '#334155',
                    border: active ? '1px solid #059669' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: active ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative Banner for Medical Check */}
        {selectedCategory === 'medical' && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Stethoscope size={20} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#065f46' }}>
              <strong>FSSAI Schedule 4 Mandate (Check #8):</strong> All restaurant kitchen and service personnel must undergo a certified medical examination including laboratory stool testing every 6 months and maintain active Typhoid &amp; Hepatitis A immunizations.
            </div>
          </div>
        )}

        {/* Informative Banner for Pest Control */}
        {selectedCategory === 'pest-control' && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Bug size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#92400e' }}>
              <strong>Checks #26 &amp; #27 Resolution:</strong> Only food-safe, odorless formulations approved by CIB&amp;RC are permitted in active food prep zones. All service visits generate a compliance log entry with chemical safety data sheets (MSDS).
            </div>
          </div>
        )}

        {/* Informative Banner for HVAC */}
        {selectedCategory === 'hvac' && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Wrench size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#0369a1' }}>
              <strong>Cold Storage (<span style={{ fontWeight: 700 }}>&lt; -18°C</span>) &amp; Cool Room (<span style={{ fontWeight: 700 }}>&lt; 5°C</span>):</strong> Emergency HVAC technicians carry calibrated digital test instruments and replacement gasket seals to restore temperature before food abuse occurs.
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 36
        }}>
          {filteredServices.map(service => (
            <div
              key={service.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
              }}
            >
              <div>
                {/* Top Badge & Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {service.categoryLabel}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{service.rating}</span>
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>({service.reviewCount})</span>
                  </div>
                </div>

                {/* Service Title */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24 }}>{service.icon}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.35 }}>
                    {service.title}
                  </h3>
                </div>

                {/* Compliance Badge */}
                {service.badge && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: 6,
                    marginTop: 4,
                    marginBottom: 10
                  }}>
                    <ShieldCheck size={12} /> {service.badge}
                  </div>
                )}

                {/* Description */}
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
                  {service.description}
                </p>

                {/* Inclusions list */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                    What’s Included
                  </span>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {service.inclusions.map((inc, i) => (
                      <li key={i} style={{ fontSize: 12, color: '#334155', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ color: '#059669', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Turnaround Time SLA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                  <Clock size={13} color="#94a3b8" />
                  <span>{service.tat}</span>
                </div>
              </div>

              {/* Bottom Quotation Status & Action Button (No Direct Fee) */}
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Commercial Terms
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Agreed post-onboarding
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Custom quote on assessment
                  </div>
                </div>

                <button
                  onClick={() => setActiveBookingService(service)}
                  className="btn primary"
                  style={{
                    fontSize: 13,
                    padding: '8px 18px',
                    background: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  Request Dispatch <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
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

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Join our network of verified diagnostic laboratories, FoSTaC training institutes, pest control operators, and HVAC service contractors. Receive high-value, recurring restaurant bookings.
            </p>

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
                    <option value="Medical Check Up">Medical Check Up</option>
                    <option value="Lab Tests">Lab Tests (Stool / Water / Micro)</option>
                    <option value="Food Safety Certification">Food Safety Certification (FoSTaC)</option>
                    <option value="Pest Control Services">Pest Control Services</option>
                    <option value="HVAC Services">HVAC Services &amp; Calibration</option>
                    <option value="Kitchen Deep Cleaning">Kitchen Deep Cleaning</option>
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
              Application Submitted
            </span>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '10px 0 6px' }}>
              Welcome to FoodSafe Network!
            </h2>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Thank you for applying, <strong>{partnerSuccess.orgName}</strong>. Your application has been logged for <strong>{partnerSuccess.category}</strong>. Our partner empanelment team will verify your credentials and reach out within 24 hours.
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
                <span style={{ color: '#64748b' }}>Application Reference:</span>
                <strong style={{ color: '#0f172a' }}>{partnerSuccess.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Category:</span>
                <strong style={{ color: '#0f172a' }}>{partnerSuccess.category}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Verification SLA:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>● Under Review (24 Hours)</span>
              </div>
            </div>

            <button
              onClick={() => setPartnerSuccess(null)}
              className="btn primary"
              style={{ width: '100%', padding: '12px', background: '#059669' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
