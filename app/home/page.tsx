'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Info, Mail, ShieldCheck, Thermometer, Users, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FOODSAFE28 } from '@/lib/foodsafety28';

const learning = [
  {
    href: '/checklist',
    icon: ClipboardCheck,
    eyebrow: 'FSSAI-ALIGNED CONTROLS',
    title: 'Food Safety Checklist',
    text: '28 practical operational controls derived from applicable FSSAI food-service hygiene requirements.',
  },
  {
    href: '/food-safety-why',
    icon: ShieldCheck,
    eyebrow: 'LEARN WHY',
    title: 'Food Safety — Why?',
    text: 'Understand why each control matters and how missing a control can affect food safety.',
  },
  {
    href: '/food-safety-framework',
    icon: BookOpen,
    eyebrow: 'UNDERSTAND THE SYSTEM',
    title: 'Food Safety Framework',
    text: 'See how operational checks, temperature controls and HACCP fit together.',
  },
  {
    href: '/temperature-controls',
    icon: Thermometer,
    eyebrow: 'TEMPERATURE',
    title: 'Temperature Controls',
    text: 'Understand safe storage, cooking, cooling, reheating and holding controls.',
  },
  {
    href: '/haccp',
    icon: ShieldCheck,
    eyebrow: 'HAZARD CONTROL',
    title: 'HACCP',
    text: 'Learn the framework used to identify and control food-safety hazards.',
  },
];

const serviceLinks = [
  { href: '/providers', icon: Users, title: 'Providers & Vendors', text: 'Find the types of food-safety services available through the FoodSafe365 network.' },
  { href: '/about', icon: Info, title: 'About Us', text: 'Learn about FoodSafe365 and the purpose behind the platform.' },
  { href: '/contact', icon: Mail, title: 'Contact Us', text: 'Get in touch with FoodSafe365 for support, partnerships or service enquiries.' },
];

export default function Home() {
  const [status,setStatus]=useState('CHECKS IN PROGRESS');
  useEffect(()=>{const read=()=>{try{const d=JSON.parse(localStorage.getItem('foodsaf365_phase1')||'{}');const checks=d.checks||{};const issues=(d.issues||[]).filter((i:any)=>i.status!=='closed');const scheduled=FOODSAFE28.filter(x=>['Opening','Daily','Per shift'].includes(x.frequency));const submitted=scheduled.filter(x=>checks[x.code]?.reviewStatus).length;const pending=scheduled.some(x=>checks[x.code]?.reviewStatus==='pending_manager');const critical=issues.some((i:any)=>i.severity==='critical');setStatus(critical?'FOOD SAFETY ACTION REQUIRED':issues.length?'FOODSAFE — ATTENTION':pending?'PENDING MANAGER REVIEW':submitted<scheduled.length?'CHECKS IN PROGRESS':'FOODSAFE TODAY')}catch{}};read();window.addEventListener('foodsaf365:update',read);return()=>window.removeEventListener('foodsaf365:update',read)},[]);
  const badgeIcon=status==='FOODSAFE TODAY'?<CheckCircle2/>:<AlertTriangle/>;
  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <Link href="/providers" className="nav-link">Providers</Link>
          <Link href="/about" className="nav-link">About Us</Link>
          <Link href="/contact" className="nav-link">Contact Us</Link>
          <Link href="/manager" className="nav-link">Manager</Link>
        </div>
      </div>

      <div className="container manager-shell">
        <section className="home-hero">
          <div>
            <p className="eyebrow">FOODSAFE365 · FOOD SAFETY MANAGEMENT</p>
            <h1>Safer food.<br/>Every day.</h1>
            <p className="lead muted">A practical system that helps restaurant teams understand, check, correct and record food-safety controls.</p>
            <div style={{display:'flex',gap:12,marginTop:24,flexWrap:'wrap'}}>
              <Link className="btn primary" href="/checks">Start today’s checks <ArrowRight size={17}/></Link>
              <Link className="btn secondary" href="/checklist">View 28-point checklist</Link>
            </div>
          </div>
          <div className="card home-badge-card">
            <div className={`badge-icon ${status==='FOODSAFE TODAY'?'':'badge-icon-attention'}`}>{badgeIcon}</div>
            <p className="eyebrow">DAILY OUTPUT</p>
            <h2>{status}</h2>
            <p className="muted">FoodSafe365 Daily Food Safety Badge · based on actual supervisor results, manager review and unresolved alerts.</p>
          </div>
        </section>

        <section className="section-block">
          <div className="section-title">
            <div><p className="eyebrow">START HERE</p><h2>Food safety learning & controls</h2><p className="muted">Everything the supervisor needs to understand what to check and why.</p></div>
          </div>
          <div className="grid grid2">
            {learning.map(({href,icon:Icon,eyebrow,title,text}) => (
              <Link href={href} className="card link-card" key={href}>
                <Icon size={24}/>
                <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{text}</p></div>
                <ArrowRight size={19}/>
              </Link>
            ))}
          </div>
        </section>

        <section className="card home-flow">
          <div><p className="eyebrow">THE FOODSAFE365 WORKFLOW</p><h2>Understand → Check → Correct → Verify → Record</h2><p className="muted">The platform is designed to help the supervisor detect problems early and help the manager see only issues that actually need attention.</p></div>
          <Link className="btn secondary" href="/food-safety-framework">See the framework <ArrowRight size={17}/></Link>
        </section>

        <footer className="home-footer">
          <Link href="/about">About Us</Link><Link href="/providers">Providers & Vendors</Link><Link href="/contact">Contact Us</Link><a href="mailto:ray.health.ai@gmail.com">ray.health.ai@gmail.com</a><span>© FoodSafe365</span>
        </footer>
      </div>
    </main>
  );
}
