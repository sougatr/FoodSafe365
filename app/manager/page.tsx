'use client';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FOODSAFE28, DAILY_BADGE_RULES } from '@/lib/foodsafety28';
const key='foodsaf365_phase1';
function load(){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function save(v:any){localStorage.setItem(key,JSON.stringify(v));window.dispatchEvent(new Event('foodsaf365:update'));}
function severityFor(code:string){return ['FS28-14','FS28-19','FS28-20','FS28-21','FS28-22','FS28-23'].includes(code)?'critical':'attention'}
export default function ManagerPage(){
 const [d,setD]=useState<any>({}); const [note,setNote]=useState('');
 useEffect(()=>{const refresh=()=>setD(load());refresh();window.addEventListener('foodsaf365:update',refresh);return()=>window.removeEventListener('foodsaf365:update',refresh)},[]);
 const checks=d.checks||{}; const issues=d.issues||[]; const scheduled=FOODSAFE28.filter(x=>['Opening','Daily','Per shift'].includes(x.frequency));
 const pending=scheduled.filter(x=>checks[x.code]?.reviewStatus==='pending_manager'); const unresolved=issues.filter((x:any)=>x.status!=='closed'); const completed=scheduled.filter(x=>checks[x.code]).length; const approved=scheduled.filter(x=>checks[x.code]?.reviewStatus==='approved').length;
 const criticalOpen=unresolved.some((x:any)=>x.severity==='critical'); const allReviewed=completed===scheduled.length && pending.length===0;
 const badge=criticalOpen?'FOOD SAFETY ACTION REQUIRED':unresolved.length?'FOODSAFE — ATTENTION':allReviewed?'FOODSAFE TODAY':'CHECKS IN PROGRESS';
 function review(code:string, decision:'approved'|'alerted'){
   const c=checks[code]; if(!c)return; const control=FOODSAFE28.find(x=>x.code===code); if(!control)return; const now=new Date().toISOString();
   let next={...d,checks:{...checks,[code]:{...c,reviewStatus:decision,managerNote:note||undefined,reviewedAt:now}}};
   if(decision==='alerted' && c.status==='attention'){
     const existing=issues.find((i:any)=>i.checkId===control.id && i.status!=='closed');
     if(!existing){
       const issueId=`issue-${control.id}-${Date.now()}`; const actionId=`action-${control.id}-${Date.now()}`;
       next.issues=[...issues,{id:issueId,checkId:control.id,title:control.title,severity:severityFor(code),createdAt:now,status:'open',alertedAt:now,actionId}];
       next.actions=[...(next.actions||[]),{id:actionId,issueId,title:`Correct: ${control.title}`,description:control.action,severity:severityFor(code),status:'open',createdAt:now,immediateAction:'',correctiveAction:'',rootCause:'',completedAt:null,verificationNote:'',verificationStatus:null}];
     }
   }
   save(next);setD(next);setNote('');
 }
 function clearResolvedIssue(issue:any){
   const next={...d,issues:issues.map((i:any)=>i.id===issue.id?{...i,status:'closed'}:i)};save(next);setD(next);
 }
 return <main><div className="topbar"><div className="brand">FoodSafe365</div><div className="muted">ABC Restaurant · Manager</div></div><div className="container manager-shell">
  <div className="manager-header"><div><p className="eyebrow">MANAGER REVIEW</p><h1>Daily food-safety control</h1><p className="lead">Review what the supervisor actually recorded, raise alerts when needed, and send the restaurant into corrective action.</p></div><Link href="/checks" className="btn secondary">Supervisor checks <ArrowRight size={17}/></Link></div>
  <div className={`card daily-badge ${criticalOpen?'badge-action':unresolved.length?'badge-attention':'badge-good'}`}><div className="badge-icon">{criticalOpen?<AlertTriangle/>:<CheckCircle2/>}</div><div><p className="eyebrow">TODAY’S FOODSAFE365 BADGE</p><h2>{badge}</h2><p className="muted">{badge==='FOODSAFE TODAY'?DAILY_BADGE_RULES.green:badge==='FOODSAFE — ATTENTION'?DAILY_BADGE_RULES.yellow:badge==='FOOD SAFETY ACTION REQUIRED'?DAILY_BADGE_RULES.red:'Checks are still being reviewed.'}</p></div></div>
  <div className="grid grid3 manager-metrics"><div className="card metric-card"><ClipboardCheck/><span>Submitted</span><strong>{completed}/{scheduled.length}</strong><small>Today's scheduled controls</small></div><div className="card metric-card"><ShieldCheck/><span>Manager approved</span><strong>{approved}/{scheduled.length}</strong><small>Reviewed results</small></div><div className="card metric-card"><AlertTriangle/><span>Open alerts</span><strong>{unresolved.length}</strong><small>Need restaurant action</small></div></div>
  <div className="section-title"><div><h2>Supervisor results waiting for review</h2><p className="muted">The manager confirms the record. A failed result becomes an alert only after manager review.</p></div></div>
  {pending.length===0?<div className="card empty-state"><CheckCircle2/><div><strong>No pending supervisor results</strong><p className="muted">New supervisor submissions will appear here.</p></div></div>:<div className="checklist-library">{pending.map(c=>{const r=checks[c.code];return <div className="card manager-review-row" key={c.code}><div className="library-number">{c.id}</div><div className="manager-review-main"><div className="eyebrow">{c.category}</div><h3>{c.title}</h3><p className="muted">Supervisor recorded: <strong>{r.value}</strong> · {new Date(r.time).toLocaleString()}</p></div><div className="manager-review-actions">{r.status==='good'?<button className="btn secondary" onClick={()=>review(c.code,'approved')}>Approve result</button>:<button className="btn danger-btn" onClick={()=>review(c.code,'alerted')}>Confirm alert</button>}</div></div>})}</div>}
  <div className="section-title"><div><h2>Open alerts</h2><p className="muted">Alerts are linked to actual failed controls and remain open until corrective action and verification are complete.</p></div><Link href="/actions" className="nav-link">Restaurant actions <ArrowRight size={16}/></Link></div>
  {unresolved.length===0?<div className="card empty-state"><CheckCircle2/><div><strong>No open alerts</strong><p className="muted">When a manager raises an alert, it will appear here.</p></div></div>:<div className="checklist-library">{unresolved.map((i:any)=><div className="card issue-row" key={i.id}><AlertTriangle/><div><strong>{i.title}</strong><p className="muted">{i.severity==='critical'?'Critical control':'Operational control'} · {i.status.replace('_',' ')}</p></div><Link href={`/actions?issue=${encodeURIComponent(i.id)}`} className="btn primary"><Wrench size={16}/> Take action</Link></div>)}</div>}
  <div className="section-title"><div><h2>Manager decision note</h2><p className="muted">Optional note for the review record.</p></div></div>
  <div className="card"><label className="field"><span>Review note</span><textarea className="input textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="For example: verified against opening checklist and thermometer reading."></textarea></label></div>
 </div></main>
}
