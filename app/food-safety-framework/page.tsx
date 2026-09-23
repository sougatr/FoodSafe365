import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardCheck, Home, Thermometer, ShieldCheck, type LucideIcon } from 'lucide-react';

type AreaItem = {
  title: string;
  text: string;
  href: string;
  Icon: LucideIcon;
};

const areas: AreaItem[] = [
 { title: '28 Essential Safeguards', text: 'Daily operational safeguards engineered for kitchen discipline, zero contamination, and continuous audit readiness.', href: '/checklist', Icon: ClipboardCheck },
 { title: 'Temperature Controls', text: 'Storage, cooking, cooling, reheating and holding controls that depend on maintaining appropriate temperatures.', href: '/temperature-controls', Icon: Thermometer },
 { title: 'HACCP', text: 'The seven-principle food-safety framework that sits underneath the operational workflow.', href: '/haccp', Icon: ShieldCheck },
];

export default function FoodSafetyFramework(){
 return <main><div className="topbar"><Link href="/home" className="brand">FoodSafe365</Link><div style={{display:'flex',gap:10,alignItems:'center'}}><Link href="/home" className="btn secondary" style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,padding:'7px 14px'}}><Home size={15}/> Home</Link><Link href="/login"><button className="btn secondary">Log in</button></Link></div></div>
  <div className="container page-shell">
   <Link href="/home" className="nav-link muted back-row">← Back to Home</Link>
   <div className="page-title"><span className="pill good">FOOD SAFETY FRAMEWORK</span><h1>How the FoodSafe365 framework fits together</h1><p className="lead muted">FoodSafe365 keeps the technical food-safety framework underneath a simple operational workflow for the restaurant team.</p></div>
   <div className="grid grid3">{areas.map(({title,text,href,Icon})=><Link href={href} className="card framework-card" key={title}><div className="framework-icon"><Icon/></div><p className="eyebrow">{title==='HACCP'?'FRAMEWORK':'OPERATIONAL CONTROL'}</p><h2>{title}</h2><p className="muted">{text}</p><span className="nav-link">Open <ArrowRight size={16}/></span></Link>)}</div>
   <section className="section-block"><div className="section-title"><div><p className="eyebrow">ONE OPERATIONAL FLOW</p><h2>Understand → Check → Correct → Verify → Record</h2></div></div><div className="card framework-flow"><div><strong>Understand</strong><span>WHY, WHAT, STANDARD and RISK</span></div><div>→</div><div><strong>Check</strong><span>Record the actual condition</span></div><div>→</div><div><strong>Correct</strong><span>Act when something is not right</span></div><div>→</div><div><strong>Verify</strong><span>Confirm the correction</span></div><div>→</div><div><strong>Record</strong><span>Keep the food-safety history</span></div></div></section>
   <div className="notice info"><BookOpen size={19}/><div><strong>Operational Protocol</strong><p style={{margin:'5px 0 0'}}>FoodSafe365 operationalizes FSSAI Schedule 4 sanitary requirements into an active daily defense system — empowering kitchen teams to prevent hazards, verify critical limits, and maintain effortless audit readiness every single day.</p></div></div>
  </div></main>
}
