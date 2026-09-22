'use client';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api';
import {generateControlPlan} from '@/lib/control-plan';
import {Check, ChevronRight, ShieldCheck} from 'lucide-react';

type Option={id?:string;code:string;name:string};

const fallbackTypes:Option[]=[
 {code:'restaurant',name:'Restaurant'},{code:'cafe',name:'Café'},{code:'bakery',name:'Bakery'},
 {code:'cloud_kitchen',name:'Cloud kitchen'},{code:'hotel',name:'Hotel kitchen'},{code:'canteen',name:'Canteen'},{code:'other',name:'Other'}
];
const fallbackProcesses:Option[]=[
 {code:'washing_preparation',name:'Washing / preparation'},{code:'cutting',name:'Cutting / chopping'},{code:'cooking',name:'Cooking'},
 {code:'frying',name:'Frying'},{code:'baking',name:'Baking'},{code:'refrigerated_storage',name:'Refrigerated storage'},
 {code:'freezing',name:'Freezing'},{code:'hot_holding',name:'Hot holding'},{code:'cooling',name:'Cooling cooked food'},
 {code:'reheating',name:'Reheating'},{code:'packaging',name:'Packaging'},{code:'delivery',name:'Delivery'},{code:'ready_to_eat',name:'Ready-to-eat preparation'}
];
const fallbackEquipment:Option[]=[
 {code:'refrigerator',name:'Refrigerator'},{code:'freezer',name:'Freezer'},{code:'deep_freezer',name:'Deep freezer'},
 {code:'hot_holding',name:'Hot holding equipment'},{code:'temperature_monitor',name:'Temperature monitor'},
 {code:'cooking_equipment',name:'Cooking equipment'},{code:'water_treatment',name:'Water treatment'},{code:'dishwasher',name:'Dishwasher'}
];

