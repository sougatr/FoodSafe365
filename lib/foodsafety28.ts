export type OperationalShift = 'opening' | 'active' | 'closing' | 'specialized' | 'monthly_audit';

export type FoodSafeCheck = {
  id: number;
  code: string;
  category: string;
  title: string;
  target?: string;
  severity?: 'Critical' | 'Major' | 'Minor';
  frequency: 'Opening' | 'Daily' | 'Per shift' | 'Process' | 'As applicable';
  shift: OperationalShift;
  shiftTitle: string;
  timeEstimate: string;
  input: 'scale_1_5' | 'temperature' | 'yes_no';
  why: string;
  what: string[];
  standard: string;
  risk: string;
  action: string;
  outletType?: 'all' | 'bar_brewery' | 'cloud_kitchen' | 'catering';
  complianceRequirement?: 'mandatory' | 'desirable';
};

export const SHIFT_DEFINITIONS: Record<OperationalShift, {
  id: OperationalShift;
  name: string;
  subtitle: string;
  duration: string;
  timing: string;
  icon: string;
  description: string;
  itemCount: number;
}> = {
  opening: {
    id: 'opening',
    name: 'Opening Shift',
    subtitle: 'Pre-Service Readiness',
    duration: '2–3 mins',
    timing: 'Morning (Pre-Prep)',
    icon: '🌅',
    description: 'Completed in the morning before food preparation begins. Ensures the kitchen is a clean and safe environment to start cooking.',
    itemCount: 7
  },
  active: {
    id: 'active',
    name: 'Active Service',
    subtitle: 'Prep & Cooking Stations',
    duration: '2–3 mins',
    timing: 'Mid-Day / Active Rush',
    icon: '🍳',
    description: 'Quick sweep completed during service or delegated to station chefs (Chef de Partie) covering prep, cross-contamination, and cooking temperatures.',
    itemCount: 6
  },
  closing: {
    id: 'closing',
    name: 'Closing Shift',
    subtitle: 'Shutdown & Reset',
    duration: '2–3 mins',
    timing: 'Night (Post-Service)',
    icon: '🌙',
    description: 'Completed at the end of the night. Secures leftovers, safely stores meat, rotates FIFO inventory, and safeguards against overnight pests.',
    itemCount: 8
  },
  specialized: {
    id: 'specialized',
    name: 'Specialized Stations',
    subtitle: 'Conditional Operations',
    duration: '1–2 mins',
    timing: 'Operational Need',
    icon: '🏢',
    description: 'Targeted checks for Bar / Draught Beer, Cloud Kitchen Dispatch, and Outdoor Catering & Events.',
    itemCount: 6
  },
  monthly_audit: {
    id: 'monthly_audit',
    name: "Manager's Monthly",
    subtitle: 'Admin Compliance Audit',
    duration: '5 mins',
    timing: 'Monthly / Manager Only',
    icon: '📋',
    description: "Removed from daily floor supervisor routine. Admin audit for FoSTaC supervisor training and 6-monthly staff medical fitness records.",
    itemCount: 2
  }
};

export type Rating1To5 = 1 | 2 | 3 | 4 | 5;
export type Rating1To5OrNA = Rating1To5 | 'na';

export const NA_DEFINITION = {
  label: 'Not Applicable',
  badge: 'N/A — Not Applicable',
  description: 'Control or equipment is not applicable to this facility, shift, or operational setup',
  acceptable: true
};

export const RATING_DEFINITIONS: Record<Rating1To5, {
  label: string;
  badge: string;
  description: string;
  acceptable: boolean;
  severity?: 'critical' | 'attention';
}> = {
  5: { label: 'Excellent', badge: '5/5 — Excellent', description: 'Fully compliant with standard; clean, optimal control in place', acceptable: true },
  4: { label: 'Good', badge: '4/5 — Good', description: 'Standard met; acceptable condition with minor non-safety remark only', acceptable: true },
  3: { label: 'Marginal', badge: '3/5 — Needs Attention', description: 'Needs attention; control partially compromised, corrective action recommended', acceptable: false, severity: 'attention' },
  2: { label: 'Unsatisfactory', badge: '2/5 — Unsatisfactory', description: 'Standard not met; clear deviation requiring immediate correction', acceptable: false, severity: 'attention' },
  1: { label: 'Critical Hazard', badge: '1/5 — Critical Hazard', description: 'Severe failure or direct contamination risk; immediate action required', acceptable: false, severity: 'critical' },
};

