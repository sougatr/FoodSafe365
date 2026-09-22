export type Profile={processCodes:string[];equipmentCodes:string[];restaurantType?:string};
export type RuleCondition={condition_type?:string;field_name?:string;operator?:string;value?:any};

const truthy=(v:any)=>v===true||v===1||v==='true';
const arr=(v:any)=>Array.isArray(v)?v:[v];

function textApplicable(text:string, profile:Profile){
  const a=(text||'').toLowerCase();
  if(a.includes('all fbos')||a.includes('all food handlers')||a==='applicable outlets'||a==='applicable foods'||a==='food handlers') return true;
  if(a.includes('cold storage')) return profile.equipmentCodes.some(x=>['refrigerator','freezer','deep_freezer'].includes(x))||profile.processCodes.some(x=>['refrigerated_storage','freezing'].includes(x));
  if(a.includes('temperature-controlled')) return profile.processCodes.some(x=>['refrigerated_storage','freezing','hot_holding','cooling','reheating'].includes(x))||profile.equipmentCodes.some(x=>['refrigerator','freezer','deep_freezer','hot_holding','temperature_monitor'].includes(x));
  if(a.includes('cooked foods')) return profile.processCodes.some(x=>['cooking','frying','baking','cooling','reheating','hot_holding'].includes(x));
  if(a.includes('haccp')) return false;
  if(a.includes('measurement devices')) return profile.equipmentCodes.includes('temperature_monitor');
  if(a.includes('where testing applies')||a.includes('where applicable')||a.includes('applicable')) return true;
  return true;
}

export function applicable(text:string, profile:Profile){ return textApplicable(text,profile); }

/** Structured applicability evaluator. All conditions on a rule are ANDed. Legacy text conditions remain supported for v1 seed data. */
export function evaluateApplicability(conditions:RuleCondition[], profile:Profile){
  if(!conditions.length) return true;
  return conditions.every(c=>{
    const raw=c.value?.text ?? c.value;
    const text=typeof raw==='string'?raw:'';
    if(c.field_name==='applicability' || text) return textApplicable(text,profile);
    let actual:any;
    if(c.condition_type==='process_exists') actual=profile.processCodes.includes(c.value?.code ?? c.value);
    else if(c.condition_type==='equipment_exists') actual=profile.equipmentCodes.includes(c.value?.code ?? c.value);
    else if(c.condition_type==='restaurant_type') actual=profile.restaurantType;
    else if(c.condition_type==='outlet_attribute') actual=(profile as any)[c.field_name||''];
    else return true;
    const op=c.operator||'eq'; const expected=c.value?.code ?? c.value;
    switch(op){
      case 'eq': return actual===expected || (typeof actual==='boolean' && truthy(expected)===actual);
      case 'neq': return actual!==expected;
      case 'in': return arr(expected).includes(actual);
      case 'not_in': return !arr(expected).includes(actual);
      case 'exists': return Boolean(actual);
      default: return true;
    }
  });
}
