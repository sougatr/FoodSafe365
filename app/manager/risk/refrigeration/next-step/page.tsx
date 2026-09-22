'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,CheckCircle2,Info,ShieldCheck,AlertTriangle,ClipboardCheck} from 'lucide-react';
import {apiFetch} from '@/lib/api';

const steps=[
  {id:'loading',title:'Is the refrigerator overloaded?',why:'Overloading can restrict cold-air circulation and make it harder to maintain the target temperature.',options:['Yes','No','Not sure']},
  {id:'door',title:'Does the door close properly?',why:'A door that does not close properly can allow warm air to enter repeatedly.',options:['Yes','No','Not sure']},
  {id:'verify',title:'Can you verify the temperature independently?',why:'A second reading helps check whether the displayed temperature is reliable.',options:['Yes','No','Not sure']},
];

export default function RefrigerationNextStep(){
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [done,setDone]=useState(false);
  const [busy,setBusy]=useState(false);
  const [actionId,setActionId]=useState<string|null>(null);
  const [error,setError]=useState('');
  const step=steps[index];
  const answer=answers[step.id];
  const summary=useMemo(()=>steps.map(s=>({label:s.title,value:answers[s.id]})).filter(x=>x.value),[answers]);
  const concern=summary.some(x=>x.value==='No'||x.value==='Not sure');
  const choose=(value:string)=>setAnswers(a=>({...a,[step.id]:value}));

  const finish=async()=>{
    setBusy(true);setError('');
    try{
      if(concern){
        const answerText=summary.map(x=>`${x.label}: ${x.value}`).join(' | ');
        const action=await apiFetch<any>('/actions',{method:'POST',body:JSON.stringify({
          title:'Review Refrigerator 2 after repeated temperature deviations',
          description:`A recommended review was completed after three temperature deviations in seven days. Observations: ${answerText}. Review the condition, protect affected food as appropriate, record the correction and submit it for independent verification.`,
          severity:'high',priority:'high',sourceType:'manual',dueDate:new Date().toISOString().slice(0,10)
        })});
        setActionId(action.id);
      }
      setDone(true);
    }catch(e:any){setError(e.message||'Unable to create the corrective action.');}
    finally{setBusy(false);}
  };

  const next=()=>{ if(!answer)return; if(index<steps.length-1) setIndex(i=>i+1); else finish(); };

  return <main><div className="topbar"><div className="brand">FoodSafe365</div><div className="muted">ABC Restaurant · Manager</div></div>
    <div className="container detail-shell">
      <div className="back-row"><Link href="/manager/risk/refrigeration" className="nav-link"><ArrowLeft size={16}/> Back to Refrigerator 2</Link></div>
      {!done ? <>
        <div className="detail-hero"><div className="icon-tile"><ShieldCheck/></div><div><p className="eyebrow">RECOMMENDED CHECK · {index+1} OF {steps.length}</p><h1>Check Refrigerator 2</h1><p className="lead">A short operational check based on the repeated temperature pattern.</p></div></div>
        <div className="progress" style={{marginTop:24}}><div style={{height:8,borderRadius:99,background:'#e8eeeb'}}><div style={{height:8,borderRadius:99,background:'var(--green)',width:`${((index+1)/steps.length)*100}%`}}/></div></div>
        <div className="card question-card" style={{marginTop:24}}>
          <p className="question-number">WHY ARE WE ASKING?</p>
          <div className="notice info"><Info size={18}/><span>{step.why}</span></div>
          <p className="question-number" style={{marginTop:28}}>CHECK NOW</p>
          <h2>{step.title}</h2>
          <div className="answer-grid" style={{marginTop:20}}>{step.options.map(o=><button key={o} type="button" aria-pressed={answer===o} className={`answer ${answer===o?'selected':''}`} onClick={()=>choose(o)}><span>{o}</span></button>)}</div>
          {error&&<div className="notice error" style={{marginTop:18}}><AlertTriangle size={18}/><span>{error}</span></div>}
          <div className="action-bar"><Link href="/manager/risk/refrigeration" className="btn secondary">Cancel</Link><button className="btn primary" disabled={!answer||busy} onClick={next}>{busy?'Saving…':index===steps.length-1?'Complete check':'Continue'} <ArrowRight size={17}/></button></div>
        </div>
      </> : <>
        <div className="detail-hero"><div className={`icon-tile ${concern?'danger':''}`}>{concern?<AlertTriangle/>:<CheckCircle2/>}</div><div><p className="eyebrow">CHECK COMPLETE</p><h1>{concern?'Action required':'Review complete'}</h1><p className="lead">{concern?'The recommended review found something that should be followed through to correction and verification.':'The recommended review did not identify a concern in the questions asked.'}</p></div></div>
        <div className={`notice ${concern?'warning':'info'}`} style={{marginTop:24}}>{concern?<AlertTriangle size={19}/>:<CheckCircle2 size={19}/>}<div><strong>{concern?'FoodSafe365 created a corrective action.':'No corrective action was created.'}</strong><p>{concern?'Complete the correction, then submit it for independent verification.':'Continue routine monitoring and return to the evidence page if the temperature pattern returns.'}</p></div></div>
        <div className="card" style={{marginTop:18}}><p className="eyebrow">RESULT</p><h2>{concern?'The review needs follow-through':'No immediate issue identified'}</h2><p className="muted">The responses are recorded as an operational review. They do not by themselves establish an equipment fault or regulatory finding.</p>{summary.map(x=><div key={x.label} className="mini-table"><div><span>{x.label}</span><strong>{x.value}</strong></div></div>)}</div>
        <div className="action-bar"><Link href="/manager/risk/refrigeration" className="btn secondary">Back to evidence</Link>{actionId&&<Link href={`/actions/${actionId}`} className="btn primary">Open corrective action <ArrowRight size={17}/></Link>}{!actionId&&<Link href="/manager" className="btn primary">Back to overview <ArrowRight size={17}/></Link>}</div>
      </>}
    </div>
  </main>
}