export const FOODSAFE28: FoodSafeCheck[] = [
  // 1. Premises & Environment
  {
    id: 1,
    code: 'FS28-01',
    category: 'Premises & Environment',
    title: 'Are all counters, floors, and prep areas clean and clutter-free right now?',
    target: 'Maintain continuous upkeep. Minor lapses must be managed immediately.',
    severity: 'Major',
    frequency: 'Opening',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Clean food preparation zones, counters, and floors prevent physical and microbial cross-contamination into ingredients and ready-to-eat dishes.',
    what: ['Inspect food prep tables, cutting areas, floors, and surrounding walls before starting food prep.', 'Verify no dirt, chemical residues, or debris on working food surfaces.'],
    standard: 'All food premises and food-contact preparation surfaces must be clean, sanitized, and maintained in an orderly condition.',
    risk: 'Accumulated grease, food residues, and soil harbor bacteria that transfer directly to foods.',
    action: 'Halt preparation on affected counters; thoroughly sweep, wash, sanitize, and verify surfaces before resumption.',
    outletType: 'all'
  },
  {
    id: 2,
    code: 'FS28-03',
    category: 'Premises & Environment',
    title: 'Are the kitchen drains flowing freely with no foul smell?',
    target: 'Drains must be free of grease buildup to prevent odors and pest attraction.',
    severity: 'Major',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Blocked, slow, or dirty drains cause standing water, foul odors, sewer gas back-draft, and provide prime breeding zones for cockroaches and fruit flies.',
    what: ['Inspect all kitchen floor drains, trench drains, and sink outlets.', 'Verify water flows freely with no pooling, foul odor, or grease trap overflow.'],
    standard: 'Drains must be clean, fitted with strainers/gratings, clear of grease accumulation, and free-flowing at all operational times.',
    risk: 'Standing grey water and clogged grease traps cause severe contamination and attract pest infestations.',
    action: 'Clear strainer baskets immediately; flush and degrease drains; request emergency plumbing or drain jetting if water fails to drain.',
    outletType: 'all'
  },
  {
    id: 3,
    code: 'FS28-04',
    category: 'Premises & Environment',
    title: 'Are windows, doors, and fly-screens closed to keep pests out?',
    target: 'Physical barriers must be intact. This is a fundamental FSSAI structural requirement.',
    severity: 'Critical',
    frequency: 'Opening',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Intact physical barriers (door sweeps, air curtains, wire-mesh screens) keep pests, rodents, and birds from infiltrating food zones.',
    what: ['Check external doors for tight seal and intact bottom sweeps (no gap > 6mm).', 'Verify insect fly-wire screens on kitchen windows are tear-free and closed.', 'Ensure air curtains at service doors are powered on.'],
    standard: 'All openings to external environments must be fitted with intact mesh/screens, door sweeps, or air curtains with no gaps allowing pest ingress.',
    risk: 'Open access allows rodents, flies, and street pests to enter food storage and cooking areas.',
    action: 'Close doors immediately; log maintenance work-order for damaged screens or missing door sweeps; deploy temporary physical barrier.',
    outletType: 'all'
  },

  // 2. Staff Hygiene & Health
  {
    id: 4,
    code: 'FS28-05',
    category: 'Staff Hygiene & Health',
    title: 'Did all staff wash their hands with soap before starting work?',
    target: 'Hands must be washed after breaks and between tasks to prevent cross-contamination.',
    severity: 'Critical',
    frequency: 'Per shift',
    shift: 'active',
    shiftTitle: 'Active Service (Prep & Cooking Stations)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Unwashed hands are the single largest transmission vector of enteric pathogens (Norovirus, Staphylococcus aureus, Salmonella) to food.',
    what: ['Observe staff washing hands before starting food preparation or handling ready-to-eat foods.', 'Verify handwashing occurs immediately after handling raw meats, handling waste, cleaning, or visiting washrooms.'],
    standard: 'Food handlers must thoroughly wash hands with soap and potable warm water for at least 20 seconds before touching food or clean utensils.',
    risk: 'Pathogens transferred from dirty hands directly inoculate ready-to-eat foods, causing rapid customer food poisoning.',
    action: 'Instruct handler to stop immediately, wash and sanitize hands correctly, and discard any ready-to-eat food touched with unwashed hands.',
    outletType: 'all'
  },
  {
    id: 5,
    code: 'FS28-06',
    category: 'Staff Hygiene & Health',
    title: 'Are all hand-wash sinks fully stocked with soap and drying towels/tissue?',
    target: 'Sinks must be accessible and usable at all times.',
    severity: 'Critical',
    frequency: 'Opening',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Staff cannot follow handwashing protocols if designated sinks are blocked, dry, or missing soap and tissue.',
    what: ['Check each dedicated handwash basin in kitchen, bar, and dishwashing areas.', 'Verify uninterrupted running potable water, antibacterial liquid soap in dispensers, and single-use tissue or air dryers.', 'Ensure handwash sink is not used for dishwashing or food prep.'],
    standard: 'Dedicated handwash basins must be accessible, unobstructed, and continuously stocked with running water, liquid soap, and hygienic tissue supplies.',
    risk: 'Missing soap or tissue forces staff to skip handwashing or use contaminated aprons/cloths to dry hands.',
    action: 'Restock liquid soap and paper tissue immediately; unblock sink access; report plumbing issues for rapid repair.',
    outletType: 'all',
    complianceRequirement: 'mandatory'
  },
  {
    id: 6,
    code: 'FS28-07',
    category: 'Staff Hygiene & Health',
    title: 'Is everyone on shift wearing a clean uniform, apron, and hairnet?',
    target: 'Clean protective clothing prevents physical and biological contamination.',
    severity: 'Critical',
    frequency: 'Per shift',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Street clothes and exposed hair shed foreign matter, dandruff, and bacteria directly into exposed food.',
    what: ['Check that all food handlers wear clean company uniforms or protective chef jackets/aprons.', 'Verify hair nets, chef caps, or beard nets completely enclose all hair.', 'Ensure no jewelry (rings, bracelets, watches) is worn during food handling, except plain wedding band.'],
    standard: 'All personnel in food-handling areas must wear clean protective outer clothing, complete head coverings, and zero loose jewelry.',
    risk: 'Hair fall, fiber shedding, and jewelry contaminants falling into prepared customer food.',
    action: 'Provide clean apron/head net immediately; require staff to remove prohibited jewelry before entering production lines.',
    outletType: 'all'
  },
  {
    id: 7,
    code: 'FS28-08',
    category: 'Staff Hygiene & Health',
    title: 'Are supervisor FoSTaC and staff training certificates (optional) up to date and available?',
    target: 'Requirement for food-hygiene training.',
    severity: 'Minor',
    frequency: 'Daily',
    shift: 'monthly_audit',
    shiftTitle: "The Manager's Monthly (Admin Audit)",
    timeEstimate: '5 mins',
    input: 'scale_1_5',
    why: 'Staff food safety training is desirable and recommended to build kitchen hygiene awareness and prevent errors.',
    what: ['Verify presence of trained or FoSTaC certified supervisor (desirable/recommended).', 'Review internal induction and hygiene awareness records for kitchen handlers.'],
    standard: 'Food safety training is desirable and recommended for supervisors and handlers to reinforce hygienic practices.',
    risk: 'Lack of basic hygiene awareness can lead to poor temperature control or allergen segregation.',
    action: 'Encourage enrollment in desirable FoSTaC training programs; conduct routine internal hygiene briefing.',
    outletType: 'all',
    complianceRequirement: 'desirable'
  },
  {
    id: 8,
    code: 'FS28-09',
    category: 'Staff Hygiene & Health',
    title: 'Are staff medical fitness certificates and 6-monthly stool test records current?',
    target: 'Administrative check frequently targeted during surprise FDA/FSSAI inspections.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'monthly_audit',
    shiftTitle: "The Manager's Monthly (Admin Audit)",
    timeEstimate: '5 mins',
    input: 'scale_1_5',
    why: 'Food handlers carrying enteric pathogens (Salmonella Typhi, Hepatitis A, parasites) can silently transmit devastating waterborne and foodborne illnesses.',
    what: ['Verify valid 6-monthly medical fitness certificates (Form 1A) for all food handlers, including laboratory stool examination.', 'Check valid vaccinations (Typhoid vaccine every 3 years, Hepatitis A).', 'Ensure staff with active diarrhea, vomiting, fever, or open infected skin lesions are strictly excluded from food handling.'],
    standard: '100% of food handlers must hold active Form 1A medical fitness certificates with stool test clearance, up-to-date Typhoid & Hep A vaccinations, and daily symptom exclusion.',
    risk: 'Asymptomatic typhoid or hepatitis carriers shedding massive viral/bacterial loads into salads, sauces, and drinks.',
    action: 'Immediately exclude symptomatic or medically uncertified handlers from food contact; schedule certified diagnostic lab medical camp via service hub.',
    outletType: 'all'
  },

  // 3. Receiving & Storage
  {
    id: 9,
    code: 'FS28-10',
    category: 'Receiving & Storage',
    title: 'Were today’s raw materials checked for freshness and pests before accepting?',
    target: 'Reject spoiled goods before they enter the inventory.',
    severity: 'Major',
    frequency: 'Daily',
    shift: 'active',
    shiftTitle: 'Active Service (Prep & Cooking Stations)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Preventing compromised, expired, or temperature-abused raw materials at receiving protects the entire kitchen chain.',
    what: ['Inspect delivery packaging for punctures, swelling, or pest signs.', 'Check delivery vehicle cleanliness and verify refrigerated items arrive at < 5°C and frozen items at < −18°C.', 'Check manufacturing dates, FSSAI license on supplier labels, and expiry dates.'],
    standard: 'Deliveries must be inspected upon arrival; perishables must arrive under verified cold chain (< 5°C chilled, < −18°C frozen); packaging must be intact and uncompromised.',
    risk: 'Accepting spoiled, rotten, or temperature-abused supplies contaminates the store and endangers finished dishes.',
    action: 'Reject compromised or warm delivery batches; document supplier rejection slip; record deviation in receiving log.',
    outletType: 'all'
  },
  {
    id: 10,
    code: 'FS28-11',
    category: 'Receiving & Storage',
    title: 'Is raw meat stored on the bottom shelves, completely away from vegetables and cooked food?',
    target: 'Strict segregation is absolutely essential to prevent fatal biological cross-contamination.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Raw animal proteins carry high pathogenic bacterial loads (Salmonella, Campylobacter) that drip or transfer onto cooked or ready-to-eat foods.',
    what: ['Check refrigerator and walk-in chiller shelving layout.', 'Verify raw meats/poultry are stored on the bottom shelves below ready-to-eat foods, dairy, and cooked preps.', 'Ensure separate color-coded sealed containers are used.'],
    standard: 'Raw animal products must be stored physically below or in separate units from ready-to-eat foods, prepped produce, and cooked items at all times.',
    risk: 'Raw meat blood or condensation dripping onto cooked items causes severe microbial cross-contamination.',
    action: 'Rearrange storage shelves immediately; place raw items at the bottom; discard any ready-to-eat items contaminated by dripping.',
    outletType: 'all'
  },
  {
    id: 11,
    code: 'FS28-12',
    category: 'Receiving & Storage',
    title: 'Is all food stored in closed containers at least 6 inches off the floor?',
    target: 'Pallets or shelves must be used. Basic FSSAI storage mandate.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Placing food bags or boxes directly on floors exposes them to mop water, floor sweepings, dirt, and ground pests.',
    what: ['Inspect dry store, cold room, and prep areas.', 'Verify all food containers, crates, and sacks are placed on raised shelves or pallets at least 15 cm (6 inches) off the floor.', 'Check that opened bags are transferred to food-grade containers with lids.'],
    standard: 'All food ingredients and containers must be stored at least 15 cm off the floor on clean racks or pallets, away from walls, in covered food-grade containers.',
    risk: 'Moisture absorption, cardboard dampening, pest entry, and chemical floor-cleaner contamination.',
    action: 'Lift all food items off the floor onto clean racks/pallets immediately; decant opened bags into labeled airtight food containers.',
    outletType: 'all'
  },
  {
    id: 12,
    code: 'FS28-13',
    category: 'Receiving & Storage',
    title: 'Is all food labeled with a date, and is older stock pulled to the front to be used first?',
    target: 'Ensure proper inventory health and prevent the usage of expired food.',
    severity: 'Major',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Stock rotation ensures older stock is consumed before expiry, preventing spoilage, mold, and stale ingredient hazards.',
    what: ['Check expiration dates and preparation day-labels on stored sauces, marinades, preps, and dairy.', 'Verify new stock is placed behind existing stock on shelves.', 'Inspect for any expired, unlabelled, or decaying items.'],
    standard: 'All prepared and perishable foods must carry date labels with preparation and discard dates; oldest stock must be utilized first (FIFO/FEFO).',
    risk: 'Accidental preparation and serving of expired or decomposed food to guests.',
    action: 'Rotate shelves so earliest-expiry items are at the front; immediately discard any stock past its use-by or expiration date.',
    outletType: 'all'
  },

  // 4. Prep & Cross-Contamination
  {
    id: 13,
    code: 'FS28-15',
    category: 'Prep & Cross-Contamination',
    title: 'Are fruits and vegetables thoroughly washed before chopping?',
    target: 'Crucial step, especially for foods served raw.',
    severity: 'Major',
    frequency: 'Process',
    shift: 'active',
    shiftTitle: 'Active Service (Prep & Cooking Stations)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Raw agricultural produce carries field soil, bird droppings, parasitic cysts (Giardia, Amoeba), and pesticide residues.',
    what: ['Inspect produce washing area before chopping salads or garnishes.', 'Verify vegetables and fruits are washed in clean running potable water and sanitized with food-grade sanitizing solution (50 ppm chlorine rinse or approved fruit/veg wash).'],
    standard: 'Raw vegetables, salad greens, and fresh herbs must be washed in clean potable water and sanitized with approved food-grade wash before preparation or service.',
    risk: 'Transmission of parasitic cysts, Listeria, and norovirus through raw unwashed salads and garnishes.',
    action: 'Re-wash and sanitize unwashed produce before slicing; discard unwashed salads already mixed with ready-to-eat ingredients.',
    outletType: 'all'
  },
  {
    id: 14,
    code: 'FS28-16',
    category: 'Prep & Cross-Contamination',
    title: 'Are staff strictly using different colored cutting boards for raw meat vs. veg?',
    target: 'Highly recommended FSSAI best practice to prevent cross-contamination.',
    severity: 'Major',
    frequency: 'Process',
    shift: 'active',
    shiftTitle: 'Active Service (Prep & Cooking Stations)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Using the same knife or board for raw poultry and salad vegetables transfers live pathogens into food that receives no further cooking.',
    what: ['Observe kitchen prep stations during live service.', 'Verify strict color-coding: Red (Raw Meat), Yellow (Raw Poultry), Blue (Raw Fish), Green (Vegetables/Fruits), White (Dairy/Bakery).', 'Ensure knives and boards are not interchanged without washing and sanitizing.'],
    standard: 'Distinct, color-coded cutting boards and knives must be used exclusively for designated food groups (raw meat vs cooked vs produce).',
    risk: 'Pathogen transfer from raw animal flesh onto ready-to-eat salad, bread, or cooked food.',
    action: 'Immediately replace wrong cutting board/knife; wash and sanitize station; discard ready-to-eat food touched with raw meat utensils.',
    outletType: 'all'
  },
  {
    id: 15,
    code: 'FS28-17',
    category: 'Prep & Cross-Contamination',
    title: 'Are shared tools like blenders and meat slicers washed immediately after use?',
    target: 'Food-contact equipment is a direct vector for bacteria if left dirty.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Dismantled equipment parts (slicer blades, blender gaskets, peelers) trap food residues that turn into bacterial biofilms.',
    what: ['Inspect meat slicers, mixers, blenders, graters, and prep knives.', 'Check that removable blades, seals, and gaskets are disassembled, washed, and chemically sanitized daily.', 'Verify no dried food crust or grease buildup.'],
    standard: 'All equipment and utensils coming in contact with food must be cleaned and sanitized at least every 4 hours during continuous use, and at end of shift.',
    risk: 'Biofilms harboring Listeria monocytogenes and Staphylococcus cross-contaminating successive food batches.',
    action: 'Dismantle equipment, thoroughly wash in hot detergent water, soak in sanitizer, air-dry, and reassemble.',
    outletType: 'all'
  },
  {
    id: 16,
    code: 'FS28-18',
    category: 'Prep & Cross-Contamination',
    title: 'Is all prepped food covered with lids or wrap while waiting for service?',
    target: 'Prevents physical and airborne contamination during kitchen service.',
    severity: 'Critical',
    frequency: 'Process',
    shift: 'active',
    shiftTitle: 'Active Service (Prep & Cooking Stations)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Exposed food bowls, garnishes, and intermediate prep items are vulnerable to airborne droplets, dust, overhead condensation, and accidental splashes.',
    what: ['Inspect chef prep counters, pass counter, and intermediate holding stations.', 'Verify food containers are fitted with lids, clean plastic wrap, or food-grade covers when not in active use.', 'Ensure utensils are stored with handles extending outside food.'],
    standard: 'All prepped foods, sauces, and ingredients awaiting cooking or plating must be covered and protected from contamination.',
    risk: 'Airborne dust, sweat droplets, hair, and cross-contamination from adjacent prep activities falling into open food.',
    action: 'Cover all open containers immediately; discard any exposed food with visible foreign matter or condensation dripping.',
    outletType: 'all'
  },

  // 5. Temperature Control
  {
    id: 17,
    code: 'FS28-19',
    category: 'Temperature Control',
    title: 'Are all fridges reading below 5°C?',
    target: 'Verify cool-storage temperature to prevent bacterial growth.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'temperature',
    why: 'Keeping perishable foods continuously at < 5°C (0°C to < 5°C) suppresses bacterial proliferation and prevents spoilage.',
    what: ['Read the external digital thermometer and verify with an internal calibrated thermometer probe.', 'Check cool room, reach-in refrigerators, and under-counter prep chillers.', 'Verify doors seal tightly and air circulation is not blocked by overfilling.'],
    standard: 'Operational standard: Cool storage and refrigerators must maintain internal food temperatures at < 5°C (0°C to < 5°C).',
    risk: 'Temperatures above 5°C enter the danger zone, allowing rapid multiplication of food-poisoning bacteria.',
    action: 'Check condenser fans, adjust thermostat, transfer perishables to alternative working chiller, and call refrigeration technician if temperature cannot be stabilized.',
    outletType: 'all'
  },
  {
    id: 18,
    code: 'FS28-20',
    category: 'Temperature Control',
    title: 'Are all freezers reading below -18°C?',
    target: 'Core FSSAI requirement for deep cold storage.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'temperature',
    why: 'Deep freezing at < −18°C stops all microbial growth and halts enzymatic decomposition of frozen meats and raw stocks.',
    what: ['Read the freezer display and verify with a calibrated temperature probe.', 'Check walk-in deep freezers, chest freezers, and ice-cream storage units.', 'Inspect for heavy ice build-up, frost encrustation, or door gasket leaks.'],
    standard: 'Operational standard: Freezers and cold storage units must maintain continuous air and food temperatures at < −18°C.',
    risk: 'Temperatures above −18°C cause thawing, surface microbial revival, loss of texture, and freezer burn.',
    action: 'Defrost excess ice buildup, verify door seal gasket; transfer products to back-up freezer; log emergency technician service ticket.',
    outletType: 'all'
  },
  {
    id: 19,
    code: 'FS28-21',
    category: 'Temperature Control',
    title: 'Is hot food reaching at least 75°C in the center?',
    target: 'Verify cooking or reheating temperatures with a calibrated probe to guarantee pathogens are killed.',
    severity: 'Critical',
    frequency: 'Process',
    shift: 'active',
    shiftTitle: 'Active Service (Prep & Cooking Stations)',
    timeEstimate: '2–3 mins',
    input: 'temperature',
    why: 'Cooking to adequate core temperature destroys vegetative foodborne pathogens (Salmonella, E. coli, Listeria) in meats, poultry, and gravies.',
    what: ['Insert a clean, sanitized probe thermometer into the thickest part of the food.', 'Verify minimum target: Non-veg core ≥ 75°C for 15 sec (or 70°C for 2 min); Veg core ≥ 65°C for 2 min. Reheating: core ≥ 75°C for 2 min.'],
    standard: 'FSSAI Hygiene Rating: Cooking must achieve validated core temperature and time; Reheating must achieve ≥ 75°C throughout using direct heat equipment.',
    risk: 'Undercooked meat, poultry, or eggs harbor live pathogens that directly trigger acute foodborne illness.',
    action: 'Continue cooking/reheating until target core temperature is attained; never serve food that fails temperature verification.',
    outletType: 'all'
  },
  {
    id: 20,
    code: 'FS28-22',
    category: 'Temperature Control',
    title: 'Are hot foods split into shallow pans or chilled in an ice bath before refrigeration?',
    target: 'Cool to ≤ 21°C before placing in the fridge. Never place large hot pots directly into cold storage or leave food at room temperature.',
    severity: 'Major',
    frequency: 'Process',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'temperature',
    why: 'Slow cooling allows spore-forming bacteria (Clostridium perfringens, Bacillus cereus) to germinate and release heat-stable toxins.',
    what: ['Track cooling batches of gravies, rice, lentils, and cooked meats.', 'Verify food cools from 60°C to 21°C within 2 hours, and reaches 5°C within a further 2 hours.', 'Check use of shallow pans, ice baths, or blast chillers.'],
    standard: 'FSSAI 2-stage cooling protocol: Cool high-risk cooked food from 60°C to 21°C in ≤ 2 hours, and from 21°C to 5°C in ≤ 2 additional hours.',
    risk: 'Spore germination and toxin production in slow-cooling warm food masses that cannot be made safe even by subsequent recooking.',
    action: 'Divide large batches into shallow pans (depth < 5 cm); place in ice water bath or blast chiller; discard batches exceeding the 4-hour limit.',
    outletType: 'all'
  },

  // 6. Cleaning, Pests & Waste
  {
    id: 21,
    code: 'FS28-26',
    category: 'Cleaning, Pests & Waste',
    title: 'Are there zero signs of rats, cockroaches, or droppings in the kitchen today?',
    target: 'Any active signs are an immediate red flag and reason for license suspension.',
    severity: 'Critical',
    frequency: 'Opening',
    shift: 'opening',
    shiftTitle: 'The Opening Shift (Pre-Service Readiness)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Physical pest signs indicate active infestation and direct contamination of kitchen food contact zones.',
    what: ['Inspect dark corners, motor housings behind refrigeration units, under prep sinks, dry storage racks, and false ceilings.', 'Look for live or dead pests (cockroaches, flies, rodents), droppings, rub marks, or gnawed packaging.'],
    standard: 'Food-handling, preparation, and storage areas must be completely free of active pests and evidence of infestation.',
    risk: 'Cockroaches, rodents, and flies vector Salmonella, Shigella, and parasitic organisms into open foods.',
    action: 'Quarantine and discard any food showing signs of pest contact; deep-clean and sanitize zone; log emergency pest-control eradication call.',
    outletType: 'all'
  },
  {
    id: 22,
    code: 'FS28-27',
    category: 'Cleaning, Pests & Waste',
    title: 'Are the fly-catchers turned on and pest-bait stations undisturbed?',
    target: 'Devices must be operational and vendor service logs current.',
    severity: 'Critical',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Operational pest traps provide early detection and defensive perimeter control before infestations spread.',
    what: ['Verify electric insect light traps / fly-killers are switched on and catch trays/glue boards are clean and not overloaded.', 'Inspect tamper-evident rodent bait boxes around perimeter (must be numbered, secured, and unbroken).', 'Check that monthly professional pest management service logs and pesticide safety data sheets are up to date.'],
    standard: 'All insect light traps must be powered and clean; exterior bait stations intact; vendor contract and service logs verified and current.',
    risk: 'Defective fly-killers and lapsed vendor service allow insect and rodent populations to multiply undetected.',
    action: 'Turn on/repair fly-catchers; replace full glue boards; reposition missing bait boxes; book urgent vendor service.',
    outletType: 'all'
  },
  {
    id: 23,
    code: 'FS28-28',
    category: 'Cleaning, Pests & Waste',
    title: 'Are all kitchen dustbins covered with a lid, and is the outside garbage area clean?',
    target: 'Standard hygiene requirement to contain waste and avoid attracting pests.',
    severity: 'Major',
    frequency: 'Daily',
    shift: 'closing',
    shiftTitle: 'The Closing Shift (Shutdown & Reset)',
    timeEstimate: '2–3 mins',
    input: 'scale_1_5',
    why: 'Overflowing, uncovered waste bins attract pests, generate foul odors, and cross-contaminate food handlers.',
    what: ['Check all kitchen waste bins: must be foot-pedal operated with tightly fitting lids and plastic liners.', 'Verify bins are emptied before overflowing (at least at end of each shift).', 'Inspect external waste yard: bins covered, area swept, washed, and free of pooled leachate or fly swarms.'],
    standard: 'Waste must be stored in closed, lined pedal bins, emptied regularly, and external disposal areas kept clean, disinfected, and pest-free.',
    risk: 'Fly breeding, rodent attraction, and cross-contamination when staff touch bin lids with bare hands.',
    action: 'Empty overflowing bins immediately; wash bin exteriors; replace broken pedal mechanisms; disinfect garbage enclosure.',
    outletType: 'all'
  },

  // 7. Specialized Operations
  {
    id: 24,
    code: 'FS28-29',
    category: 'Specialized Operations',
    title: 'Bar: Is the inside of the ice machine clean, and is the ice scoop stored outside the ice?',
    target: 'Ice is treated as food; dirty machines are a massive hidden source of mold.',
    severity: 'Major',
    frequency: 'Opening',
    shift: 'specialized',
    shiftTitle: 'Specialized Stations (Conditional)',
    timeEstimate: '1–2 mins',
    input: 'scale_1_5',
    why: 'Ice is classified as ready-to-eat food under FSSAI. Contaminated ice machines harbor black mold and slime; scooping ice with drinking glasses causes dangerous glass breakage in the bin.',
    what: ['Open commercial ice machine lid and inspect interior walls, evaporator plate, and water curtain for mold, pink slime, or mineral scale.', 'Check that ice scoop is stainless steel or heavy-duty food-grade plastic, kept in an external sanitized holder (NEVER stored inside ice bin).', 'Verify that glass cups or mugs are NEVER used to scoop ice.'],
    standard: 'Ice makers must be sanitized free of mold/biofilm; dedicated ice scoop stored in clean external holster; strictly zero glass scoops in ice bins.',
    risk: 'Serving contaminated ice in beverages causing bacterial gastroenteritis; catastrophic glass chipping hazards in drinks.',
    action: 'Discard all ice immediately if glass breaks or mold is spotted; de-scale and sanitize ice machine interior; sanitize ice scoop and holster.',
    outletType: 'bar_brewery'
  },
  {
    id: 25,
    code: 'FS28-30',
    category: 'Specialized Operations',
    title: 'Bar: Are beer lines, drink nozzles, and drip trays wiped down and sanitized?',
    target: 'Impacts beverage quality and localized hygiene.',
    severity: 'Minor',
    frequency: 'Daily',
    shift: 'specialized',
    shiftTitle: 'Specialized Stations (Conditional)',
    timeEstimate: '1–2 mins',
    input: 'scale_1_5',
    why: 'Beer lines, post-mix soda gun diffusers, and beer faucets accumulate wild yeast, beer stone, bacterial biofilm, and attract fruit flies.',
    what: ['Inspect bar soda guns, beer tap spouts, and fountain dispensing nozzles.', 'Verify nozzles and diffusers are unscrewed and soaked in food-grade sanitizing solution daily.', 'Check draft beer lines cleaning log (must be flushed with line cleaner every 14 days).', 'Verify bar drip trays and drain tubes are flushed with hot water and free of slime.'],
    standard: 'Dispensing nozzles and tap faucets must be cleaned and sanitized daily; drip trays flushed; draught beer lines chemically cleaned on verified bi-weekly schedule.',
    risk: 'Biofilm growth in beer lines imparting foul taste; fruit fly infestation in sticky dispenser nozzles contaminating guest beverages.',
    action: 'Remove and soak all dispenser nozzles in sanitizer immediately; flush drip wells with hot water; schedule certified draft line flush.',
    outletType: 'bar_brewery'
  },
  {
    id: 26,
    code: 'FS28-31',
    category: 'Specialized Operations',
    title: 'Cloud Kitchen: Are all outgoing delivery bags sealed shut so food cannot be tampered with?',
    target: 'Tamper-evident seals are strictly mandated by FSSAI for all e-commerce deliveries.',
    severity: 'Critical',
    frequency: 'Per shift',
    shift: 'specialized',
    shiftTitle: 'Specialized Stations (Conditional)',
    timeEstimate: '1–2 mins',
    input: 'scale_1_5',
    why: 'For delivery-only orders, packaging is the sole barrier against tampering, vehicular pollution, spills, and microbial contamination during motorcycle transit.',
    what: ['Inspect packaging materials: food-grade containers, leak-proof lids for curries/gravies, steam-vented boxes for fried items.', 'Verify every delivery bag is sealed with a tamper-evident sticker or secure tape.', 'Check order labels: must display packing timestamp, use-by/consumption window (e.g. "Consume within 2 hours"), and clear Veg/Non-Veg markers.'],
    standard: '100% of delivery orders must be packed in food-grade leak-proof containers, secured with intact tamper-evident seals, and labeled with time of packing and consumption deadline.',
    risk: 'Food spills, external dust/rain ingress during transit, courier tampering, and delivery of spoiled or time-abused meals.',
    action: 'Repack any leaking or improperly sealed order; apply fresh tamper seal before rider handover; never dispatch unsealed bags.',
    outletType: 'cloud_kitchen'
  },
  {
    id: 27,
    code: 'FS28-32',
    category: 'Specialized Operations',
    title: 'Cloud Kitchen: Is food waiting for riders kept in hot/cold bags instead of sitting on the counter?',
    target: 'Staging temperature control ensures food quality and safety until courier pickup.',
    severity: 'Minor',
    frequency: 'Per shift',
    shift: 'specialized',
    shiftTitle: 'Specialized Stations (Conditional)',
    timeEstimate: '1–2 mins',
    input: 'scale_1_5',
    why: 'Cooked delivery food staged on ambient dispatch tables enters the danger zone (5°C to 60°C) while waiting for delivery riders, causing rapid bacterial growth.',
    what: ['Inspect the delivery dispatch / pass staging area.', 'Verify hot dishes are held in heated pass cabinets or under heat lamps (≥ 65°C) until rider arrival.', 'Verify cold desserts, salads, and beverages are held in dispatch chillers (≤ 5°C) until pickup.', 'Check that ambient staging time never exceeds 15 minutes.'],
    standard: 'Packed delivery orders must remain under active hot-holding (≥ 65°C) or cold-holding (≤ 5°C) until physical handover to the delivery courier.',
    risk: 'Prolonged room-temperature staging combined with 30-45 minute delivery transit leads to dangerous microbial growth.',
    action: 'Move staged food into heated pass units or cold storage immediately; expedite courier handover; discard orders staged at room temperature for over 45 minutes.',
    outletType: 'cloud_kitchen'
  },
  {
    id: 28,
    code: 'FS28-33',
    category: 'Specialized Operations',
    title: 'Catering: Is food traveling to the venue packed securely in insulated hot/cold boxes?',
    target: 'Core temperature maintenance during transit is essential to avoid the danger zone.',
    severity: 'Critical',
    frequency: 'Process',
    shift: 'specialized',
    shiftTitle: 'Specialized Stations (Conditional)',
    timeEstimate: '1–2 mins',
    input: 'scale_1_5',
    why: 'Catering logistics involve high-risk transport over road traffic; cooked banquet food must maintain safe temperatures inside insulated transport containers.',
    what: ['Inspect insulated food transport carriers (thermoboxes / Cambros): clean, gasket seals intact, pre-heated or pre-chilled.', 'Record core temperature of food right before loading at kitchen and immediately upon arrival at the banquet venue.', 'Verify transport vehicle is clean and free of non-food items.'],
    standard: 'Insulated transport containers must maintain hot foods at ≥ 65°C and cold foods at ≤ 5°C throughout vehicular transit from commissary to venue.',
    risk: 'Temperature drop during road transport allowing spore germination (Clostridium, Bacillus) across large banquet food batches.',
    action: 'Transfer into pre-heated chafing dishes immediately upon venue arrival; re-heat to ≥ 75°C core if food dropped below 60°C for under 2 hours; discard if temperature abused.',
    outletType: 'catering'
  },
  {
    id: 29,
    code: 'FS28-34',
    category: 'Specialized Operations',
    title: 'Catering: Is there a working hand-wash station and safe drinking water set up at the event?',
    target: 'Cannot operate a safe temporary food service without potable water and handwashing facilities.',
    severity: 'Critical',
    frequency: 'Opening',
    shift: 'specialized',
    shiftTitle: 'Specialized Stations (Conditional)',
    timeEstimate: '1–2 mins',
    input: 'scale_1_5',
    why: 'Outdoor and banquet venues frequently lack potable plumbing; using raw untreated ground water or lacking handwash stations triggers catastrophic waterborne food poisoning.',
    what: ['Verify dedicated food-grade potable water cans/tankers for cooking, ice, and beverage dispensing.', 'Check setup of a functioning mobile handwashing station at the catering back-of-house area: running water container with turn-tap, liquid soap, and paper towels.', 'Ensure event service staff wash hands before plating buffets.'],
    standard: 'Only verified potable water may be used for food/beverage prep; a fully equipped portable handwashing station must be operational before any event food handling begins.',
    risk: 'Untreated non-potable water and unwashed server hands contaminating banquet buffet lines serving hundreds of guests.',
    action: 'Halt all food plating until potable water is verified and portable handwash station with soap and running water is operational.',
    outletType: 'catering'
  }
];

