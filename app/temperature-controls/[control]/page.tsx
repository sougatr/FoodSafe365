'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, ChevronLeft, Home, ShieldCheck, Thermometer } from 'lucide-react';

type ControlInfo = {
  title: string;
  icon: string;
  summary: string;
  reference: string;
  monitor: string;
  action: string;
  checkId: number;
  checkCode: string;
  focusParam: string;
};

const data: Record<string, ControlInfo> = {
  storage: {
    title: 'Storage & Refrigeration',
    icon: '🧊',
    summary: 'Keep cool, cold and stored foods at safe temperatures (< 5°C / < −18°C) and protected from contamination.',
    reference: 'FSSAI food-safety guidance references Cool Room / cool storage at < 5°C (0°C to < 5°C) and Cold Storage at < −18°C. Stored food must maintain proper segregation, elevation, and FIFO/FEFO.',
    monitor: 'Cool Room (< 5°C) / Cold Room (< −18°C) / reach-in chillers + segregation + labelling + FIFO/FEFO',
    action: 'Restore correct storage temperature, isolate affected stock, assess whether temperature abuse requires disposal, and call refrigeration technician if needed.',
    checkId: 17,
    checkCode: 'FS28-19',
    focusParam: 'storage'
  },
  cooking: {
    title: 'Cooking',
    icon: '🍳',
    summary: 'Achieve the applicable food-specific core cooking temperature and time.',
    reference: 'FSSAI Hygiene Rating references vegetarian food at 60°C for 10 minutes or 65°C for 2 minutes core temperature. For non-vegetarian food, references are 65°C for 10 minutes, 70°C for 2 minutes, or 75°C for 15 seconds core temperature.',
    monitor: 'Food core temperature with calibrated probe thermometer + duration maintained at target',
    action: 'If the approved cooking standard is not achieved, continue cooking until target core temperature and time are reached. Do not serve undercooked food.',
    checkId: 19,
    checkCode: 'FS28-21',
    focusParam: 'cooking'
  },
  cooling: {
    title: 'Cooling',
    icon: '❄️',
    summary: 'Cool high-risk cooked food quickly and safely before refrigeration.',
    reference: 'FSSAI Hygiene Rating material references cooling cooked high-risk food from 60°C to 21°C within 2 hours or less, then from 21°C to 5°C within a further 2 hours or less.',
    monitor: 'Start temperature/time + Checkpoint 1 (≤ 21°C within 120 min) + Checkpoint 2 (≤ 5°C within subsequent 120 min)',
    action: 'Apply approved rapid cooling methods (shallow pans, ice bath, blast chiller). Food exceeding permitted cooling limits must be evaluated for disposal or immediate recooking where permitted.',
    checkId: 20,
    checkCode: 'FS28-22',
    focusParam: 'cooling'
  },
  holding: {
    title: 'Food Protection & Holding',
    icon: '♨️',
    summary: 'Hold food covered and protected from contamination, maintaining safe temperature during service and dispatch.',
    reference: 'FSSAI guidance requires food on display, buffet lines, and holding stations to be covered and protected. Hot holding must remain safe (≥ 65°C) and cold holding at ≤ 5°C.',
    monitor: 'Food holding temperatures, sneeze guards, covers, and service display hygiene throughout service',
    action: 'Cover exposed foods immediately; reheat hot food to ≥ 75°C if dropped temporarily and permitted; discard food held in danger zone over 2 hours.',
    checkId: 16,
    checkCode: 'FS28-18',
    focusParam: 'holding'
  },
  reheating: {
    title: 'Reheating',
    icon: '↻',
    summary: 'Reheat previously cooked food rapidly to safe core temperatures before service.',
    reference: 'FSSAI Hygiene Rating material references a core temperature of 75°C, maintained for at least 2 minutes. Reheating must use direct heat equipment (stove, oven, microwave), not holding equipment (bain-marie).',
    monitor: 'Core temperature + time at ≥ 75°C + verification of direct heating equipment',
    action: 'Continue heating until 75°C core is maintained for at least 2 minutes. Discard food that cannot reach temperature safely or has been reheated multiple times.',
    checkId: 19,
    checkCode: 'FS28-21',
    focusParam: 'reheating'
  },
  thawing: {
    title: 'Thawing',
    icon: '💧',
    summary: 'Thaw frozen food hygienically and prevent unsafe holding after thawing.',
    reference: 'FSSAI Hygiene Rating references meat, fish and poultry thawing in a refrigerator at ≤ 5°C or in a microwave. Shellfish/seafood may be thawed in cold potable running water at ≤ 15°C within 90 minutes. Never refreeze thawed food.',
    monitor: 'Thawing method (refrigerator / running water / microwave) + food temperature',
    action: 'Stop and correct any room-temperature thawing. Isolate affected food, check core temperature, and ensure prompt cooking or safe disposition.',
    checkId: 9,
    checkCode: 'FS28-10',
    focusParam: 'thawing'
  }
};

export default function ControlDetail() {
  const p = useParams();
  const slug = String(p.control || '');
  const c = data[slug] || data.storage;

  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <div className="muted">Temperature Control #{c.checkId}</div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <div className="checks-nav">
          <Link href="/home" className="muted nav-link" style={{ marginRight: 12 }}>
            <ChevronLeft size={18} /> Home
          </Link>
          <Link href="/temperature-controls" className="muted nav-link">
            Temperature Controls
          </Link>
          <span className="muted">› {c.title}</span>
        </div>

        <div className="control-hero">
          <div className="control-icon large">{c.icon}</div>
          <div>
            <p className="eyebrow">TEMPERATURE CONTROL #{c.checkId}</p>
            <h1>{c.title}</h1>
            <p className="lead">{c.summary}</p>
          </div>
        </div>

        <div className="grid grid2" style={{ marginTop: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <ShieldCheck size={20} />
              <h3 style={{ margin: 0 }}>FSSAI reference standard</h3>
            </div>
            <p style={{ lineHeight: 1.5 }}>{c.reference}</p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <Thermometer size={20} />
              <h3 style={{ margin: 0 }}>What to monitor</h3>
            </div>
            <p style={{ lineHeight: 1.5 }}>{c.monitor}</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20, borderLeft: '4px solid var(--danger, #ef4444)' }}>
          <h3 style={{ marginTop: 0 }}>If there is a temperature deviation</h3>
          <p style={{ lineHeight: 1.5, margin: 0 }}>{c.action}</p>
        </div>

        <div className="notice info" style={{ marginTop: 20 }}>
          <CheckCircle2 size={20} />
          <div>
            <strong>Operational workflow</strong>
            <p style={{ margin: '4px 0 0' }}>
              Supervisor records actual temperature → FoodSafe365 checks against standard → Manager reviews → If alert confirmed, restaurant takes action and manager verifies.
            </p>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: 32 }}>
          <div>
            <p className="eyebrow">GUIDED CHECK</p>
            <h2>Ready to check {c.title.toLowerCase()}?</h2>
            <p className="muted">This opens the exact operational check #{c.checkId} ({c.checkCode}) for immediate recording.</p>
          </div>
          <Link href={`/checks?focus=${c.focusParam}`} className="btn primary">
            Check {c.title} Now <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
