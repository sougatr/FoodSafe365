'use client';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, History, Home, ShieldCheck, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  FOODSAFE28,
  FoodSafeCheck,
  CheckRecord,
  Issue,
  CorrectiveAction,
  AuditTrailEvent,
  AppPhase1State,
  PHASE1_STORAGE_KEY,
  isScheduledCheck,
  severityForCheck,
  calculateDailyBadge
} from '@/lib/foodsafety28';
import ThemeToggle from '@/components/ThemeToggle';

function loadState(): AppPhase1State {
  try {
    return JSON.parse(localStorage.getItem(PHASE1_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(v: AppPhase1State) {
  localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(v));
  window.dispatchEvent(new Event('foodsaf365:update'));
}

export default function ManagerPage() {
  const [data, setData] = useState<AppPhase1State>({});
  const [note, setNote] = useState('');

  useEffect(() => {
    const refresh = () => setData(loadState());
    refresh();
    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, []);

  const checks: Record<string, CheckRecord> = data.checks || {};
  const issues: Issue[] = data.issues || [];
  const actions: CorrectiveAction[] = data.actions || [];
  const timeline: AuditTrailEvent[] = data.timeline || [];

  const scheduled = useMemo(() => FOODSAFE28.filter(isScheduledCheck), []);
  const pending = scheduled.filter(x => checks[x.code]?.reviewStatus === 'pending_manager');
  const unresolved = issues.filter(x => x.status !== 'closed');
  const badge = useMemo(() => calculateDailyBadge(checks, issues, scheduled), [checks, issues, scheduled]);

  function review(code: string, decision: 'approved' | 'alerted') {
    const c = checks[code];
    if (!c) return;
    const control = FOODSAFE28.find(x => x.code === code);
    if (!control) return;

    const now = new Date().toISOString();
    let nextIssues = [...issues];
    let nextActions = [...actions];
    let actionId = '';

    if (decision === 'alerted') {
      const existing = issues.find(i => i.checkCode === code && i.status !== 'closed');
      if (!existing) {
        const issueId = `issue-${control.id}-${Date.now()}`;
        actionId = `action-${control.id}-${Date.now()}`;
        const severity = severityForCheck(code);

        const newIssue: Issue = {
          id: issueId,
          checkId: control.id,
          checkCode: control.code,
          title: control.title,
          severity,
          createdAt: now,
          status: 'open',
          alertedAt: now,
          actionId
        };

        const newAction: CorrectiveAction = {
          id: actionId,
          issueId,
          checkCode: control.code,
          title: `Correct: ${control.title}`,
          description: control.action,
          severity,
          status: 'open',
          createdAt: now,
          immediateAction: '',
          correctiveAction: '',
          rootCause: '',
          completedAt: null,
          verificationNote: '',
          verificationStatus: null
        };

        nextIssues.push(newIssue);
        nextActions.push(newAction);
      }
    }

    const auditEvent: AuditTrailEvent = {
      id: `evt-mgr-${Date.now()}`,
      at: now,
      type: decision === 'approved' ? 'Manager approved check' : 'Manager confirmed alert',
      detail: `${control.code} (${control.title}) review decision: ${decision.toUpperCase()}.${note ? ` Note: "${note}".` : ''}${decision === 'alerted' ? ' Corrective action opened for restaurant.' : ''}`,
      status: decision === 'approved' ? 'approved' : 'alerted'
    };

    const nextState: AppPhase1State = {
      ...data,
      checks: {
        ...checks,
        [code]: {
          ...c,
          reviewStatus: decision,
          managerNote: note || undefined,
          reviewedAt: now
        }
      },
      issues: nextIssues,
      actions: nextActions,
      timeline: [auditEvent, ...timeline]
    };

    saveState(nextState);
    setData(nextState);
    setNote('');
  }

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
          <span className="pill good" style={{ fontSize: 11, padding: '3px 9px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block', marginRight: 4 }} />
            MANAGER OVERSIGHT ACTIVE
          </span>
          <ThemeToggle />
          <Link href="/manager/trends" className="btn secondary" style={{ fontSize: 13, padding: '6px 12px', color: 'var(--green)' }}>
            AI Trends
          </Link>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>ABC Restaurant · Manager</div>
        </div>
      </div>

      <div className="container manager-shell">
        <div className="manager-header">
          <div>
            <p className="eyebrow">MANAGER REVIEW &amp; OVERSIGHT</p>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '4px 0 10px', letterSpacing: '-0.02em' }}>
              Daily food-safety review
            </h1>
            <p className="lead" style={{ fontSize: 16, margin: 0, maxWidth: 680 }}>
              Review supervisor observations, approve valid controls, confirm alerts when standards are not met, and verify restaurant corrective actions.
            </p>
          </div>
          <Link href="/checks" className="btn secondary" style={{ whiteSpace: 'nowrap' }}>
            Supervisor checks <ArrowRight size={17} />
          </Link>
        </div>

        {/* DAILY BADGE */}
        <div className={`card daily-badge ${badge.tone === 'good' ? 'badge-good' : badge.tone === 'danger' ? 'badge-action' : 'badge-attention'}`}>
          <div className="badge-icon">
            {badge.tone === 'good' ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div>
            <p className="eyebrow" style={{ color: badge.tone === 'good' ? '#047857' : badge.tone === 'danger' ? '#b91c1c' : '#b45309' }}>
              TODAY’S FOODSAFE365 BADGE
            </p>
            <h2>{badge.status}</h2>
            <p className="muted" style={{ color: '#334155' }}>{badge.explanation}</p>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid3 manager-metrics">
          <div className="card metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                <ClipboardCheck size={20} />
              </div>
              <span className="pill neutral" style={{ fontSize: 11, padding: '2px 8px' }}>SCHEDULED</span>
            </div>
            <strong style={{ fontSize: 30, margin: '8px 0 2px' }}>{badge.counts.submitted}/{badge.counts.scheduled}</strong>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Supervisor Submitted</span>
            <small style={{ color: 'var(--muted)', fontSize: 12 }}>Today’s scheduled controls</small>
          </div>

          <div className="card metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                <ShieldCheck size={20} />
              </div>
              <span className={`pill ${pending.length > 0 ? 'attention' : 'good'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                {pending.length > 0 ? `${pending.length} PENDING` : 'UP TO DATE'}
              </span>
            </div>
            <strong style={{ fontSize: 30, margin: '8px 0 2px' }}>{badge.counts.approved}/{badge.counts.scheduled}</strong>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Manager Approved</span>
            <small style={{ color: 'var(--muted)', fontSize: 12 }}>{pending.length} pending review</small>
          </div>

          <div className="card metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: unresolved.length > 0 ? '#fef2f2' : '#ecfdf5', color: unresolved.length > 0 ? '#ef4444' : '#059669', display: 'grid', placeItems: 'center' }}>
                <AlertTriangle size={20} />
              </div>
              <span className={`pill ${unresolved.length > 0 ? 'danger' : 'good'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                {unresolved.length > 0 ? `${badge.counts.criticalAlerts} CRITICAL` : 'ZERO ALERTS'}
              </span>
            </div>
            <strong style={{ fontSize: 30, margin: '8px 0 2px' }}>{unresolved.length}</strong>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Open Alerts</span>
            <small style={{ color: 'var(--muted)', fontSize: 12 }}>{badge.counts.criticalAlerts} critical alerts</small>
          </div>
        </div>

        {/* SUPERVISOR RESULTS WAITING FOR REVIEW */}
        <div className="section-title">
          <div>
            <h2>Supervisor submissions awaiting review</h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
              Confirm observations recorded by the supervisor. A failed result becomes an alert and creates a corrective action only when confirmed here.
            </p>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="card empty-state">
            <CheckCircle2 size={36} />
            <div>
              <strong>No pending supervisor submissions</strong>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>All submitted supervisor results have been reviewed.</p>
            </div>
          </div>
        ) : (
          <div className="checklist-library">
            {pending.map(c => {
              const r = checks[c.code];
              const isAttention = r.status === 'attention';
              return (
                <div className="card manager-review-row" key={c.code}>
                  <div className="library-number">{c.id}</div>
                  <div className="manager-review-main">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span className="eyebrow" style={{ margin: 0 }}>{c.category} · DAILY CHECK</span>
                      {r.status === 'na' ? (
                        <span className="pill neutral" style={{ fontSize: 10, padding: '2px 6px' }}>NOT APPLICABLE</span>
                      ) : isAttention ? (
                        <span className="pill action" style={{ fontSize: 10, padding: '2px 6px' }}>NEEDS ATTENTION</span>
                      ) : (
                        <span className="pill good" style={{ fontSize: 10, padding: '2px 6px' }}>RECORDED</span>
                      )}
                    </div>
                    <h3>{c.title}</h3>
                    <p style={{ margin: '4px 0 6px', fontSize: 14, color: r.status === 'na' ? '#64748b' : isAttention ? '#dc2626' : '#047857' }}>
                      Observation: <strong>{r.value}</strong>
                    </p>
                    <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                      Submitted: {new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Standard: {c.standard}
                    </p>
                  </div>
                  <div className="manager-review-actions">
                    <button
                      className="btn secondary"
                      onClick={() => review(c.code, 'approved')}
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    {isAttention && (
                      <button
                        className="btn danger-btn"
                        onClick={() => review(c.code, 'alerted')}
                      >
                        <AlertTriangle size={16} /> Confirm Alert
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MANAGER DECISION NOTE */}
        {pending.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div className="card">
              <label className="field">
                <span>Manager review note (optional)</span>
                <textarea
                  className="input textarea"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Verified thermometer log and storage condition with morning supervisor."
                />
              </label>
            </div>
          </div>
        )}

        {/* OPEN ALERTS */}
        <div className="section-title" style={{ marginTop: 36 }}>
          <div>
            <h2>Open alerts & corrective actions</h2>
            <p className="muted">
              Alerts originate exclusively from confirmed failed controls and remain open until restaurant action and manager verification are complete.
            </p>
          </div>
          <Link href="/actions" className="nav-link">
            Action Centre <ArrowRight size={16} />
          </Link>
        </div>

        {unresolved.length === 0 ? (
          <div className="card empty-state">
            <CheckCircle2 />
            <div>
              <strong>No open alerts</strong>
              <p className="muted">All food safety controls are within approved standards or verified closed.</p>
            </div>
          </div>
        ) : (
          <div className="checklist-library">
            {unresolved.map((i: Issue) => {
              const act = actions.find(a => a.id === i.actionId || a.issueId === i.id);
              const targetHref = act ? `/actions/${act.id}` : '/actions';
              return (
                <div className="card issue-row" key={i.id}>
                  <AlertTriangle color={i.severity === 'critical' ? 'var(--danger, #ef4444)' : 'var(--warning, #f59e0b)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <strong>{i.title}</strong>
                      <span className={`pill ${i.severity === 'critical' ? 'danger' : 'attention'}`}>
                        {i.severity.toUpperCase()}
                      </span>
                      <span className="pill neutral">
                        {i.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
                      Alert raised: {new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {act && ` · Action: ${act.status.replace(/_/g, ' ')}`}
                    </p>
                  </div>
                  <Link href={targetHref} className="btn primary">
                    <Wrench size={16} /> {act?.status === 'awaiting_verification' ? 'Verify action' : 'Take action'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* AUDIT & RECORDS QUICK LINK */}
        <div className="section-block" style={{ marginTop: 36 }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>TRACEABLE AUDIT LOG</p>
              <h3 style={{ margin: '4px 0 0' }}>Food safety records and compliance history</h3>
              <p className="muted" style={{ margin: 0 }}>View all daily checks, manager review timestamps, corrective action logs, and audit trail.</p>
            </div>
            <Link href="/records" className="btn secondary">
              <History size={16} /> View Records & History <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