export const DAILY_BADGE_RULES = {
  green: 'All scheduled checks reviewed and approved; no unresolved food-safety alerts.',
  yellow: 'All scheduled checks reviewed, but one or more operational attention alerts remain open or in progress.',
  red: 'A critical food-safety alert remains unresolved or requires immediate corrective action.',
  pending: 'Supervisor checks have been submitted and are awaiting manager review.',
  progress: 'Daily scheduled food-safety checks are still in progress.'
};

export type CheckRecord = {
  status: 'good' | 'attention' | 'na';
  value: string;
  time: string;
  reviewStatus: 'pending_manager' | 'approved' | 'alerted';
  managerNote?: string;
  reviewedAt?: string;
  storageType?: string;
  processMode?: string;
  holdingType?: string;
};

export type Issue = {
  id: string;
  checkId: number;
  checkCode: string;
  title: string;
  severity: 'attention' | 'critical';
  createdAt: string;
  status: 'open' | 'action_in_progress' | 'awaiting_verification' | 'closed';
  actionId?: string;
  alertedAt?: string;
  verifiedAt?: string;
};

export type CorrectiveAction = {
  id: string;
  issueId: string;
  checkCode: string;
  title: string;
  description: string;
  severity: 'attention' | 'critical';
  status: 'open' | 'in_progress' | 'awaiting_verification' | 'closed';
  createdAt: string;
  immediateAction: string;
  correctiveAction: string;
  rootCause: string;
  completedAt?: string | null;
  closedAt?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationStatus?: 'pass' | 'fail' | null;
  verificationNote?: string | null;
};

