import { ControlPlanItem } from '@/lib/control-plan';

export type DailyCheck = ControlPlanItem & {
  frequency: 'Daily' | 'Per shift' | 'As applicable';
  checkQuestion: string;
  input: 'yes_no' | 'temperature';
  why: string;
  whatToCheck: string[];
  standard: string;
  source: string;
  sourceUrl?: string;
};

const questions: Record<string, {
  q:string; input:'yes_no'|'temperature'; frequency:'Daily'|'Per shift'|'As applicable';
  why:string; whatToCheck:string[]; standard:string; source:string; sourceUrl?:string;
}> = {
  'CORE-PREMISES': {
    q:'Are the premises and food-contact areas clean and ready for food operations?', input:'yes_no', frequency:'Daily',
    why:'Clean surfaces and a clean work area help prevent food contamination.',
    whatToCheck:['Work tables, counters and food-contact surfaces are visibly clean.','Floors and work areas are free from food scraps, grease and standing water.','Food is protected while cleaning is being done.'],
    standard:'Food premises and food-contact areas should be kept clean, maintained and suitable for food operations.',
    source:'FSSAI Hygiene Rating checklist — maintenance & sanitation', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'CORE-HYGIENE': {
    q:'Are food handlers following the required personal hygiene practices?', input:'yes_no', frequency:'Per shift',
    why:'Clean and properly dressed food handlers help prevent contamination of food.',
    whatToCheck:['Hair is neat and covered with the required headgear/hair covering.','Nails are short, clean and free from dirt; no loose jewellery is being worn.','Clean work clothes, apron and other required protective clothing are being worn.','Gloves are worn where the process requires them, and they are clean and changed when needed.','Hands are washed properly at required times, especially before handling food and after contamination risks.','Staff are not smoking, spitting or eating in food-handling areas.','Anyone who should not handle food because of illness, open wounds or burns is kept away from food handling.'],
    standard:'Maintain personal cleanliness and good hygiene behaviour; use suitable aprons, gloves and headgear wherever necessary.',
    source:'FSSAI Hygiene Rating checklist — Personal Hygiene of Food Handlers', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=83190'
  },
  'CORE-CLEANING': {
    q:'Have the required cleaning and sanitation tasks been completed?', input:'yes_no', frequency:'Daily',
    why:'Good cleaning removes food residues where bacteria and pests can grow.',
    whatToCheck:['Food-contact surfaces have been cleaned after use.','Cooking equipment, shelves and hard-to-reach areas have no visible food residue or grease build-up.','Cleaning tools are clean and stored properly.','There is no standing water in food-handling areas.'],
    standard:'Cleaning should follow the restaurant cleaning schedule/programme and food zones should not have stagnant water.',
    source:'FSSAI Hygiene Rating checklist — maintenance & sanitation', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=83190'
  },
  'CORE-RECEIVING-STORAGE': {
    q:'Are incoming foods checked and stored safely, with segregation and FIFO/FEFO?', input:'yes_no', frequency:'Daily',
    why:'Correct receiving and storage prevents contamination, spoilage and use of old stock.',
    whatToCheck:['Food is protected from contamination and stored in the correct area.','Raw and ready-to-eat foods are separated where required.','Food is covered, labelled and dated where needed.','FIFO/FEFO is followed so older or earlier-expiring food is used first.','Refrigerators and freezers are not overloaded and air can circulate.'],
    standard:'Store incoming materials according to their temperature requirement in a hygienic environment and follow FIFO/FEFO.',
    source:'FSSAI Hygiene Rating checklist — storage and receiving controls', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'CORE-PEST-WASTE': {
    q:'Is the kitchen protected from cockroaches, rodents and other pests, and is waste being managed properly?', input:'yes_no', frequency:'Daily',
    why:'Food scraps, dirty drains, standing water and exposed waste can attract cockroaches, rodents and other pests.',
    whatToCheck:['No cockroaches, rodents, flies, eggs, larvae, droppings or other signs of pest activity are seen.','All work surfaces, floors and corners are cleaned after food preparation so food scraps are not left behind.','Drains are free-flowing and food material/grease is not allowed to build up.','Drain covers, grease traps and cockroach traps are in place and usable where provided.','Food waste is removed regularly and does not accumulate in food-handling areas.','Garbage/food-waste bins are clean, lined where appropriate, covered or otherwise protected, and emptied before they overflow.','Doors, windows and other possible entry points are kept closed, screened or protected where required.','Any pest-control treatment or pest observation is reported and recorded for follow-up.'],
    standard:'There should be no signs of pest activity; drains should handle expected flow and use appropriate traps; food waste and refuse should be removed periodically to avoid accumulation.',
    source:'FSSAI Hygiene Rating checklist — pest control, drains and waste management', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=83190'
  },
  'CORE-RECORDS': {
    q:'Are today’s required food-safety records complete and traceable?', input:'yes_no', frequency:'Daily',
    why:'Records show that important food-safety checks were actually carried out.',
    whatToCheck:['Required daily checks have been completed.','Temperature readings and deviations are recorded where required.','Problems found during checks have an action or follow-up recorded.','Entries can be linked to the date and person who performed the check.'],
    standard:'Food-safety records should be available, complete and traceable according to the applicable requirement.',
    source:'FSSAI Hygiene Rating checklist — records and documentation', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'TEMP-STORAGE': {
    q:'Measure the current chilled or frozen storage temperature.', input:'temperature', frequency:'Daily',
    why:'Food can become unsafe or deteriorate when stored at the wrong temperature.',
    whatToCheck:['Use the working food thermometer or built-in display as instructed.','Check the refrigerator/freezer that is in use and record the actual temperature.','Check that food is not blocking air circulation and the door closes properly.'],
    standard:'Cold foods: 5°C or below. Frozen foods: −18°C or below. Apply any stricter food-specific or validated process requirement configured for this outlet.',
    source:'FSSAI Hygiene Rating checklist — temperature control', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'TEMP-COOKING': {
    q:'Measure the core temperature of the food at the required cooking point.', input:'temperature', frequency:'As applicable',
    why:'Adequate cooking is an important control for reducing food-safety hazards.',
    whatToCheck:['Place the clean probe in the thickest/coldest part of the food as appropriate.','Measure at the point specified by the restaurant’s process.','Record the temperature and, where required, the time it is maintained.'],
    standard:'Use the applicable FSSAI reference or the outlet’s validated process requirement for the food being cooked. Different foods can have different time/temperature requirements.',
    source:'FSSAI Hygiene Rating checklist — cooking controls', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=10200'
  },
  'TEMP-COOLING': {
    q:'Measure the cooling checkpoint temperature of cooked high-risk food.', input:'temperature', frequency:'As applicable',
    why:'Rapid cooling limits the time cooked high-risk food spends at unsafe temperatures.',
    whatToCheck:['Record the starting temperature and the cooling checkpoint required by the process.','Use shallow portions or other approved rapid-cooling methods where applicable.','Move food to refrigerated storage promptly after the required cooling step.'],
    standard:'FSSAI reference: cool from 60°C to 21°C within 2 hours or less, then from 21°C to 5°C within a further 2 hours or less.',
    source:'FSSAI Hygiene Rating checklist — cooling of cooked food', sourceUrl:'https://hygiene.fssai.gov.in/files/docs/90057_merged%20docs1.pdf'
  },
  'TEMP-REHEATING': {
    q:'Measure the core temperature of the food while reheating.', input:'temperature', frequency:'As applicable',
    why:'Reheating must bring food to the required temperature before it is served or held.',
    whatToCheck:['Measure the core temperature, not just the surface.','Heat the food evenly and avoid leaving it partially heated.','Record the temperature and required holding time where applicable.'],
    standard:'FSSAI Hygiene Rating reference: core temperature 75°C for at least 2 minutes. Follow the source/version attached to the outlet rule.',
    source:'FSSAI Hygiene Rating checklist — reheating', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=10200'
  },
  'TEMP-HOT-HOLDING': {
    q:'Measure the temperature of hot-held food.', input:'temperature', frequency:'Per shift',
    why:'Hot food should be kept hot enough to reduce food-safety risk during holding.',
    whatToCheck:['Measure the food temperature at the required holding point.','Check the hot-holding equipment is working properly.','Do not leave food in the temperature danger zone for prolonged periods.'],
    standard:'FSSAI reference: hot holding 65°C; non-vegetarian food 70°C, subject to the applicable source/process requirement.',
    source:'FSSAI Hygiene Rating checklist — hot holding', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=10200'
  },
  'TEMP-COLD-HOLDING': {
    q:'Measure the temperature of cold-held food.', input:'temperature', frequency:'Per shift',
    why:'Cold-held food needs to remain sufficiently cold to control food-safety risk.',
    whatToCheck:['Measure the food temperature at the required holding point.','Check that the cold-holding equipment is working and food is protected.'],
    standard:'FSSAI reference: cold foods should be kept at 5°C or below.',
    source:'FSSAI Hygiene Rating checklist — cold holding', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=10200'
  },
  'TEMP-THAWING': {
    q:'Check that frozen food is being thawed using an approved method.', input:'yes_no', frequency:'As applicable',
    why:'Safe thawing prevents food from spending too long at unsafe temperatures.',
    whatToCheck:['Meat, fish or poultry is thawed in a refrigerator at 5°C or below, or by an approved rapid method.','Seafood is thawed using an appropriate safe method where applicable.','Thawed food is not kept for later use unless the applicable process permits it.'],
    standard:'FSSAI reference includes refrigerator thawing at 5°C or below or microwave thawing; seafood may use cold potable running water at 15°C or below within the specified time.',
    source:'FSSAI Hygiene Rating checklist — thawing', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=10200'
  },
  'PROC-PACKAGING': {
    q:'Is food protected, labelled and handled hygienically during packaging?', input:'yes_no', frequency:'Daily',
    why:'Packaging should protect food from contamination and make storage/use clear.',
    whatToCheck:['Food-contact packaging is clean and suitable for food.','Food is protected from dust, handling and cross-contamination.','Labels/date information are applied where required.'],
    standard:'Packaging and wrapping material coming in contact with food should be clean and of food-grade quality.',
    source:'FSSAI Hygiene Rating checklist — packaging and wrapping', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'PROC-DELIVERY': {
    q:'Are food protection and applicable temperature controls maintained during delivery?', input:'yes_no', frequency:'As applicable',
    why:'Food can become contaminated or unsafe during transport if protection and temperature control are lost.',
    whatToCheck:['Food is covered/protected during transport.','Hot, cold and frozen foods use the applicable temperature control.','Transport containers are clean and suitable for food.'],
    standard:'Maintain the applicable food protection and temperature requirement during transport.',
    source:'FSSAI Hygiene Rating checklist — transport and food protection', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'PROC-PREPARATION': {
    q:'Is food preparation being carried out hygienically without cross-contamination?', input:'yes_no', frequency:'Daily',
    why:'Separating raw and ready-to-eat food helps prevent cross-contamination.',
    whatToCheck:['Raw and ready-to-eat foods are separated.','Clean utensils are used for ready-to-eat food.','Hands, knives, boards and work surfaces are cleaned between incompatible tasks.','Food is kept covered/protected when not being actively prepared.'],
    standard:'Food should be prepared hygienically with appropriate separation and protection from contamination.',
    source:'FSSAI Hygiene Rating checklist — food preparation and hygiene', sourceUrl:'https://hygiene.fssai.gov.in/'
  },
  'EQUIP-TEMP-MONITOR': {
    q:'Is the temperature-monitoring equipment available and working correctly?', input:'yes_no', frequency:'Daily',
    why:'A temperature reading is only useful when the measuring device is working properly.',
    whatToCheck:['The thermometer is available and clean.','The display/reading is working and easy to read.','The device is checked/calibrated as required by the restaurant’s programme.'],
    standard:'Measuring and monitoring devices should be maintained and calibrated periodically as applicable.',
    source:'FSSAI Hygiene Rating checklist — measuring and monitoring devices', sourceUrl:'https://hygiene.fssai.gov.in/auditDetails.php?mid=83190'
  },
  'EQUIP-WATER': {
    q:'Is the water supply/treatment control operating as required?', input:'yes_no', frequency:'Daily',
    why:'Safe water is needed for food preparation, cleaning and other food-handling activities.',
    whatToCheck:['Required water supply is available.','Water-treatment equipment, where used, is operating normally.','There is no obvious contamination or interruption that affects food safety.'],
    standard:'Use safe water for food operations and maintain the applicable water-safety controls.',
    source:'FSSAI food hygiene requirements — water safety', sourceUrl:'https://www.fssai.gov.in/'
  },
  'EQUIP-DISHWASHER': {
    q:'Is warewashing being carried out hygienically using the required process?', input:'yes_no', frequency:'Daily',
    why:'Clean utensils and equipment prevent contamination of food.',
    whatToCheck:['Wash/rinse/sanitise steps are followed as required.','Clean utensils are protected from dirty utensils and contaminated surfaces.','Dishwasher/warewashing equipment is clean and functioning.'],
    standard:'Utensils, equipment and food-contact items should be cleaned hygienically according to the applicable process.',
    source:'FSSAI Hygiene Rating checklist — cleaning and sanitation', sourceUrl:'https://hygiene.fssai.gov.in/'
  }
};

export function buildDailyChecks(plan: ControlPlanItem[]): DailyCheck[] {
  return plan.map(item => {
    const x = questions[item.code] || {q:`Is ${item.title.toLowerCase()} under control today?`,input:'yes_no' as const,frequency:'Daily' as const,why:item.reason,whatToCheck:[item.description],standard:'Follow the applicable FoodSafe365 control for this outlet.',source:'FoodSafe365 operational control'};
    return {...item, frequency:x.frequency, checkQuestion:x.q, input:x.input, why:x.why, whatToCheck:x.whatToCheck, standard:x.standard, source:x.source, sourceUrl:x.sourceUrl};
  });
}
