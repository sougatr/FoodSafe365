import Link from 'next/link';

export default function AboutPage(){
  return <main>
    <div className="topbar"><Link href="/" className="brand">FoodSafe365</Link><Link href="/login"><button className="btn secondary">Log in</button></Link></div>
    <div className="container page-shell">
      <div className="page-title">
        <span className="pill good">ABOUT FOODSAVE365</span>
        <h1>Safer food. Every day.</h1>
        <p className="lead muted">FoodSafe365 is a practical digital food-safety management platform designed to help restaurants turn everyday hygiene and food-safety requirements into simple, repeatable actions.</p>
      </div>

      <div className="grid grid2">
        <section className="card"><p className="eyebrow">OUR PURPOSE</p><h2>Make food safety part of the daily operation.</h2><p className="muted">Food safety should not depend on remembering a manual, finding a paper checklist or waiting for an inspection. FoodSafe365 brings checks, explanations, corrective actions and records into one workflow.</p></section>
        <section className="card"><p className="eyebrow">OUR APPROACH</p><h2>Simple for the supervisor. Useful for management.</h2><p className="muted">The supervisor sees what needs to be checked, why it matters, what good looks like and what to do when something is wrong. Managers see the actual unresolved issues and their status.</p></section>
      </div>

      <section className="section-block">
        <div className="section-title"><h2>How FoodSafe365 works</h2></div>
        <div className="grid grid3">
          {[
            ['01','CHECK','Record the real condition of the restaurant.'],
            ['02','UNDERSTAND','Show WHY, WHAT, STANDARD and RISK in plain language.'],
            ['03','CORRECT','Turn an exception into a corrective action and verify it.']
          ].map(([n,t,d])=><div className="card" key={n}><div className="stat">{n}</div><h3>{t}</h3><p className="muted">{d}</p></div>)}
        </div>
      </section>

      <section className="card source-note"><div><p className="eyebrow">REGULATORY FOUNDATION</p><h2>Built around food-safety requirements, not just paperwork.</h2><p className="muted">FoodSafe365 uses applicable FSSAI food-service hygiene requirements as an important reference for its operational controls. The FoodSafe365 daily checklist is an operational product feature; it is not an official FSSAI checklist or FSSAI Hygiene Rating.</p></div></section>

      <div className="page-actions"><Link href="/providers"><button className="btn primary">Find service providers</button></Link><Link href="/contact"><button className="btn secondary">Contact us</button></Link></div>
    </div>
  </main>
}
