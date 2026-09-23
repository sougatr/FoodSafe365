'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ChevronLeft, Clock3, Home, ShieldCheck, Wrench, ArrowRight } from 'lucide-react';
import {
  CorrectiveAction,
  AppPhase1State,
  PHASE1_STORAGE_KEY
} from '@/lib/foodsafety28';
import ThemeToggle from '@/components/ThemeToggle';

function loadState(): AppPhase1State {
  try {
    return JSON.parse(localStorage.getItem(PHASE1_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function label(s: string) {
  switch (s) {
    case 'awaiting_verification':
      return 'Awaiting verification';
    case 'in_progress':
      return 'In progress';
    case 'closed':
      return 'Closed & verified';
    case 'open':
    default:
      return 'Action required';
  }
}

export default function ActionsPage() {
  const [data, setData] = useState<AppPhase1State>({});
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const refresh = () => setData(loadState());
    refresh();
    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, []);

  const actions: CorrectiveAction[] = data.actions || [];

  const shown = useMemo(() => {
    if (tab === 'all') return actions;
    if (tab === 'guest') return actions.filter(a => a.checkCode === 'GUEST-GRIEVANCE');
    return actions.filter(a => a.status === tab);
  }, [actions, tab]);

  const openCount = actions.filter(a => a.status !== 'closed').length;
  const awaitingCount = actions.filter(a => a.status === 'awaiting_verification').length;

  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14
          }}>
            FS
          </div>
          <span>FoodSafe365</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="pill neutral" style={{ fontSize: 11, padding: '3px 9px' }}>
            CORRECTIVE ACTIONS HUB
          </span>
          <ThemeToggle />
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>ABC Restaurant · Actions Centre</div>
        </div>
      </div>

      <div className="container">
        <div className="checks-nav" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Link href="/home" className="muted nav-link" style={{ padding: '4px 8px' }}>
            <ChevronLeft size={16} /> Home
          </Link>
          <span className="muted" style={{ fontSize: 12 }}>/</span>
          <Link href="/manager" className="muted nav-link" style={{ padding: '4px 8px' }}>
            Manager review
          </Link>
          <span className="muted" style={{ fontSize: 12 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Actions Centre</span>
        </div>

        <div className="checks-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow">ALERT → CORRECTIVE ACTION → VERIFICATION</p>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '4px 0 10px', letterSpacing: '-0.02em' }}>Restaurant Actions</h1>
            <p className="muted" style={{ fontSize: 15, margin: 0, maxWidth: 640 }}>
              Every action here originates from a manager-confirmed food-safety alert or an urgent guest grievance. The restaurant acts, and the manager verifies.
            </p>
          </div>
          <div className="check-progress-box" style={{
            background: '#ffffff',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <strong style={{ fontSize: 32, display: 'block', color: openCount > 0 ? '#ef4444' : '#059669', lineHeight: 1.1 }}>{openCount}</strong>
            <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
              {awaitingCount > 0 ? `${awaitingCount} AWAITING REVIEW` : 'OPEN ACTIONS'}
            </span>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 20 }}>
          {[
            ['all', 'All Actions'],
            ['guest', '🚨 Guest Reports'],
            ['open', 'Open'],
            ['in_progress', 'In Progress'],
            ['awaiting_verification', 'Awaiting Verification'],
            ['closed', 'Closed & Verified'],
          ].map(([v, l]) => (
            <button
              key={v}
              className={tab === v ? 'tab active' : 'tab'}
              onClick={() => setTab(v)}
            >
              {l} {v === 'guest' ? `(${actions.filter(a => a.checkCode === 'GUEST-GRIEVANCE').length})` : v !== 'all' && `(${actions.filter(a => a.status === v).length})`}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card empty-state">
            <CheckCircle2 size={36} />
            <div>
              <strong>No actions in this view</strong>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                {actions.length === 0
                  ? 'When the manager confirms a food-safety alert, a restaurant corrective action is automatically created here.'
                  : 'There are no actions matching the selected filter.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="action-list">
            {shown.map(a => (
              <Link href={`/actions/${a.id}`} className="card action-row" key={a.id}>
                <div className={`icon-tile ${a.status === 'closed' ? 'good' : a.severity === 'critical' ? 'danger' : 'attention'}`} style={{
                  background: a.status === 'closed' ? '#ecfdf5' : a.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                  color: a.status === 'closed' ? '#059669' : a.severity === 'critical' ? '#ef4444' : '#f59e0b'
                }}>
                  {a.status === 'closed' ? <CheckCircle2 size={22} /> : <Wrench size={22} />}
                </div>
                <div className="action-row-main">
                  <div className="action-row-top">
                    <h3>{a.title}</h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {a.checkCode === 'GUEST-GRIEVANCE' && (
                        <span className="pill action" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 800 }}>
                          🚨 GUEST GRIEVANCE
                        </span>
                      )}
                      <span className={`pill ${a.severity === 'critical' ? 'danger' : 'attention'}`}>
                        {a.severity.toUpperCase()}
                      </span>
                      <span className={`pill ${a.status === 'closed' ? 'good' : a.status === 'awaiting_verification' ? 'attention' : 'neutral'}`}>
                        {label(a.status)}
                      </span>
                    </div>
                  </div>
                  <p className="muted" style={{ margin: '6px 0 10px', fontSize: 14 }}>{a.description}</p>
                  <div className="action-meta">
                    <span>
                      <Clock3 size={14} /> Created {new Date(a.createdAt).toLocaleDateString()} {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>
                      <ShieldCheck size={14} /> Manager-confirmed alert
                    </span>
                    {a.verificationStatus && (
                      <span style={{ color: a.verificationStatus === 'pass' ? '#059669' : '#dc2626' }}>
                        Verification: <strong>{a.verificationStatus.toUpperCase()}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="action-chevron" size={20} />
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <Link href="/manager" className="btn secondary">
            Manager Review
          </Link>
          <Link href="/records" className="btn secondary">
            Audit Records &amp; History
          </Link>
        </div>
      </div>
    </main>
  );
}