export type AuditTrailEvent = {
  id: string;
  at: string;
  type: string;
  detail: string;
  status?: string;
};

export type DinerSafetyRating = {
  id: string;
  outletId: string;
  outletName: string;
  createdAt: string;
  dinerName?: string;
  dinerMobile?: string;
  tableNumber?: string;
  scores: {
    cleanliness: number;     // 1-5: Dining Area & Table Cleanliness
    staffHygiene: number;    // 1-5: Server & Staff Hygiene
    foodFreshness: number;   // 1-5: Food Freshness & Temperature
    safeWater: number;       // 1-5: Safe Drinking Water & Clean Glasses
    washroom: number;        // 1-5: Washroom & Handwashing Station
  };
  overallScore: number;      // Average of scores (e.g. 4.6)
  feedback?: string;
  verifiedDineIn: boolean;
};

export type DinerIncidentReport = {
  id: string;
  outletId: string;
  outletName: string;
  createdAt: string;
  dinerName: string;
  dinerPhone: string;
  tableNumber?: string;
  category: 'undercooked_food' | 'foreign_object' | 'bad_odor_taste' | 'dirty_cutlery' | 'pest_sighting' | 'hygiene_violation' | 'other';
  severity: 'high' | 'critical';
  description: string;
  status: 'received' | 'investigating' | 'resolved';
  resolutionNote?: string;
  actionId?: string;
};

