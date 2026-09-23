'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Home} from 'lucide-react';

export default function ContactPage(){
  const [sent,setSent]=useState(false);
  return <main>
    <div className="topbar">
      <Link href="/home" className="brand">FoodSafe365</Link>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <Link href="/home" className="btn secondary" style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,padding:'7px 14px'}}>
          <Home size={15}/> Home
        </Link>
        <Link href="/login"><button className="btn secondary">Log in</button></Link>
      </div>
    </div>
    <div className="container page-shell">
      <Link href="/home" className="nav-link muted back-row" style={{marginBottom:12,display:'inline-flex',alignItems:'center',gap:6}}>← Back to Home</Link>
      <div className="page-title"><span className="pill good">CONTACT US</span><h1>Let’s talk about food safety.</h1><p className="lead muted">Tell us what you need — product information, restaurant onboarding, service-provider partnerships or support.</p></div>
      <div className="grid grid2 contact-grid">
        <section className="card"><p className="eyebrow">GET IN TOUCH</p><h2>FoodSafe365</h2><div className="contact-item"><strong>Product & partnerships</strong><span className="muted">For restaurants, service providers and technology partners.</span></div><div className="contact-item"><strong>Support</strong><span className="muted">For existing FoodSafe365 customers and users.</span></div><div className="contact-item"><strong>Email</strong><a href="mailto:ray.health.ai@gmail.com" className="nav-link">ray.health.ai@gmail.com</a></div><p className="notice neutral-notice">For all FoodSafe365 enquiries, contact us at ray.health.ai@gmail.com.</p></section>
        <section className="card">
          {sent ? <div className="completion-card compact"><div className="completion-icon">✓</div><h2>Message captured</h2><p className="muted">The form is ready for connection to the FoodSafe365 contact endpoint or CRM.</p><button className="btn secondary" onClick={()=>setSent(false)}>Send another</button></div> : <>
            <p className="eyebrow">SEND A MESSAGE</p>
            <div className="field"><label>Name</label><input className="input" placeholder="Your name" /></div>
            <div className="field" style={{marginTop:14}}><label>Email</label><input className="input" type="email" placeholder="you@example.com" /></div>
            <div className="field" style={{marginTop:14}}><label>Restaurant / organisation</label><input className="input" placeholder="Organisation name" /></div>
            <div className="field" style={{marginTop:14}}><label>How can we help?</label><textarea className="input textarea" placeholder="Tell us what you need..." /></div>
            <a className="btn primary" style={{marginTop:18}} href="mailto:ray.health.ai@gmail.com?subject=FoodSafe365%20Enquiry">Email FoodSafe365</a>
          </>}
        </section>
      </div>
    </div>
  </main>
}
