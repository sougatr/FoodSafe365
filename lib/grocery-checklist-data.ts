import { GroceryOperationalCheckDef } from './grocery-types';

export const GROCERY_OPERATIONAL_CHECKS: GroceryOperationalCheckDef[] = [
  {
    code: 'GR22-01',
    number: 1,
    title: 'FSSAI License / Registration Display',
    category: 'Licensing & Statutory',
    why: 'Statutory compliance demonstrates transparent accountability and reassures customers that the food business is registered under the Food Safety and Standards Act.',
    what: 'Inspect consumer entrance and billing counters for a prominent, valid FSSAI license / registration certificate with license number clearly legible.',
    standard: 'Valid FSSAI license/registration certificate clearly displayed in a prominent customer-facing area with 14-digit number visible.',
    action: 'If missing, faded, or damaged, immediately print and display a verified copy of the valid FSSAI certificate at customer billing stations.'
  },
  {
    code: 'GR22-02',
    number: 2,
    title: 'Store Premises Cleanliness',
    category: 'Premises & Hygiene',
    why: 'Clean floors, display aisles, and billing counters prevent dust and pest attraction and maintain retail sanitary standards.',
    what: 'Inspect all retail sales floor aisles, checkout belts, product shelves, and entryways for dust, spillages, and debris.',
    standard: 'Aisles, checkout counters, and display shelving must be clean, free of sticky spills, dust accumulation, and litter.',
    action: 'Instruct duty cleaning staff to wet-mop with food-safe disinfectant and clean stained display shelving immediately.'
  },
  {
    code: 'GR22-03',
    number: 3,
    title: 'Adequate Lighting & Fixture Protection',
    category: 'Premises & Facilities',
    why: 'Adequate illumination allows staff and customers to inspect product conditions and date markings; shatterproof covers prevent glass contamination.',
    what: 'Check lighting levels across storage rooms and sales floor; ensure all tube-lights and fixtures have intact diffusers/shatterproof sleeves.',
    standard: 'All display and backroom storage areas well-illuminated (≥200 lux); light fixtures fitted with protective shatter-resistant covers.',
    action: 'Replace flickering or burnt-out bulbs promptly; fit missing protective diffuser sleeves to prevent physical glass hazards.'
  },
  {
    code: 'GR22-04',
    number: 4,
    title: 'Adequate Ventilation & Humidity Control',
    category: 'Premises & Facilities',
    why: 'Proper airflow prevents condensation, dampness, and mold growth on dry staples, grains, and packaging cardboard.',
    what: 'Examine ambient storage rooms and sales area for stale air, excessive humidity, wall dampness, or condensation droplets on ceilings.',
    standard: 'Continuous gentle airflow without moisture buildup; dry storage relative humidity maintained below 65% without condensation.',
    action: 'Activate exhaust fans/dehumidifiers; move grain and packaging cartons away from damp perimeter walls to prevent mold growth.'
  },
  {
    code: 'GR22-05',
    number: 5,
    title: 'Storage Facilities & Shelving Capacity',
    category: 'Storage & Capacity',
    why: 'Overcrowded shelves lead to crushed packaging, fallen items, poor visibility, and obstructed airflow in chillers.',
    what: 'Inspect ambient racks and backroom holding shelves to ensure products are arranged within rated weight and space capacities.',
    standard: 'Items stacked neatly with stable foundations, not touching ceiling, leaving at least 15 cm clearance from back walls.',
    action: 'De-congest overloaded shelves; distribute cartons into secondary holding racks and secure unstable product stacks.'
  },
  {
    code: 'GR22-06',
    number: 6,
    title: 'Temperature-Controlled Equipment Functionality',
    category: 'Temperature Control',
    why: 'Functional chillers and freezers are critical to arresting microbial multiplication in meat, seafood, dairy, and cut fruits.',
    what: 'Verify that all chillers, freezers, and cold rooms are operating continuously without unusual compressor noise, ice build-up, or door seal gaps.',
    standard: 'Compressors cycling normally; magnetic door gaskets sealing completely airtight; no heavy frost buildup (>5 mm) on evaporator coils.',
    action: 'If door gasket is torn or compressor faulty, log a refrigeration maintenance service request; transfer food into an alternative active chiller.'
  },
  {
    code: 'GR22-07',
    number: 7,
    title: 'Waste Disposal & Garbage Bins',
    category: 'Waste & Sanitation',
    why: 'Accumulated retail food waste attracts insects and rodents, producing foul odors and bacterial reservoirs.',
    what: 'Check all internal waste bins, backroom waste collection zones, and organic waste dumpsters for pedal lids and liners.',
    standard: 'All waste bins fitted with plastic liner bags, tight-fitting foot-operated lids, emptied at least twice daily and kept thoroughly clean.',
    action: 'Empty overflowing waste bins immediately into exterior disposal container; wash and sanitize soiled bins.'
  },
  {
    code: 'GR22-08',
    number: 8,
    title: 'Approved Suppliers & Source Verification',
    category: 'Receiving & Sourcing',
    why: 'Sourcing only from authorized, FSSAI-licensed distributors helps ensure traceability and baseline safety of incoming goods.',
    what: 'Check supplier delivery challans / invoices for FSSAI license numbers and valid vendor authorization status.',
    standard: '100% of delivered inventory originates from pre-approved, licensed suppliers with verifiable delivery documentation.',
    action: 'Hold shipments from unverified or blacklisted suppliers; do not stock shelves until verified FSSAI documentation is provided.'
  },
  {
    code: 'GR22-09',
    number: 9,
    title: 'Incoming Product Inspection at Receiving',
    category: 'Receiving & Sourcing',
    why: 'Stopping substandard, leaking, or warm goods at the delivery dock prevents compromised stock from entering the store.',
    what: 'Perform dockside inspection on delivery vehicles: check transport hygiene, seal intactness, product temperature, and packaging condition.',
    standard: 'Goods received on clean transport beds; packaging free of tearing or leakage; temperature verification recorded before unloading.',
    action: 'Reject damaged, bloated, leaking, or temperature-abused batches at the dock; record rejection reason in the receiving log.'
  },
  {
    code: 'GR22-10',
    number: 10,
    title: 'Temperature-Sensitive Products Chilled Storage',
    category: 'Temperature Control',
    why: 'Allowing perishable items (milk, paneer, raw meat) to sit at room temperature accelerates pathogenic bacterial growth.',
    what: 'Inspect perishable holding areas; ensure goods are placed into chillers (≤5°C) or freezers (≤-18°C) within 20 minutes of unloading.',
    standard: 'Chilled perishables stored at ≤5°C; frozen products stored at ≤-18°C; zero ambient staging of temperature-sensitive items.',
    action: 'Immediately move any unattended chilled or frozen stock into designated chillers/freezers; measure core temperature to verify safety.'
  },
  {
    code: 'GR22-11',
    number: 11,
    title: 'Stock Rotation — FIFO / FEFO Execution',
    category: 'Stock Management',
    why: 'First Expiry First Out (FEFO) ensures products nearing expiry are placed in front for sale first, minimizing spoiled inventory.',
    what: 'Audit front-of-shelf stock against back-stock across dairy, bread, and packaged foods; verify newer batches are behind older batches.',
    standard: 'Shorter shelf-life / closer expiry dates placed in front; longer shelf-life batches stacked behind.',
    action: 'Re-sort shelf rows: pull closer expiry dates to the front; place new delivery stock behind and educate stocking staff on FEFO.'
  },
  {
    code: 'GR22-12',
    number: 12,
    title: 'Zero Expired / Past Best-Before Products on Sale',
    category: 'Stock Management',
    why: 'Selling expired food is a direct regulatory violation under FSSAI regulations and creates severe consumer health risks.',
    what: 'Audit date markings on perishables (milk, bread, cut fruits, meat) and packaged goods; check Use-By and Expiry dates.',
    standard: 'Strict zero-tolerance: absolutely no item past its Use-By or Expiry date may remain on active sales shelves.',
    action: 'Immediately pull expired products from shelves; move to designated red-marked QUARANTINE zone and log for safe destruction/return.'
  },
  {
    code: 'GR22-13',
    number: 13,
    title: 'Food vs Non-Food & Chemical Segregation',
    category: 'Segregation & Cross-Contamination',
    why: 'Chemical vapors, leaks, or spills from detergents and insecticides can severely contaminate food items and cause chemical poisoning.',
    what: 'Check storage zones and sales aisles to ensure household cleaners, phenyl, bleach, and detergents are completely physically segregated from food.',
    standard: 'Cleaning chemicals stored in dedicated separate aisles/lockers with physical bunding; never stored above or next to food items.',
    action: 'Immediately remove chemicals stored adjacent to food; place in designated separate chemical locker/shelving aisle.'
  },
  {
    code: 'GR22-14',
    number: 14,
    title: 'Vegetarian & Non-Vegetarian Segregation',
    category: 'Segregation & Cross-Contamination',
    why: 'Clear physical separation prevents cross-contact between raw meat/poultry fluids and vegetarian foods, respecting consumer preferences and safety.',
    what: 'Examine meat/fish display counters, chillers, and chopping boards; verify physical distance and green/brown dot demarcation.',
    standard: 'Raw meat, chicken, and seafood stored in dedicated separate chillers or physically separated compartments with separate handling utensils.',
    action: 'Correct mixed storage immediately; segregate raw meat/seafood packages below or in dedicated chillers away from vegetarian items.'
  },
  {
    code: 'GR22-15',
    number: 15,
    title: 'Packaging Integrity — No Swelling, Rust, or Leaks',
    category: 'Packaging & Product Quality',
    why: 'Dented or bloated cans indicate botulism/bacterial spoilage; torn pouches allow moisture, pest, and pathogen ingress.',
    what: 'Inspect canned goods, aseptic cartons, pouches, and vacuum packs for bulging ends, seam leaks, pinholes, or heavy rust.',
    standard: '100% of shelf packages intact, airtight, vacuum intact where specified, free of dents on rim/seam and zero swelling.',
    action: 'Withdraw swollen, severely dented, leaking, or compromised packages from display immediately; log into quarantine.'
  },
  {
    code: 'GR22-16',
    number: 16,
    title: 'Food Stored Off the Floor on Pallets / Racks',
    category: 'Storage & Facilities',
    why: 'Storing cartons directly on the floor absorbs moisture, facilitates pest access, and hampers daily wet mopping.',
    what: 'Inspect walk-in coolers, dry backroom store, and display floor for cartons, sacks, or crates placed directly on the floor.',
    standard: 'All food sacks, crates, and cartons placed on plastic/stainless pallets or metal racks at least 15 cm (6 inches) above the floor.',
    action: 'Elevate all floor-resting cartons and sacks onto approved plastic pallets or shelving racks immediately.'
  },
  {
    code: 'GR22-17',
    number: 17,
    title: 'Pest Prevention & Monitoring Devices',
    category: 'Pest Control',
    why: 'Rodents, cockroaches, and flies carry Salmonella and other pathogens, destroying stock and contaminating retail food.',
    what: 'Inspect insect light traps (ILTs), glue boards, wall-floor junctions, and corners for pest droppings, gnaw marks, or live insects.',
    standard: 'Zero evidence of pest activity; insect light traps operational and regularly emptied; rodent bait stations intact and monitored.',
    action: 'If pest activity or droppings observed, isolate affected stock, sanitize area, and book an immediate emergency commercial pest control service.'
  },
  {
    code: 'GR22-18',
    number: 18,
    title: 'Storage Areas Clean, Dry, and Odor-Free',
    category: 'Storage & Sanitation',
    why: 'Dampness and foul odors promote fungal spores, grain weevils, and off-flavors in porous food products.',
    what: 'Check ambient storage, fruit/vegetable cold storage, and display areas for stale smells, floor stains, or rotting produce.',
    standard: 'Clean, fresh-smelling storage environment; all racks sanitized on a weekly schedule; no standing water puddles.',
    action: 'Remove spoiled produce immediately; mop and disinfect storage floor; allow air circulation to dry wet areas.'
  },
  {
    code: 'GR22-19',
    number: 19,
    title: 'Cleaning Chemicals Labeled & Segregated',
    category: 'Chemical Safety',
    why: 'Unlabeled or misplaced chemical containers create severe accidental contamination hazards for staff and merchandise.',
    what: 'Verify all sanitizers, floor cleaners, and degreasers are stored in original labeled bottles in a locked chemical cabinet.',
    standard: 'All cleaning chemicals clearly labeled with hazard warnings, stored in locked cupboards away from food handling/packing zones.',
    action: 'Affix clear warning labels to secondary spray bottles; lock chemical cabinet and store key with designated supervisor.'
  },
  {
    code: 'GR22-20',
    number: 20,
    title: 'Daily Chiller & Freezer Temperature Monitoring',
    category: 'Temperature Control',
    why: 'Routine morning and evening temperature verification catches gradual cooling failures before products spoil.',
    what: 'Read digital display / calibrated probe thermometer inside every active chiller, freezer, and dairy display cabinet.',
    standard: 'Recorded twice daily; chillers operating at ≤5°C; freezers operating at ≤-18°C; readings entered in temperature log.',
    action: 'If temperature is in AMBER/RED range, check door seals, adjust thermostat, clean condenser coils, or escalate to refrigeration maintenance.'
  },
  {
    code: 'GR22-21',
    number: 21,
    title: 'Corrective Actions Followed Up & Verified',
    category: 'Operational Follow-up',
    why: 'Food-safety checks only deliver value when identified non-conformances are resolved with documented corrections and verification.',
    what: 'Review open corrective action register; check if previous day issues (e.g. temp deviation, damaged stock) have been addressed.',
    standard: 'All open corrective actions reviewed by supervisor; overdue actions escalated; completed actions submitted for verification.',
    action: 'Follow up with assigned staff on pending corrective actions; re-inspect physical condition before submitting for verification.'
  },
  {
    code: 'GR22-22',
    number: 22,
    title: 'Food-Safety Records & Temperature Logs Maintained',
    category: 'Records & Traceability',
    why: 'Documented records provide proof of due diligence, support regulatory inspection, and enable rapid batch traceability.',
    what: 'Check completeness of daily receiving logs, temperature charts, pest service reports, and daily checklist records.',
    standard: 'Up-to-date daily records maintained digitally in FoodSafe365; records accessible for audit and supervisory review.',
    action: 'Complete any missing receiving or temperature entries for the shift; archive verified records in FoodSafe365 store.'
  }
];
