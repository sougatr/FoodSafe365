export type SetupProfile = {
  restaurantType: string;
  processCodes: string[];
  equipmentCodes: string[];
};

export type ControlPlanItem = {
  code: string;
  title: string;
  description: string;
  reason: string;
  group: 'core' | 'temperature' | 'process' | 'equipment';
};

const has = (profile: SetupProfile, ...codes: string[]) => codes.some(c => profile.processCodes.includes(c));
const equip = (profile: SetupProfile, ...codes: string[]) => codes.some(c => profile.equipmentCodes.includes(c));

export function generateControlPlan(profile: SetupProfile): ControlPlanItem[] {
  const items: ControlPlanItem[] = [
    {code:'CORE-PREMISES',title:'Premises & food-contact areas',description:'Keep premises, food-contact areas and facilities clean, maintained and suitable for food operations.',reason:'Core control for every food business.',group:'core'},
    {code:'CORE-HYGIENE',title:'Food handler hygiene',description:'Maintain hand hygiene, protective practices and food-handler health requirements.',reason:'Applies to every outlet with food handlers.',group:'core'},
    {code:'CORE-CLEANING',title:'Cleaning & sanitation',description:'Clean and sanitise food-contact surfaces, equipment and high-risk areas as scheduled.',reason:'Core control for safe food preparation.',group:'core'},
    {code:'CORE-RECEIVING-STORAGE',title:'Receiving & storage',description:'Check incoming food and store it at the appropriate temperature, protected from contamination and using FIFO/FEFO.',reason:'Receiving and storage are fundamental controls in restaurant operations.',group:'core'},
    {code:'CORE-PEST-WASTE',title:'Pest & waste control',description:'Prevent pest activity and manage food waste and refuse hygienically.',reason:'Core environmental food-safety control.',group:'core'},
    {code:'CORE-RECORDS',title:'Records & review',description:'Keep required checks, deviations, corrective actions and verification traceable.',reason:'Supports monitoring, verification and inspection readiness.',group:'core'},
  ];

  if (equip(profile,'refrigerator','freezer','deep_freezer') || has(profile,'refrigerated_storage','freezing')) {
    items.push({code:'TEMP-STORAGE',title:'Storage temperature',description:'Monitor chilled and frozen storage and act when temperature is outside the applicable reference or validated process.',reason:'Your outlet has temperature-controlled storage.',group:'temperature'});
  }
  if (has(profile,'cooking','frying','baking') || equip(profile,'cooking_equipment')) {
    items.push({code:'TEMP-COOKING',title:'Cooking temperature',description:'Monitor the applicable food-specific cooking process and record measurements where required.',reason:'Your outlet cooks or heat-processes food.',group:'temperature'});
  }
  if (has(profile,'cooling')) items.push({code:'TEMP-COOLING',title:'Cooling cooked food',description:'Cool cooked high-risk food promptly using the outlet’s approved process and record required checkpoints.',reason:'Your outlet cools cooked food for later use.',group:'temperature'});
  if (has(profile,'reheating')) items.push({code:'TEMP-REHEATING',title:'Reheating',description:'Reheat food using the approved process and monitor the applicable temperature/time.',reason:'Your outlet reheats food.',group:'temperature'});
  if (has(profile,'hot_holding') || equip(profile,'hot_holding')) items.push({code:'TEMP-HOT-HOLDING',title:'Hot holding',description:'Keep hot-held food within the applicable reference or validated process and monitor it where required.',reason:'Your outlet hot-holds prepared food.',group:'temperature'});
  if (has(profile,'refrigerated_storage')) items.push({code:'TEMP-COLD-HOLDING',title:'Cold holding',description:'Keep cold-held food within the applicable reference or validated process.',reason:'Your outlet uses refrigerated storage for food.',group:'temperature'});
  if (has(profile,'frozen_storage','thawing') || has(profile,'freezing')) items.push({code:'TEMP-THAWING',title:'Thawing',description:'Thaw food hygienically using an approved method and prevent unsafe storage after thawing.',reason:'Your outlet handles frozen food.',group:'temperature'});

  if (has(profile,'packaging')) items.push({code:'PROC-PACKAGING',title:'Packaging & food protection',description:'Protect food during packaging, labelling and handling.',reason:'Your outlet packages food.',group:'process'});
  if (has(profile,'delivery')) items.push({code:'PROC-DELIVERY',title:'Delivery & transport',description:'Protect food and maintain applicable temperature control during dispatch and transport.',reason:'Your outlet delivers or transports food.',group:'process'});
  if (has(profile,'washing_preparation','cutting','ready_to_eat')) items.push({code:'PROC-PREPARATION',title:'Food preparation',description:'Control preparation, cross-contamination and ready-to-eat food handling.',reason:'Your selected processes include preparation activities.',group:'process'});
  if (equip(profile,'temperature_monitor')) items.push({code:'EQUIP-TEMP-MONITOR',title:'Temperature monitoring equipment',description:'Maintain and use temperature-monitoring devices appropriately, including calibration where required.',reason:'You selected temperature-monitoring equipment.',group:'equipment'});
  if (equip(profile,'water_treatment')) items.push({code:'EQUIP-WATER',title:'Water safety',description:'Maintain safe water supply and treatment controls where applicable.',reason:'You selected water-treatment equipment.',group:'equipment'});
  if (equip(profile,'dishwasher')) items.push({code:'EQUIP-DISHWASHER',title:'Dishwashing & warewashing',description:'Maintain hygienic cleaning of utensils, equipment and food-contact items.',reason:'You selected a dishwasher/warewashing process.',group:'equipment'});

  return items;
}
