/**
 * FoodSafe365 — AI Food Safety Intelligence & Regulatory Knowledge Base
 * Tailored for Kitchen Supervisors and Restaurant Managers.
 */

export type PersonaRole = 'supervisor' | 'manager';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  roleContext?: PersonaRole;
  references?: string[];
  actionLinks?: { label: string; href: string }[];
  steps?: string[];
};

export type KnowledgeTopic = {
  keywords: string[];
  title: string;
  standard: string;
  fssaiRef: string;
  supervisorAction: string[];
  managerAction: string[];
  actionLink?: { label: string; href: string };
};

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    keywords: ['refrigerator', 'fridge', 'chiller', 'cold storage', 'temperature', 'cool room', 'high temp', 'warm', '5 degrees', 'फ्रिज', 'फ्रीज', 'तापमान', 'ठंडा', 'थंड', 'कूलिंग', 'cooling'],
    title: 'Cold-Chain & Refrigeration Storage Deviations',
    standard: 'Refrigerated foods must be held strictly between 1°C and 5°C. Any temperature > 5°C accelerates dangerous pathogen growth (Listeria monocytogenes, Salmonella, E. coli).',
    fssaiRef: 'FSSAI Schedule 4 Section 2.1 & Temperature Control Mandate',
    supervisorAction: [
      'IMMEDIATELY check door seals and verify evaporator fans are not blocked or iced over.',
      'Check core temperature of cooked and high-risk foods using a calibrated probe thermometer.',
      'If high-risk foods (cooked poultry, dairy, cut melon, gravies) have been above 5°C for > 2 hours, quarantine immediately for destruction.',
      'If under 2 hours, transfer food stock to backup chiller or ice baths at < 5°C.',
      'Log the exact deviation in Check #18 and flag the shift manager.'
    ],
    managerAction: [
      'Review Check #18 and open a High-Severity Corrective Action ticket.',
      'Confirm the alert in Manager Review to initiate formal audit logging.',
      'Verify whether stock must be discarded to prevent food-poisoning liability.',
      'Dispatch an on-demand certified HVAC technician from the Marketplace if compressor repair or gasket replacement is required.',
      'Verify compressor recovery and record digital temperature log before releasing unit back into production.'
    ],
    actionLink: { label: 'Book Emergency HVAC Repair', href: '/providers?category=hvac' }
  },
  {
    keywords: ['cooking', 'reheating', 'core temperature', 'chicken', 'meat', 'poultry', '75 degrees', 'cooked', 'पकाना', 'कुकिंग', 'रीहीटिंग', 'गरम', 'तापमान', 'स्वयंपाक'],
    title: 'Safe Cooking, Internal Core Temperatures & Reheating',
    standard: 'All poultry and minced meats must reach an internal core temperature of ≥ 75°C for at least 15 seconds. Reheating of pre-cooked foods must reach ≥ 75°C throughout the core before service, and held at ≥ 65°C.',
    fssaiRef: 'FSSAI Schedule 4 Section 4.2 Thermal Processing Standard',
    supervisorAction: [
      'Insert a sanitized needle thermometer probe into the thickest part of the food, away from bones.',
      'Verify the digital reading reaches at least 75°C (167°F) before plating or transferring to hot holding.',
      'Never reheat food more than once. Discard any previously reheated leftovers.',
      'Hot holding units must maintain food core at ≥ 65°C throughout service.'
    ],
    managerAction: [
      'Ensure kitchen calibrated probe thermometers are available at every hot line station.',
      'Audit the shift Cooking Temperature Log (Check #20 & #21).',
      'Train commis chefs on temperature probing protocol and digital recording.',
      'Ensure standard recipe cards specify mandatory minimum internal core temperatures.'
    ]
  },
  {
    keywords: ['medical', 'form 1a', 'doctor', 'stool test', 'typhoid', 'vaccine', 'health check', 'communicable', 'मेडिकल', 'फॉर्म 1a', 'डॉक्टर', 'स्टूल टेस्ट', 'मल परीक्षण', 'टाइफाइड', 'लसीकरण', 'लस'],
    title: 'Mandatory Food Handler Medical Examinations & Vaccinations',
    standard: 'All food handlers must undergo a registered medical examination every 6 months, receive Form 1A medical fitness certificates, clear laboratory stool testing for enteric pathogens, and maintain valid Typhoid (TCV) & Hepatitis A vaccinations.',
    fssaiRef: 'FSSAI Licensing & Registration Regulations Section 3.1 & Schedule 4 Mandate',
    supervisorAction: [
      'Check daily for open cuts, skin rashes, eye discharge, or diarrhea/vomiting symptoms.',
      'Any staff member with active diarrhea, jaundice, or fever must be relieved from food handling immediately.',
      'Ensure all kitchen staff wear waterproof blue detectable plasters over any minor cuts.',
      'Verify staff hygiene before opening shift.'
    ],
    managerAction: [
      'Maintain Form 1A certificates and NABL stool test reports in the restaurant compliance dossier for all staff.',
      'Verify Typhoid Conjugate Vaccine (TCV) validity (valid for 3 years) and Hepatitis A immunization.',
      'Book an on-site FoodSafe Verified Medical Camp or NABL Stool Collection drive via the Marketplace.',
      'Present valid certificates during annual FSSAI and municipal health audits to avoid hefty fines or closure.'
    ],
    actionLink: { label: 'Book Staff Medical Camp & Stool Tests', href: '/providers?category=medical' }
  },
  {
    keywords: ['pest', 'cockroach', 'fly', 'rat', 'rodent', 'flies', 'insects', 'traps', 'कीट', 'तिलचट्टा', 'झुरळ', 'उंदीर', 'माशी', 'मक्खी', 'पेस्ट कंट्रोल', 'उंदरे'],
    title: 'Pest Sighting & Integrated Pest Management (IPM)',
    standard: 'Zero tolerance for live pests in food preparation, storage, and service areas. Only CIB&RC approved odorless formulations applied by licensed pest control operators may be used.',
    fssaiRef: 'FSSAI Schedule 4 Section 1.3 Pest Management Regulations',
    supervisorAction: [
      'Immediately cover, isolate, and remove all exposed food and clean utensils from the affected area.',
      'Check physical exclusion points: door sweeps, fly-mesh screens, drain strainers, air curtains.',
      'Never spray retail aerosol insecticide near food surfaces.',
      'Note the exact pest type, location, and time in the shift log and notify manager.'
    ],
    managerAction: [
      'Open a Critical Corrective Action ticket in the Action Centre.',
      'Dispatch an accredited commercial pest exterminator via the FoodSafe Marketplace for targeted gel baiting or ULB misting.',
      'Verify electronic fly killer (EFK) glue boards and UV tubes are active and not positioned over open food counters.',
      'Obtain and archive the Pest Service Job Card and chemical safety data sheet (MSDS) in the compliance record.'
    ],
    actionLink: { label: 'Book Verified Pest Exterminator', href: '/providers?category=pest-control' }
  },
  {
    keywords: ['handwash', 'hand wash', 'hands', 'soap', 'gloves', 'fingernails', 'hygiene', 'हाथ धोना', 'हात धुणे', 'साबुन', 'साबण', 'स्वच्छता', 'हाइजीन'],
    title: 'Handwashing Standards & Personal Hygiene Protocols',
    standard: 'Handwashing must take at least 20 seconds with antibacterial soap and warm potable water before touching food, after touching raw meat/poultry, after handling waste, and after using washrooms.',
    fssaiRef: 'FSSAI Schedule 4 Section 3.2 Personal Hygiene Mandate',
    supervisorAction: [
      'Ensure dedicated handwash basins have continuous potable water, liquid soap, and disposable paper towels.',
      'Correct handlers immediately if unwashed hands or improper glove usage is spotted.',
      'Discard any ready-to-eat garnishes or salads touched without prior handwashing.',
      'Enforce clean uniforms, hairnets covering all hair, and beard snoods.'
    ],
    managerAction: [
      'Ensure dedicated handwash sinks are never used for vegetable washing or utensil soaking.',
      'Conduct monthly 15-minute hygiene refreshers for opening and prep teams.',
      'Review daily hygiene scores in the AI Trend Analysis to identify shift-specific compliance dips.'
    ]
  },
  {
    keywords: ['oil', 'frying', 'tpm', 'tpc', 'smoke', 'burnt oil', 'polar compounds', 'तेल', 'कुकिंग ऑयल', 'खाद्यतेल', 'तळणे'],
    title: 'Cooking Oil Quality & Total Polar Compounds (TPC)',
    standard: 'Cooking oil must not exceed 25% Total Polar Compounds (TPC). Oil that becomes dark, viscous, foams heavily, or smokes at low temperature must be discarded.',
    fssaiRef: 'FSSAI RUCO (Repurpose Used Cooking Oil) Regulation 2018',
    supervisorAction: [
      'Check oil quality before peak service using a calibrated digital oil tester or test strips.',
      'Skim floating food crumbs frequently during frying to prevent premature oil degradation.',
      'If TPC reads > 25%, halt frying immediately, filter or discard oil, and refill with fresh oil.'
    ],
    managerAction: [
      'Ensure used cooking oil is never blended back into fresh oil.',
      'Maintain an FSSAI RUCO disposal register tracking liters discarded and collected by authorized bio-diesel recyclers.',
      'Audit deep fryer heating element thermostats to prevent oil scorching above 180°C.'
    ]
  },
  {
    keywords: ['grievance', 'customer complaint', 'diner complaint', 'hair', 'foreign object', 'undercooked', 'stone', 'glass'],
    title: 'Handling In-Dining Guest Safety Grievances',
    standard: 'All foreign physical contaminants or undercooked meal complaints must be contained on-site immediately by management within 2 minutes to protect guest safety and avoid public escalation.',
    fssaiRef: 'Food Safety & Standards Consumer Protection Guidelines',
    supervisorAction: [
      'Politely apologize without arguing, remove the dish immediately, and isolate the plate for kitchen inspection.',
      'Inspect the remaining batch in the kitchen immediately (e.g. check food pan for chipped utensils or foreign matter).',
      'Notify the restaurant General Manager immediately.'
    ],
    managerAction: [
      'Meet the diner at the table within 2 minutes with calm, empathetic resolution.',
      'Replace the dish or offer immediate dining relief per restaurant protocol.',
      'Check the Tabletop QR Grievance Alert on your manager dashboard and log the resolution.',
      'Investigate the kitchen prep line (audit cutting boards, hairnet compliance, glassware storage).'
    ],
    actionLink: { label: 'View Grievance in Action Centre', href: '/actions?tab=guest' }
  },
  {
    keywords: ['fostac', 'training', 'supervisor certificate', 'food safety supervisor'],
    title: 'Accredited FoSTaC Training & Certified Food Safety Supervisors',
    standard: 'Under FSSAI regulations, every licensed food establishment must have at least one trained and certified Food Safety Supervisor (FoSTaC) for every 25 food handlers.',
    fssaiRef: 'FSSAI Food Safety Training & Certification (FoSTaC) Mandate',
    supervisorAction: [
      'Apply FoSTaC golden rules in daily kitchen line operations.',
      'Conduct daily shift briefings on color-coded cutting boards (Red = raw meat, Yellow = poultry, Green = veg, Blue = seafood, White = dairy/bakery).'
    ],
    managerAction: [
      'Ensure at least one certified FoSTaC supervisor is physically present during every operating shift.',
      'Schedule periodic FoSTaC Advance Catering courses for new supervisory hires via the FoodSafe Marketplace.',
      'Maintain FoSTaC certificate records for inspection compliance.'
    ],
    actionLink: { label: 'Book FoSTaC Certification Training', href: '/providers?category=certification' }
  }
];

