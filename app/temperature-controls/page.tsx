'use client';
import Link from 'next/link';
import { Thermometer, ChevronRight, ChevronLeft, Home } from 'lucide-react';

const controls = [
  ['storage', '🧊', 'Storage', 'Keep chilled, frozen and stored foods at the right temperature and protected from contamination.'],
  ['cooking', '🍳', 'Cooking', 'Achieve the applicable food-specific cooking core temperature and time.'],
  ['cooling', '❄️', 'Cooling', 'Cool high-risk cooked food quickly and safely (≤21°C in 2h, ≤5°C in next 2h) before refrigeration.'],
  ['holding', '♨️', 'Hot & Cold Holding', 'Hold hot food (≥65°C veg, ≥70°C non-veg) and cold food (≤5°C) safely during service.'],
  ['reheating', '↻', 'Reheating', 'Reheat cooked food to ≥75°C for at least 2 minutes with direct heat before service.'],
  ['thawing', '💧', 'Thawing', 'Thaw frozen food hygienically (refrigerator ≤5°C or microwave) and prevent unsafe holding.'],
];

export default function TemperatureControls() {
  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <div className="muted">Priority Food-Safety Controls</div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <div className="checks-nav">
          <Link href="/home" className="muted nav-link">
            <ChevronLeft size={18} /> Home
          </Link>
          <span className="muted">Temperature Controls</span>
        </div>

        <p className="eyebrow">PRIORITY FOOD-SAFETY CONTROLS</p>
        <h1>Temperature Controls</h1>
        <p className="lead">
          Six priority temperature controls that supervisors must check and record daily.
        </p>

        <div className="notice" style={{ marginTop: 20 }}>
          <Thermometer size={20} />
          <div>
            <strong>FSSAI reference criteria</strong>
            <p style={{ margin: '4px 0 0' }}>
              Reference temperatures are derived from applicable FSSAI food-service standards. Recorded measurements directly feed supervisor checks and manager reviews.
            </p>
          </div>
        </div>

        <div className="grid" style={{ marginTop: 28 }}>
          {controls.map(([slug, icon, title, summary]) => (
            <Link key={slug} href={`/temperature-controls/${slug}`} className="card control-card">
              <div className="control-icon">{icon}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 6px' }}>{title}</h2>
                <p className="muted" style={{ margin: 0 }}>{summary}</p>
              </div>
              <ChevronRight />
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <Link href="/checks" className="btn primary">
            Open Today’s Checks
          </Link>
          <Link href="/checklist" className="btn secondary">
            28 Essential Safeguards
          </Link>
        </div>
      </div>
    </main>
  );
}
