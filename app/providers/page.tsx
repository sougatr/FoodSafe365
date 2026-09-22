import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';

const categories = [
 ['Pest control','Inspection, integrated pest management, treatment and documentation.'],
 ['Cleaning & hygiene','Cleaning chemicals, sanitation systems, tools and hygiene support.'],
 ['Cold-chain / refrigerated transport','Temperature-controlled storage and transport for chilled or frozen products.'],
 ['Food-waste & organic-waste management','Segregation, collection, processing and responsible disposal of food waste.'],
 ['Cleaning equipment & supplies','Food-contact cleaning tools, brushes, mops, PPE and janitorial supplies.'],
 ['Food-safety training','Food-handler training, hygiene awareness and food-safety management training.'],
 ['Refrigeration & equipment service','Preventive maintenance, calibration and repair of refrigeration and temperature devices.'],
 ['Medical / occupational health support','Food-handler health screening and occupational-health support where required.'],
];

export default function ProvidersPage(){
 return <main><div className="topbar"><Link href="/" className="brand">FoodSafe365</Link><Link href="/login"><button className="btn secondary">Log in</button></Link></div>
  <div className="container page-shell">
   <div className="page-title"><span className="pill good">PROVIDERS & VENDORS</span><h1>Food-safety service providers</h1><p className="lead muted">We are building a network of service providers who can help restaurants act on food-safety requirements in practice.</p></div>
   <div className="notice provider-notice"><strong>Looking for a service?</strong><p style={{margin:'5px 0 0'}}>FoodSafe365 is not publishing individual provider names or websites at this stage. Tell us what service you need and we will take it forward.</p></div>
   <div className="grid grid2 provider-grid">{categories.map(([title,need])=><section className="card provider-card" key={title}><p className="eyebrow">SERVICE CATEGORY</p><h2>{title}</h2><p className="muted">{need}</p><div className="provider-contact"><span>Contact FoodSafe365 for provider information</span><a className="nav-link" href="mailto:ray.health.ai@gmail.com?subject=FoodSafe365%20Provider%20Enquiry">Enquire <ArrowRight size={16}/></a></div></section>)}</div>
   <section className="card section-block"><div className="provider-contact-main"><div><p className="eyebrow">PROVIDER NETWORK</p><h2>Want to become a FoodSafe365 provider?</h2><p className="muted">Contact us with your organisation details, service area and the type of food-safety service you provide.</p></div><a className="btn primary" href="mailto:ray.health.ai@gmail.com?subject=FoodSafe365%20Provider%20Partnership"><Mail size={17}/> Contact us</a></div></section>
  </div>
 </main>
}
