'use client';
import Link from 'next/link';
import {ShieldCheck, ClipboardCheck, BookOpen, FileText} from 'lucide-react';

const principles = [
 ['1','Identify hazards','Identify biological, chemical, physical and allergen hazards in the food process.'],
 ['2','Identify where control is essential','Identify the steps where control is essential to prevent, eliminate or reduce a hazard.'],
 ['3','Set safe limits','Use the approved, validated limits for each food process.'],
 ['4','Monitor controls','Define what is checked, how it is checked and when it is checked.'],
 ['5','Correct deviations','Act when a control is outside its approved limit or a food-safety requirement is not met.'],
 ['6','Verify','Confirm that controls and corrective actions are working as intended.'],
 ['7','Keep records','Maintain traceable evidence of checks, deviations, corrections and verification.'],
];

export default function HaccpControls(){
 return <main><div className="container">
   <div className="breadcrumb"><Link href="/home">Home</Link> › HACCP Controls</div>
   <p className="eyebrow">FOOD SAFETY FRAMEWORK</p>
   <h1>HACCP Controls</h1>
   <p className="lead">The HACCP framework used underneath FoodSafe365 to structure food-safety controls.</p>

   <div className="notice" style={{marginTop:20}}><ShieldCheck size={20}/><div><strong>Keep HACCP simple</strong><p style={{margin:'4px 0 0'}}>The supervisor does not need to complete a HACCP worksheet here. FoodSafe365 uses these principles behind the scenes to structure checks, corrective actions, verification and records.</p></div></div>

   <section className="section-title"><div><p className="eyebrow">THE 7 PRINCIPLES</p><h2>HACCP in simple language</h2></div></section>
   <div className="grid grid2">
    {principles.map(([n,title,text])=><div className="card" key={n} style={{display:'flex',gap:16,alignItems:'flex-start'}}><div className="step-number">{n}</div><div><h3 style={{marginTop:0}}>{title}</h3><p className="muted" style={{marginBottom:0}}>{text}</p></div></div>)}
   </div>

   <section className="section-title"><div><p className="eyebrow">WHAT HAPPENS IN FOODS AFE365</p><h2>One operational flow</h2></div></section>
   <div className="card"><div className="flow-row"><span>Understand</span><span>→</span><span>Check</span><span>→</span><span>Correct</span><span>→</span><span>Verify</span><span>→</span><span>Record</span></div><p className="muted" style={{marginBottom:0}}>The rules engine keeps the technical HACCP structure underneath this simple workflow.</p></div>

   <div className="grid grid3" style={{marginTop:24}}>
    <Link href="/checklist" className="card link-card"><ClipboardCheck/><h3>Food Safety Checklist</h3><p className="muted">FSSAI-aligned operational controls.</p></Link>
    <Link href="/temperature-controls" className="card link-card"><BookOpen/><h3>Temperature Controls</h3><p className="muted">Five priority temperature controls.</p></Link>
    <Link href="/records" className="card link-card"><FileText/><h3>Records</h3><p className="muted">Traceable checks, actions and verification.</p></Link>
   </div>
 </div></main>
}
