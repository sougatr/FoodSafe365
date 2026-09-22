import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardCheck, Thermometer, ShieldCheck } from 'lucide-react';

const areas = [
 ['28-point operational checklist','The everyday operational controls FoodSafe365 uses to guide the supervisor.','/checklist',ClipboardCheck],
 ['Temperature Controls','Storage, cooking, cooling, reheating and holding controls that depend on maintaining appropriate temperatures.','/temperature-controls',Thermometer],
 ['HACCP','The seven-principle food-safety framework that sits underneath the operational workflow.','/haccp',ShieldCheck],
];

export default function FoodSafetyFramework(){
 return <main><div className="topbar"><Link href="/" className="brand">FoodSafe365</Link><Link href="/login"><button className="btn secondary">Log in</button></Link></div>
  <div className="container page-shell">
   <Link href="/checklist" className="nav-link muted back-row">← Food Safety Checklist</Link>
   <div className="page-title"><span className="pill good">FOOD SAFETY FRAMEWORK</span><h1>How the FoodSafe365 framework fits together</h1><p className="lead muted">FoodSafe365 keeps the technical food-safety framework underneath a simple operational workflow for the restaurant team.</p></div>
   <div className="grid grid3">{areas.map(([title,text,href,Icon])=><Link href={href as string} className="card framework-card" key={title as string}><div className="framework-icon"><Icon/></div><p className="eyebrow">{title==='HACCP'?'FRAMEWORK':'OPERATIONAL CONTROL'}</p><h2>{title}</h2><p className="muted">{text}</p><span className="nav-link">Open <ArrowRight size={16}/></span></Link>)}</div>
   <section className="section-block"><div className="section-title"><div><p className="eyebrow">ONE OPERATIONAL FLOW</p><h2>Understand → Check → Correct → Verify → Record</h2></div></div><div className="card framework-flow"><div><strong>Understand</strong><span>WHY, WHAT, STANDARD and RISK</span></div><div>→</div><div><strong>Check</strong><span>Record the actual condition</span></div><div>→</div><div><strong>Correct</strong><span>Act when something is not right</span></div><div>→</div><div><strong>Verify</strong><span>Confirm the correction</span></div><div>→</div><div><strong>Record</strong><span>Keep the food-safety history</span></div></div></section>
   <div className="notice info"><BookOpen size={19}/><div><strong>Important</strong><p style={{margin:'5px 0 0'}}>The FoodSafe365 28-point checklist is an operational product feature derived from applicable FSSAI food-service hygiene requirements. It is not an official FSSAI “28-point” checklist or an FSSAI Hygiene Rating.</p></div></div>
  </div></main>
}