export type AppPhase1State = {
  checks?: Record<string, CheckRecord>;
  issues?: Issue[];
  actions?: CorrectiveAction[];
  timeline?: AuditTrailEvent[];
  dinerRatings?: DinerSafetyRating[];
  dinerIncidents?: DinerIncidentReport[];
};

export const PHASE1_STORAGE_KEY = 'foodsaf365_phase1';

export function isDailyFloorCheck(c: FoodSafeCheck): boolean {
  return c.shift === 'opening' || c.shift === 'active' || c.shift === 'closing';
}

export function isScheduledCheck(c: FoodSafeCheck): boolean {
  // Operational floor checks + applicable specialized stations
  // Manager's monthly admin audit (Items 7 & 8) is separated to avoid overwhelming floor supervisors
  return c.shift !== 'monthly_audit';
}

export function severityForCheck(code: string): 'critical' | 'attention' {
  return ['FS28-19', 'FS28-20', 'FS28-21', 'FS28-22'].includes(code)
    ? 'critical'
    : 'attention';
}

export function evaluateTemperature(
  code: string,
  n: number,
  mode?: string
): { acceptable: boolean; standardText: string; message: string } {
  if (code === 'FS28-19') {
    // Cool storage / Refrigerator: < 5°C (and >= 0°C)
    const ok = n >= 0 && n < 5;
    return {
      acceptable: ok,
      standardText: '< 5°C (Cool Storage)',
      message: ok
        ? 'Acceptable — Cool storage is < 5°C.'
        : n < 0
        ? `Attention — ${n}°C is below 0°C (freezing risk).`
        : `Attention — ${n}°C is not < 5°C (cool storage limit).`
    };
  }

  if (code === 'FS28-20') {
    // Cold storage: < -18°C
    const ok = n <= -18;
    return {
      acceptable: ok,
      standardText: '< −18°C (Cold Storage)',
      message: ok ? 'Acceptable — Cold storage is < −18°C.' : `Attention — ${n}°C is not < −18°C (cold storage limit).`
    };
  }

  return { acceptable: true, standardText: '', message: 'Measurement recorded.' };
}

