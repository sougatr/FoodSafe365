'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  FileText,
  History,
  Home,
  ShieldCheck,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Thermometer,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  FOODSAFE28,
  CheckRecord,
  Issue,
  CorrectiveAction,
  AuditTrailEvent,
  AppPhase1State,
  PHASE1_STORAGE_KEY,
  isScheduledCheck,
  calculateDailyBadge
} from '@/lib/foodsafety28';

function loadState(): AppPhase1State {
  try {
    return JSON.parse(localStorage.getItem(PHASE1_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

const fmt = (v?: string | null) => {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return v;
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'closed':
      return 'Closed & Verified';
    case 'awaiting_verification':
      return 'Awaiting Verification';
    case 'in_progress':
      return 'In Progress';
    case 'open':
    default:
      return 'Action Required';
  }
};

export default function Records() {
  const [data, setData] = useState<AppPhase1State>({});
  const [tab, setTab] = useState('checks');

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
  const badge = useMemo(() => calculateDailyBadge(checks, issues, scheduled), [checks, issues, scheduled]);

  // List of completed checks
  const completedChecksList = useMemo(() => {
    return Object.entries(checks).map(([code, record]) => {
      const def = FOODSAFE28.find(x => x.code === code);
      return {
        code,
        title: def ? def.title : code,
        category: def ? def.category : 'General',
        frequency: def ? def.frequency : 'Daily',
        input: def ? def.input : 'yes_no',
        standard: def ? def.standard : '',
        why: def ? def.why : '',
        ...record
      };
    }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [checks]);

  // Temperature & CCP monitoring entries
  const tempControlsList = useMemo(() => {
    const tempCodes = ['FS28-19', 'FS28-20', 'FS28-21', 'FS28-22', 'FS28-32', 'FS28-33'];
    return completedChecksList.filter(c => tempCodes.includes(c.code));
  }, [completedChecksList]);

  // Derived audit events if timeline is empty
  const activeTimeline = useMemo(() => {
    if (timeline.length > 0) return timeline;

    const events: AuditTrailEvent[] = [];
    Object.entries(checks).forEach(([code, r], idx) => {
      events.push({
        id: `synth-chk-${idx}`,
        at: r.time,
        type: 'Supervisor check submitted',
        detail: `${code}: ${r.value} (${r.status === 'na' ? 'Not Applicable' : r.status === 'good' ? 'Acceptable' : 'Needs attention'})`,
        status: r.reviewStatus
      });
      if (r.reviewedAt) {
        events.push({
          id: `synth-rev-${idx}`,
          at: r.reviewedAt,
          type: r.reviewStatus === 'approved' ? 'Manager approved check' : 'Manager confirmed alert',
          detail: `${code} reviewed as ${r.reviewStatus.toUpperCase()}.${r.managerNote ? ` Note: "${r.managerNote}"` : ''}`,
          status: r.reviewStatus
        });
      }
    });

    actions.forEach((a, idx) => {
      events.push({
        id: `synth-act-open-${idx}`,
        at: a.createdAt,
        type: 'Corrective action opened',
        detail: `${a.title}: ${a.description}`,
        status: 'open'
      });
      if (a.completedAt) {
        events.push({
          id: `synth-act-sub-${idx}`,
          at: a.completedAt,
          type: 'Restaurant submitted correction',
          detail: `${a.title} submitted for verification. Immediate: ${a.immediateAction}`,
          status: 'awaiting_verification'
        });
      }
      if (a.closedAt) {
        events.push({
          id: `synth-act-cls-${idx}`,
          at: a.closedAt,
          type: 'Manager verified correction',
          detail: `${a.title} verified and closed.${a.verificationNote ? ` Note: "${a.verificationNote}"` : ''}`,
          status: 'closed'
        });
      }
    });

    return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [timeline, checks, actions]);

  const openActionsCount = actions.filter(a => a.status !== 'closed').length;
  const closedActionsCount = actions.filter(a => a.status === 'closed').length;

  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <div className="muted">ABC Restaurant · Traceable Records</div>
        </div>
      </div>

      <div className="container">
        <div className="checks-nav">
          <Link href="/home" className="muted nav-link">
            <ChevronLeft size={18} /> Home
          </Link>
          <span className="muted">Traceable Records</span>
        </div>

        <div className="checks-header">
          <div>
            <p className="eyebrow">TRACEABLE FOOD-SAFETY RECORD</p>
            <h1>Records & History</h1>
            <p className="muted">
              Complete traceable record of supervisor observations, manager review decisions, corrective actions, and verification audit trail.
            </p>
          </div>
          <div className="check-progress-box">
            <strong>{completedChecksList.length}</strong>
            <span className="muted">checks recorded today</span>
          </div>
        </div>

        {/* DAILY BADGE SNAPSHOT */}
        <div className={`card daily-badge ${badge.tone === 'good' ? 'badge-good' : badge.tone === 'danger' ? 'badge-action' : 'badge-attention'}`} style={{ marginBottom: 24 }}>
          <div className="badge-icon">
            {badge.tone === 'good' ? <CheckCircle2 /> : <ClipboardCheck />}
          </div>
          <div>
            <p className="eyebrow">TODAY’S FOODSAFE365 BADGE</p>
            <h2>{badge.status}</h2>
            <p className="muted">{badge.explanation}</p>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid3 record-summary" style={{ marginBottom: 28 }}>
          <div className="card metric-card">
            <ClipboardCheck />
            <span>Checks recorded</span>
            <strong>{completedChecksList.length}</strong>
            <small>{badge.counts.approved} manager-approved</small>
          </div>
          <div className="card metric-card">
            <Wrench />
            <span>Open actions</span>
            <strong>{openActionsCount}</strong>
            <small>{badge.counts.criticalAlerts} critical</small>
          </div>
          <div className="card metric-card">
            <ShieldCheck />
            <span>Closed & verified</span>
            <strong>{closedActionsCount}</strong>
            <small>Audited corrections</small>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs record-tabs">
          <button
            className={`tab ${tab === 'checks' ? 'active' : ''}`}
            onClick={() => setTab('checks')}
          >
            Daily checks ({completedChecksList.length})
          </button>
          <button
            className={`tab ${tab === 'actions' ? 'active' : ''}`}
            onClick={() => setTab('actions')}
          >
            Corrective actions ({actions.length})
          </button>
          <button
            className={`tab ${tab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setTab('monitoring')}
          >
            Temperature controls ({tempControlsList.length})
          </button>
          <button
            className={`tab ${tab === 'timeline' ? 'active' : ''}`}
            onClick={() => setTab('timeline')}
          >
            Audit trail ({activeTimeline.length})
          </button>
        </div>

        {/* TAB 1: DAILY CHECKS */}
        {tab === 'checks' && (
          <section>
            <div className="section-title">
              <div>
                <h2>Completed daily check records</h2>
                <span className="muted">Recorded by supervisor and reviewed by manager</span>
              </div>
              <Link href="/checks" className="btn secondary">
                Perform checks <ArrowRight size={15} />
              </Link>
            </div>

            {completedChecksList.length === 0 ? (
              <div className="card empty-state">
                <ClipboardCheck />
                <div>
                  <strong>No checks recorded today yet</strong>
                  <p className="muted">As the supervisor completes checks, each observation will be archived here.</p>
                </div>
              </div>
            ) : (
              <div className="record-list">
                {completedChecksList.map(c => (
                  <div className="card record-row" key={c.code}>
                    <div className={`record-icon ${c.status === 'na' ? '' : c.status === 'good' ? '' : 'icon-attention'}`}>
                      {c.input === 'temperature' ? <Thermometer /> : <ClipboardCheck />}
                    </div>
                    <div className="record-main" style={{ flex: 1 }}>
                      <div className="record-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="eyebrow" style={{ margin: 0 }}>{c.code} · {c.category}</span>
                          <h3 style={{ margin: '2px 0 0' }}>{c.title}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className={`pill ${c.status === 'na' ? 'neutral' : c.status === 'good' ? 'good' : 'attention'}`}>
                            {c.status === 'na' ? 'Not Applicable' : c.status === 'good' ? 'Acceptable' : 'Needs attention'}
                          </span>
                          <span className={`pill ${c.reviewStatus === 'approved' ? 'good' : c.reviewStatus === 'alerted' ? 'danger' : 'neutral'}`}>
                            {c.reviewStatus === 'pending_manager' ? 'PENDING REVIEW' : c.reviewStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="muted" style={{ margin: '6px 0 2px' }}>
                        Recorded value: <strong>{c.value}</strong>
                      </p>
                      <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                        <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        {fmt(c.time)}
                        {c.managerNote && ` · Manager note: "${c.managerNote}"`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: CORRECTIVE ACTIONS */}
        {tab === 'actions' && (
          <section>
            <div className="section-title">
              <div>
                <h2>Corrective-action records</h2>
                <span className="muted">Actions stemming from manager-confirmed alerts</span>
              </div>
              <Link href="/actions" className="btn secondary">
                Open Actions Centre <ArrowRight size={15} />
              </Link>
            </div>

            {actions.length === 0 ? (
              <div className="card empty-state">
                <CheckCircle2 />
                <div>
                  <strong>No corrective actions on record</strong>
                  <p className="muted">When a food safety alert is confirmed, corrective actions will be recorded here.</p>
                </div>
              </div>
            ) : (
              <div className="record-list">
                {actions.map(a => (
                  <Link href={`/actions/${a.id}`} className="card record-row record-link" key={a.id}>
                    <div className={`record-icon ${a.status === 'closed' ? '' : 'icon-danger'}`}>
                      {a.status === 'closed' ? <CheckCircle2 /> : <Wrench />}
                    </div>
                    <div className="record-main" style={{ flex: 1 }}>
                      <div className="record-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="eyebrow" style={{ margin: 0 }}>ACTION #{a.id}</span>
                          <h3 style={{ margin: '2px 0 0' }}>{a.title}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className={`pill ${a.severity === 'critical' ? 'danger' : 'attention'}`}>
                            {a.severity.toUpperCase()}
                          </span>
                          <span className={`pill ${a.status === 'closed' ? 'good' : 'attention'}`}>
                            {statusLabel(a.status)}
                          </span>
                        </div>
                      </div>
                      <p className="muted" style={{ margin: '6px 0 4px' }}>{a.description}</p>
                      {a.immediateAction && (
                        <p style={{ margin: '2px 0', fontSize: 13 }}>
                          <strong>Immediate action:</strong> {a.immediateAction}
                        </p>
                      )}
                      {a.correctiveAction && (
                        <p style={{ margin: '2px 0', fontSize: 13 }}>
                          <strong>Corrective action:</strong> {a.correctiveAction}
                        </p>
                      )}
                      {a.verificationNote && (
                        <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--success, #16a34a)' }}>
                          <strong>Manager verification:</strong> {a.verificationNote}
                        </p>
                      )}
                      <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                        Created: {fmt(a.createdAt)} {a.closedAt && `· Verified & Closed: ${fmt(a.closedAt)}`}
                      </p>
                    </div>
                    <ArrowRight size={18} className="muted" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: TEMPERATURE CONTROLS */}
        {tab === 'monitoring' && (
          <section>
            <div className="section-title">
              <div>
                <h2>Temperature & CCP monitoring history</h2>
                <span className="muted">Storage, cooking, cooling, reheating, and holding</span>
              </div>
              <Link href="/temperature-controls" className="btn secondary">
                Temperature Controls Guide
              </Link>
            </div>

            {tempControlsList.length === 0 ? (
              <div className="card empty-state">
                <Thermometer />
                <div>
                  <strong>No temperature controls recorded today</strong>
                  <p className="muted">Recorded storage, cooking, cooling, reheating, and holding temperatures will show here.</p>
                </div>
              </div>
            ) : (
              <div className="record-list">
                {tempControlsList.map(t => (
                  <div className="card record-row" key={t.code}>
                    <div className="record-icon">
                      <Thermometer />
                    </div>
                    <div className="record-main" style={{ flex: 1 }}>
                      <div className="record-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="eyebrow" style={{ margin: 0 }}>{t.code}</span>
                          <h3 style={{ margin: '2px 0 0' }}>{t.title}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className={`pill ${t.status === 'good' ? 'good' : 'action'}`}>
                            {t.status === 'good' ? 'Within Limit' : 'Deviation'}
                          </span>
                          <span className={`pill ${t.reviewStatus === 'approved' ? 'good' : 'neutral'}`}>
                            {t.reviewStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="muted" style={{ margin: '6px 0 2px' }}>
                        Measurement: <strong>{t.value}</strong>
                      </p>
                      <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                        Recorded at {fmt(t.time)} · Standard: {t.standard}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {tab === 'timeline' && (
          <section>
            <div className="section-title">
              <div>
                <h2>Chronological audit trail</h2>
                <span className="muted">Traceable log of all food safety actions</span>
              </div>
            </div>

            {activeTimeline.length === 0 ? (
              <div className="card empty-state">
                <History />
                <div>
                  <strong>No audit events recorded yet</strong>
                  <p className="muted">Every supervisor check, manager review, action submission, and verification will appear in this audit trail.</p>
                </div>
              </div>
            ) : (
              <div className="timeline">
                {activeTimeline.map(e => (
                  <div className="card timeline-row" key={e.id}>
                    <div className="timeline-dot">
                      <History />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{e.type}</strong>
                        <small className="muted">{fmt(e.at)}</small>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 14 }}>{e.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="action-bar" style={{ marginTop: 32 }}>
          <Link href="/home" className="btn secondary">
            Back to Home
          </Link>
          <Link href="/manager" className="btn secondary">
            Manager Review
          </Link>
          <Link href="/checks" className="btn primary">
            Supervisor Checks
          </Link>
        </div>
      </div>
    </main>
  );
}