export default function Onboarding(){
 const [step,setStep]=useState(0),[types,setTypes]=useState<Option[]>(fallbackTypes),[processes,setProcesses]=useState<Option[]>(fallbackProcesses),[equipment,setEquipment]=useState<Option[]>(fallbackEquipment);
 const [type,setType]=useState('restaurant'),[selectedProcess,setSelectedProcess]=useState<string[]>(['refrigerated_storage','cooking']),[selectedEquip,setSelectedEquip]=useState<string[]>(['refrigerator','cooking_equipment','temperature_monitor']);
 const [name,setName]=useState('ABC Restaurant'),[city,setCity]=useState('Mumbai'),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const r=useRouter();
 useEffect(()=>{Promise.all([apiFetch<any[]>('/restaurant-types'),apiFetch<any[]>('/food-processes'),apiFetch<any[]>('/equipment-types')]).then(([a,b,c])=>{if(a?.length)setTypes(a);if(b?.length)setProcesses(b);if(c?.length)setEquipment(c)}).catch(()=>{});},[]);
 const profile=useMemo(()=>({restaurantType:type,processCodes:selectedProcess,equipmentCodes:selectedEquip}),[type,selectedProcess,selectedEquip]);
 const plan=useMemo(()=>generateControlPlan(profile),[profile]);
 const toggle=(code:string,setter:React.Dispatch<React.SetStateAction<string[]>>)=>setter(v=>v.includes(code)?v.filter(a=>a!==code):[...v,code]);
 const save=async()=>{setSaving(true);setError('');const setup={name,city,restaurantType:type,processCodes:selectedProcess,equipmentCodes:selectedEquip,plan};try{const out=await apiFetch<any>('/onboarding',{method:'POST',body:JSON.stringify({user:{name:'Restaurant Admin',mobile:'9999999999'},organisation:{name},outlet:{name,city,restaurantTypeId:type},processCodes:selectedProcess,equipmentCodes:selectedEquip})});if(typeof window!=='undefined'){localStorage.setItem('foodsafe365_outlet_id',out.outletId||'demo-outlet');localStorage.setItem('foodsafe365_setup',JSON.stringify(setup));}r.push('/home')}catch(e:any){setError(e.message||'Could not create the restaurant plan.')}finally{setSaving(false)}};
 const canContinue=step===0?Boolean(name&&city&&type):step===1?selectedProcess.length>0:step===2?selectedEquip.length>0:true;
 return <main><div className="topbar"><div className="brand">FoodSafe365</div><span className="muted">Step {step+1} of 4</span></div>
 <div className="container" style={{maxWidth:1000,paddingTop:44}}><div className="card">
  <div className="progress"><span style={{width:`${((step+1)/4)*100}%`}}/></div>
  {step===0&&<section><p className="eyebrow" style={{marginTop:28}}>RESTAURANT ONBOARDING</p><h1>Tell us about your restaurant</h1><p className="lead">We’ll use this information to build a food-safety control plan for your outlet.</p><div className="grid grid2" style={{marginTop:24}}><div className="field"><label>Restaurant name</label><input className="input" value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label>City</label><input className="input" value={city} onChange={e=>setCity(e.target.value)}/></div></div><h2 style={{marginTop:28}}>What type of outlet is this?</h2><div className="grid grid3" style={{marginTop:16}}>{types.map(x=><button key={x.code} className={'option '+(type===x.code?'selected':'')} onClick={()=>setType(x.code)}>{x.name}</button>)}</div></section>}
  {step===1&&<section><p className="eyebrow" style={{marginTop:28}}>FOOD PROCESSES</p><h1>What happens in your kitchen?</h1><p className="lead">Select the processes that actually happen in this outlet. FoodSafe365 will use them to decide which controls apply.</p><div className="grid grid3" style={{marginTop:24}}>{processes.map(x=><button key={x.code} className={'option '+(selectedProcess.includes(x.code)?'selected':'')} onClick={()=>toggle(x.code,setSelectedProcess)}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><strong>{x.name}</strong>{selectedProcess.includes(x.code)&&<Check size={20} color="var(--green)"/>}</div></button>)}</div></section>}
  {step===2&&<section><p className="eyebrow" style={{marginTop:28}}>EQUIPMENT</p><h1>What equipment do you use?</h1><p className="lead">This helps FoodSafe365 add the right monitoring and maintenance controls.</p><div className="grid grid3" style={{marginTop:24}}>{equipment.map(x=><button key={x.code} className={'option '+(selectedEquip.includes(x.code)?'selected':'')} onClick={()=>toggle(x.code,setSelectedEquip)}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><strong>{x.name}</strong>{selectedEquip.includes(x.code)&&<Check size={20} color="var(--green)"/>}</div></button>)}</div></section>}
  {step===3&&<section><div style={{display:'flex',gap:14,alignItems:'flex-start',marginTop:28}}><div className="icon-tile"><ShieldCheck/></div><div><p className="eyebrow">YOUR FOODSAFE365 CONTROL PLAN</p><h1 style={{marginBottom:6}}>Your plan is ready</h1><p className="lead" style={{fontSize:16}}>Based on your restaurant type, food processes and equipment, FoodSafe365 has generated the controls that apply to this outlet.</p></div></div><div className="notice info" style={{marginTop:22}}><ShieldCheck size={20}/><div><strong>You do not need to build a HACCP worksheet here.</strong><p style={{margin:'5px 0 0'}}>FoodSafe365 uses its rules engine underneath. Your team simply sees the checks and actions that apply to this restaurant.</p></div></div><div className="summary-stats"><div><strong>{plan.length}</strong><span>controls generated</span></div><div><strong>{selectedProcess.length}</strong><span>food processes</span></div><div><strong>{selectedEquip.length}</strong><span>equipment types</span></div><div><strong>{name}</strong><span>outlet</span></div></div><div className="section-title"><div><h2>Controls FoodSafe365 will manage</h2><p className="muted">You can change your setup later.</p></div></div><div className="grid grid2">{plan.map(item=><div key={item.code} className="card" style={{padding:18}}><div style={{display:'flex',gap:12,alignItems:'flex-start'}}><div className="step-number"><Check size={18}/></div><div><strong>{item.title}</strong><p className="muted" style={{margin:'6px 0',lineHeight:1.45}}>{item.description}</p><small className="muted">Why included: {item.reason}</small></div></div></div>)}</div></section>}
  {error&&<div className="notice error" style={{marginTop:20}}>{error}</div>}
  <div style={{display:'flex',justifyContent:'space-between',gap:12,marginTop:32}}><button className="btn secondary" disabled={step===0||saving} onClick={()=>setStep(step-1)}>Back</button>{step<3?<button className="btn primary" disabled={!canContinue||saving} onClick={()=>setStep(step+1)}>Continue <ChevronRight size={18} style={{verticalAlign:'middle'}}/></button>:<button className="btn primary" disabled={saving} onClick={save}>{saving?'Creating your plan…':'Create my FoodSafe365 plan'}</button>}</div>
 </div></div></main>
}
