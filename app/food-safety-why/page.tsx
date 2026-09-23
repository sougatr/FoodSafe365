'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle, ChevronLeft, HelpCircle, BookOpen, Home, Wrench, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FOODSAFE28, FoodSafeCheck } from '@/lib/foodsafety28';

const categories = Array.from(new Set(FOODSAFE28.map(x => x.category)));

export default function FoodSafetyWhy() {
  const [specific, setSpecific] = useState<FoodSafeCheck | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const code = q.get('check');
    const id = Number(q.get('id'));

    if (code) {
      setSpecific(FOODSAFE28.find(x => x.code === code) || null);
    } else if (id) {
      setSpecific(FOODSAFE28.find(x => x.id === id) || null);
    }
  }, []);

  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <Link href="/checks" className="nav-link">Supervisor Checks</Link>
          <Link href="/checklist" className="nav-link">28 Essential Safeguards</Link>
        </div>
      </div>

      <div className="container page-shell">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
          <Link href="/home" className="nav-link muted back-row">
            <ChevronLeft size={17} /> Home
          </Link>
          <Link
            href={specific ? `/checks?check=${specific.id}` : '/checklist'}
            className="nav-link muted back-row"
          >
            <ChevronLeft size={17} /> {specific ? `Back to Check #${specific.id}` : 'Back to 28 Safeguards'}
          </Link>
        </div>

        {specific ? (
          <>
            <div className="page-title">
              <span className="pill good">SPECIFIC CHECK RATIONALE</span>
              <h1>{specific.title}</h1>
              <p className="lead muted">
                Control {specific.code} · {specific.category} · Frequency: {specific.frequency}
              </p>
            </div>

            {/* WHY DOES THIS MATTER */}
            <section className="card" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <HelpCircle className="icon-blue" size={24} />
                  <div>
                    <p className="eyebrow" style={{ margin: 0 }}>PURPOSE & RATIONALE</p>
                    <h2 style={{ margin: 0 }}>Why does this specific check matter?</h2>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--text, #1e293b)' }}>
                {specific.why}
              </p>
            </section>

            <div className="grid grid2" style={{ marginBottom: 20 }}>
              {/* WHAT TO CHECK */}
              <div className="card">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <Eye size={20} />
                  <h3 style={{ margin: 0 }}>What to check</h3>
                </div>
                <ul className="compact-list">
                  {specific.what.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* WHAT STANDARD TO MEET */}
              <div className="card">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <CheckCircle2 size={20} />
                  <h3 style={{ margin: 0 }}>Standard to meet</h3>
                </div>
                <p style={{ lineHeight: 1.5 }}>{specific.standard}</p>
              </div>
            </div>

            <div className="grid grid2" style={{ marginBottom: 24 }}>
              {/* SPECIFIC RISK IF MISSED */}
              <div className="card" style={{ borderLeft: '4px solid var(--danger, #ef4444)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <AlertTriangle size={20} color="var(--danger, #ef4444)" />
                  <h3 style={{ margin: 0, color: 'var(--danger, #b91c1c)' }}>Specific food-safety risk if missed</h3>
                </div>
                <p style={{ lineHeight: 1.5 }}>{specific.risk}</p>
              </div>

              {/* IMMEDIATE CORRECTIVE ACTION */}
              <div className="card" style={{ borderLeft: '4px solid var(--accent, #3b82f6)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <Wrench size={20} />
                  <h3 style={{ margin: 0 }}>Action required if unacceptable</h3>
                </div>
                <p style={{ lineHeight: 1.5 }}>{specific.action}</p>
              </div>
            </div>

            <div className="page-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`/checks?check=${specific.id}`} className="btn primary">
                Perform this check now <ArrowRight size={17} />
              </Link>
              <button
                className="btn secondary"
                onClick={() => {
                  setSpecific(null);
                  history.replaceState(null, '', '/food-safety-why');
                }}
              >
                Explore why other controls matter
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="page-title">
              <span className="pill good">FOOD SAFETY — WHY?</span>
              <h1>Why does the supervisor check?</h1>
              <p className="lead muted">
                A checklist is useful only when the person doing the check understands what each control is protecting. Every check has a specific purpose, specific standard, and specific risk.
              </p>
            </div>

            <div className="notice info">
              <ShieldCheck size={20} />
              <div>
                <strong>The purpose is early detection of real problems.</strong>
                <p style={{ margin: '5px 0 0' }}>
                  The supervisor is not ticking generic boxes. Each check is an operational opportunity to confirm that a critical hygiene or temperature control is functioning today before food is served.
                </p>
              </div>
            </div>

            <section className="section-block">
              <div className="section-title">
                <div>
                  <p className="eyebrow">CONTROL-SPECIFIC GUIDANCE</p>
                  <h2>Select any of the 28 controls to understand why it matters</h2>
                  <p className="muted">Detailed rationale, specific risks, and required corrective steps for each control.</p>
                </div>
              </div>

              {categories.map(cat => (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 12 }}>{cat}</h3>
                  <div className="checklist-library">
                    {FOODSAFE28.filter(x => x.category === cat).map(c => (
                      <div
                        key={c.id}
                        className="card library-row"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSpecific(c);
                          history.replaceState(null, '', `/food-safety-why?check=${c.code}`);
                        }}
                      >
                        <div className="library-number">{c.id}</div>
                        <div className="library-main">
                          <h3>{c.title}</h3>
                          <p className="muted">{c.why}</p>
                        </div>
                        <span className="nav-link" style={{ fontSize: 13 }}>
                          Learn why <ArrowRight size={15} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <div className="page-actions">
              <Link href="/checks" className="btn primary">
                Start today’s checks <ArrowRight size={17} />
              </Link>
              <Link href="/food-safety-framework" className="btn secondary">
                Food Safety Framework <ArrowRight size={17} />
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