export type BadgeResult = {
  status: 'FOODSAFE TODAY' | 'FOODSAFE — ATTENTION' | 'FOOD SAFETY ACTION REQUIRED' | 'PENDING MANAGER REVIEW' | 'CHECKS IN PROGRESS';
  tone: 'good' | 'attention' | 'danger' | 'neutral';
  explanation: string;
  counts: {
    scheduled: number;
    submitted: number;
    pendingReview: number;
    approved: number;
    openAlerts: number;
    criticalAlerts: number;
  };
};

export function calculateDailyBadge(
  checks: Record<string, CheckRecord> = {},
  issues: Issue[] = [],
  scheduled: FoodSafeCheck[] = FOODSAFE28.filter(isScheduledCheck)
): BadgeResult {
  const unresolved = issues.filter(i => i.status !== 'closed');
  const criticalOpen = unresolved.some(i => i.severity === 'critical');
  const pendingReview = scheduled.filter(c => checks[c.code]?.reviewStatus === 'pending_manager').length;
  const submitted = scheduled.filter(c => Boolean(checks[c.code]?.reviewStatus)).length;
  const approved = scheduled.filter(c => checks[c.code]?.reviewStatus === 'approved').length;

  const counts = {
    scheduled: scheduled.length,
    submitted,
    pendingReview,
    approved,
    openAlerts: unresolved.length,
    criticalAlerts: unresolved.filter(i => i.severity === 'critical').length
  };

  if (criticalOpen) {
    return {
      status: 'FOOD SAFETY ACTION REQUIRED',
      tone: 'danger',
      explanation: DAILY_BADGE_RULES.red,
      counts
    };
  }

  if (unresolved.length > 0) {
    return {
      status: 'FOODSAFE — ATTENTION',
      tone: 'attention',
      explanation: DAILY_BADGE_RULES.yellow,
      counts
    };
  }

  if (pendingReview > 0) {
    return {
      status: 'PENDING MANAGER REVIEW',
      tone: 'attention',
      explanation: DAILY_BADGE_RULES.pending,
      counts
    };
  }

  if (submitted < scheduled.length) {
    return {
      status: 'CHECKS IN PROGRESS',
      tone: 'neutral',
      explanation: DAILY_BADGE_RULES.progress,
      counts
    };
  }

  return {
    status: 'FOODSAFE TODAY',
    tone: 'good',
    explanation: DAILY_BADGE_RULES.green,
    counts
  };
}
