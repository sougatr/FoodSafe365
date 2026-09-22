'use client';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,CheckCircle2,Info,ShieldAlert} from 'lucide-react';
import {sprint19 as d} from '@/lib/sprint19-demo';

const sev=(s:string)=>s==='high'?'action':'attention';

export default function ManagerStatusPage(){
  return <main>
    <div className="topbar">
      <div className="brand">FoodSafe365</div>
      <div className="muted">{d.outlet.name} · Manager</div>
    </div>
    <div className="container detail-shell">
      <div className="back-row"><Link href="/manager" className="nav-link"><ArrowLeft size={16}/> Back to overview</Link></div>

      <div className="status-detail-header">
        <div>
          <p className="eyebrow">FOODSAFE365 CONTROL STATUS</p>
          <h1>Why is my status {d.status.value}?</h1>
          <p className="lead">Your status is an internal management measure. This page shows the evidence behind it.</p>
        </div>
        <div className={`status-score-card ${sev(d.status.label.toLowerCase())}`}>
          <span className="pill">{d.status.label}</span>
          <strong>{d.status.value}<small>/100</small></strong>
          <span>↓ {Math.abs(d.status.trend)} points vs {d.status.comparison}</span>
        </div>
      </div>

      <div className="notice info status-explainer">
        <Info size={19}/>
        <div><strong>This is not an FSSAI Hygiene Rating.</strong><p>FoodSafe365 uses checks, issues and corrective-action records to give managers an internal view of operational control.</p></div>
      </div>

      <div className="section-title"><div><h2>What affected your status?</h2><p className="muted">These are the current factors affecting your status.</p></div></div>
      <div className="status-factor-list">
        {d.status.factors.map((x)=><Link key={x.id} href={x.href} className="card status-factor-row">
          <div className={`status-factor-icon ${sev(x.severity)}`}><ShieldAlert size={21}/></div>
          <div className="status-factor-main"><div className="status-factor-top"><span className="pill">{x.label}</span><ArrowRight size={17}/></div><h3>{x.value}</h3><p className="muted">{x.detail}</p></div>
        </Link>)}
      </div>

      <div className="card status-summary-card">
        <div>
          <p className="eyebrow">WHAT MATTERS MOST?</p>
          <h2>Refrigeration is currently the main factor affecting your status.</h2>
          <p className="muted">Repeated temperature deviations have been recorded for the same refrigerator over the last 7 days.</p>
          <p className="muted"><strong>FoodSafe365 suggests:</strong> check refrigerator loading, door-opening practices and temperature measurement. These are possible contributing factors, not a confirmed diagnosis.</p>
        </div>
        <Link href="/manager/risk/refrigeration" className="btn secondary">Review refrigeration <ArrowRight size={16}/></Link>
      </div>

      <div className="section-title"><div><h2>What is going well?</h2><p className="muted">The status also reflects positive operational activity.</p></div></div>
      <div className="grid grid2 status-positive-grid">
        {d.status.positives.map((x)=><div key={x.label} className="card status-positive-card"><div className="positive-icon"><CheckCircle2 size={21}/></div><div><p className="eyebrow">{x.label}</p><h3>{x.value}</h3><p className="muted">{x.detail}</p></div></div>)}
      </div>

      <div className="status-next-step">
        <div><strong>Next step</strong><span>Review the highest-impact signal first, then return to the overview.</span></div>
        <Link href="/manager/recommendations" className="btn primary">View recommendations <ArrowRight size={16}/></Link>
      </div>
    </div>
  </main>
}
