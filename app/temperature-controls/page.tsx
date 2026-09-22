'use client';
import Link from 'next/link';
import {Thermometer, ChevronRight} from 'lucide-react';
const controls=[
 ['storage','🧊','Storage','Keep chilled, frozen and stored foods at the right temperature and protected from contamination.'],
 ['cooking','🍳','Cooking','Achieve the applicable food-specific cooking temperature and time.'],
 ['cooling','❄️','Cooling','Cool high-risk cooked food quickly and safely before refrigeration.'],
 ['thawing','💧','Thawing','Thaw frozen food hygienically and prevent unsafe storage after thawing.'],
 ['reheating','↻','Reheating','Reheat safely and uniformly before service.'],
];
export default function TemperatureControls(){return <main><div className="container"><div className="breadcrumb"><Link href="/home">Home</Link> › Temperature Controls</div><p className="eyebrow">PRIORITY FOOD-SAFETY CONTROLS</p><h1>Temperature Controls</h1><p className="lead">Five temperature controls that supervisors should be able to check quickly.</p><div className="notice" style={{marginTop:20}}><Thermometer size={20}/><div><strong>FSSAI reference guidance</strong><p style={{margin:'4px 0 0'}}>Reference temperatures are shown with their source. Outlet-specific approved and validated processes remain the control reference.</p></div></div><div className="grid" style={{marginTop:28}}>{controls.map(([slug,icon,title,summary])=><Link key={slug} href={`/temperature-controls/${slug}`} className="card control-card"><div className="control-icon">{icon}</div><div style={{flex:1}}><h2 style={{margin:'0 0 6px'}}>{title}</h2><p className="muted" style={{margin:0}}>{summary}</p></div><ChevronRight/></Link>)}</div></div></main>}