export function queryFoodSafetyAI(query: string, persona: PersonaRole): ChatMessage {
  const q = query.toLowerCase().trim();

  // Find best matching topic
  let bestTopic: KnowledgeTopic | null = null;
  let maxScore = 0;

  for (const topic of KNOWLEDGE_TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (q.includes(kw)) score += 2;
    }
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (bestTopic && maxScore > 0) {
    const isSupervisor = persona === 'supervisor';
    const steps = isSupervisor ? bestTopic.supervisorAction : bestTopic.managerAction;
    const personaTitle = isSupervisor ? 'Kitchen Supervisor Action Plan' : 'Manager Compliance & Audit Directive';

    let text = `### 🛡️ ${bestTopic.title}\n\n`;
    text += `**Regulatory Standard:** ${bestTopic.standard}\n\n`;
    text += `**FSSAI Reference:** ${bestTopic.fssaiRef}\n\n`;
    text += `#### 📋 ${personaTitle}:\n`;
    steps.forEach((step, idx) => {
      text += `${idx + 1}. ${step}\n`;
    });

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text,
      timestamp,
      roleContext: persona,
      references: [bestTopic.fssaiRef, 'FoodSafe365 Safe Kitchen Protocol'],
      actionLinks: bestTopic.actionLink ? [bestTopic.actionLink] : undefined,
      steps
    };
  }

  // Fallback intelligent general food-safety response
  return {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    text: `### 🛡️ Food Safety AI Assistant Advice\n\n` +
      `Regarding *"**${query}**"*, here are the mandatory food safety parameters under FSSAI Schedule 4:\n\n` +
      `1. **Cold-Chain Threshold:** Maintain chilled food strictly between **1°C and 5°C**, frozen foods at **< -18°C**.\n` +
      `2. **Thermal Cooking:** Core temperatures must reach **≥ 75°C** (measured with needle probe thermometer).\n` +
      `3. **2h/4h Rule:** High-risk foods exposed between 5°C and 60°C must be used within 2 hours or discarded if over 4 hours.\n` +
      `4. **Medical Fitness:** 6-monthly Form 1A certificates and NABL stool cultures for enteric pathogens are required for all handlers.\n` +
      `5. **Pest Exclusion:** Only CIB&RC approved food-safe pest solutions permitted.\n\n` +
      `*Tip: You can switch between **Supervisor** (floor containment) and **Manager** (audit & governance) mode above.*`,
    timestamp,
    roleContext: persona,
    references: ['FSSAI Schedule 4 General Hygienic Practices', 'HACCP Codex Alimentarius']
  };
}

