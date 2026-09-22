'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FOODSAFE28, FoodSafeCheck } from '@/lib/foodsafety28';

const reasons = [
  ['Temperature control','A refrigerator or freezer can move outside the required range without being obvious. Checking makes a problem visible early.'],
  ['Personal hygiene','Hands, clothing and unsafe handling behaviour can transfer contamination to food and food-contact surfaces.'],
  ['Cross-contamination','Raw and ready-to-eat foods need appropriate separation so contamination is not transferred during storage and preparation.'],
  ['Pests','Food, water, shelter and access can create conditions for pest activity. Routine checks help identify entry points and signs early.'],
  ['Cleaning & waste','Residues, dirty surfaces and uncontrolled waste can create contamination and pest risks.'],
  ['Stock control','Using stock in the right order helps prevent expired or deteriorated food from being used.'],
];

export default function FoodSafetyWhy(){
 const [specific,setSpecific]=useState<FoodSafeCheck|null>(null);
 useEffect(()=>{const code=new URLSearchParams(window.location.search).get('check'); if(code) setSpecific(FOODSAFE28.find(x=>x.code===code)||null)},[]);
 return <main><div className="topbar"><Link href="/" className="brand">FoodSafe365</Link><Link href="/login"><button className="btn secondary">Log in</button></Link></div>
  <div className="container page-shell">
   <Link href={specific?`/checks?check=${specific.id}`:'/checklist'} className="nav-link muted back-row">← {specific?'Back to this check':'Food Safety Checklist'}</Link>
   {specific ? <><div className="page-title"><span className="pill good">WHY THIS CHECK MATTERS</span><h1>{specific.title}</h1><p className="lead muted">This explanation applies specifically to this control.</p></div>
    <section className="card"><div className="why-icon"><CheckCircle2/></div><p className="eyebrow">WHY?</p><h2>{specific.why}</h2></section>
    <div className="page-actions"><Link href={`/checks?check=${specific.id}`} className="btn primary">Back to this check <ArrowRight size={17}/></Link><Link href="/food-safety-why" className="btn secondary">Why other controls matter <ArrowRight size={17}/></Link></div>
   </> : <><div className="page-title"><span className="pill good">FOOD SAFETY — WHY?</span><h1>Why does the supervisor check?</h1><p className="lead muted">A checklist is useful only when the person doing the check understands what the check is protecting.</p></div>
   <div className="notice info"><ShieldCheck size={20}/><div><strong>The purpose is early detection.</strong><p style={{margin:'5px 0 0'}}>The supervisor is not simply ticking boxes. The check is a quick opportunity to see whether an important food-safety control is working today.</p></div></div>
   <section className="section-block"><div className="section-title"><div><p className="eyebrow">WHY THESE CONTROLS MATTER</p><h2>Every check protects against a practical problem</h2></div></div><div className="grid grid2">{reasons.map(([title,text])=><div className="card" key={title}><div className="why-icon"><CheckCircle2/></div><h3>{title}</h3><p className="muted">{text}</p></div>)}</div></section>
   <section className="card"><div className="risk-action-grid"><div><p className="eyebrow">IF YOU DON'T CHECK</p><h2>A problem can remain unnoticed.</h2><p className="muted">For example, a refrigerator may be warmer than expected, a drain may be blocked, a pest entry point may be open, or a food-handler hygiene control may not be followed.</p></div><div><p className="eyebrow">IF YOU FIND A PROBLEM</p><h2>FoodSafe365 turns it into action.</h2><p className="muted">The supervisor records the observation, the issue is created, a correction is recorded and the correction can be verified before the issue is closed.</p></div></div></section>
   <div className="page-actions"><Link href="/checks" className="btn primary">Start today's checks <ArrowRight size={17}/></Link><Link href="/food-safety-framework" className="btn secondary">Food Safety Framework <ArrowRight size={17}/></Link></div></>}
  </div></main>
}
