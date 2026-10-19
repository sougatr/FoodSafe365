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
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  FOODSAFE28,
  CheckRecord,
  CorrectiveAction,
  AuditTrailEvent
} from '@/lib/foodsafety28';
import GlobalHeader from '@/components/GlobalHeader';

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
  const [serverData, setServerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<'401' | '403' | 'ERROR' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tab, setTab] = useState('checks');

  async function loadRecords() {
    setIsLoading(true);
    setErrorCode(null);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/v1/records', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          setErrorCode('401');
          setErrorMessage('Your session has expired or authentication is required. Please sign in to view traceable compliance records.');
          return;
        }
        if (res.status === 403) {
          setErrorCode('403');
          setErrorMessage('Access denied: Your account role does not have permission to view traceable compliance records for this outlet.');
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        setErrorCode('ERROR');
        setErrorMessage(errJson?.error?.message || errJson?.message || `Server returned error (${res.status}).`);
        return;
      }
      const json = await res.json();
      setServerData(json.data);
    } catch (err: any) {
      console.warn('[Records] Error fetching records:', err);
      setErrorCode('ERROR');
      setErrorMessage(err?.message || 'Could not load traceable records. Please check your network connection and retry.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const rawChecks: any[] = serverData?.checks || [];
  const actions: CorrectiveAction[] = serverData?.actions || [];
  const timeline: AuditTrailEvent[] = serverData?.timeline || [];
  const rawMonitoring: any[] = serverData?.monitoring || [];
  const outletName = serverData?.outlet?.name || 'ABC Restaurant';
  const summary = serverData?.summary || {
    checksRecorded: rawChecks.length,
    issues: actions.length,
    openActions: actions.filter((a: any) => a.status !== 'closed').length,
    closedActions: actions.filter((a: any) => a.status === 'closed').length,
    monitoringRecords: rawMonitoring.length
  };

  const completedChecksList = useMemo(() => {
    return rawChecks.map((r: any) => {
      const def = FOODSAFE28.find(x => x.code === r.code);
      return {
        code: r.code || 'FS-CHECK',
        title: r.title || def?.title || r.template || 'Food Safety Check',
        category: r.area || def?.category || 'General',
        frequency: r.frequency || def?.frequency || 'Daily',
        input: r.input || def?.input || 'yes_no',
        standard: def?.standard || '',
        why: def?.why || '',
        value: typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value ?? 'Recorded'),
        time: r.time || new Date().toISOString(),
        status: r.result === 'pass' || r.result === 'good' ? 'good' : r.result === 'na' ? 'na' : 'attention',
        reviewStatus: r.reviewStatus || 'approved',
        managerNote: r.note || r.managerNote
      };
    });
  }, [rawChecks]);

  const tempControlsList = useMemo(() => {
    const tempCodes = ['FS28-19', 'FS28-20', 'FS28-21', 'FS28-22', 'FS28-32', 'FS28-33', 'FS-STO-005', 'FS-PREP-003', 'FS-PREP-005', 'FS-PREP-006'];
    return completedChecksList.filter(c => tempCodes.includes(c.code) || c.input === 'temperature');
  }, [completedChecksList]);

  const openActionsCount = summary.openActions;
  const closedActionsCount = summary.closedActions;

  return (
    <main>
      <GlobalHeader />

      <div style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
          {outletName} · Traceable Records
        </div>
        <button
          onClick={loadRecords}
          disabled={isLoading}
          className="btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '5px 11px' }}
          title="Refresh records"
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
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
            <h1>Records &amp; History</h1>
            <p className="muted">
              Complete traceable record of supervisor observations, manager review decisions, corrective actions, and verification audit trail.
            </p>
          </div>
          <div className="check-progress-box">
            <strong>{completedChecksList.length}</strong>
            <span className="muted">checks recorded</span>
          </div>
        </div>

        {isLoading && !serverData && (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--surface, #ffffff)', borderRadius: 12, border: '1px solid var(--border, #e2e8f0)', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 15 }}>
              <RefreshCw className="animate-spin" size={20} />
              <span>Loading traceable compliance records...</span>
            </div>
          </div>
        )}

        {errorCode === '401' && (
          <div className="card" style={{ padding: '24px 28px', marginBottom: 28, border: '1px solid #fed7aa', background: '#fffbeb', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ea580c', marginBottom: 10 }}>
              <ShieldCheck size={22} />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Session Expired or Sign In Required</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/login?redirect=/records"
                className="btn primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, textDecoration: 'none' }}
              >
                <span>Sign In to FoodSafe365</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={loadRecords}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {errorCode === '403' && (
          <div className="card" style={{ padding: '24px 28px', marginBottom: 28, border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', marginBottom: 10 }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Access Denied (Permission Denied)</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/login?redirect=/records"
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', textDecoration: 'none' }}
              >
                <span>Switch Account / Sign In</span>
              </Link>
              <Link
                href="/home"
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', textDecoration: 'none' }}
              >
                <span>Return to Home</span>
              </Link>
              <button
                type="button"
                onClick={loadRecords}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {errorCode === 'ERROR' && (
          <div className="notice error" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={loadRecords}
              className="btn secondary"
              style={{ fontSize: 12, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* METRICS & TABS — RENDER ONLY WHEN SERVER DATA IS AVAILABLE */}
        {serverData && (
          <>
            <div className="grid grid3 record-summary" style={{ marginBottom: 28 }}>
              <div className="card metric-card">
                <ClipboardCheck />
                <span>Checks recorded</span>
                <strong>{completedChecksList.length}</strong>
                <small>Audited check observations</small>
              </div>
              <div className="card metric-card">
                <Wrench />
                <span>Open actions</span>
                <strong>{openActionsCount}</strong>
                <small>Remediation required</small>
              </div>
              <div className="card metric-card">
                <ShieldCheck />
                <span>Closed &amp; verified</span>
                <strong>{closedActionsCount}</strong>
                <small>Manager-audited corrections</small>
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
                Audit trail ({timeline.length})
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
                      <strong>No checks recorded yet</strong>
                      <p className="muted">As supervisors record daily checks, each observation will be archived here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="record-list">
                    {completedChecksList.map((c, idx) => (
                      <div className="card record-row" key={`${c.code}-${idx}`}>
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
                                {c.reviewStatus === 'pending_manager' ? 'PENDING REVIEW' : String(c.reviewStatus).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="muted" style={{ margin: '6px 0 2px' }}>
                            Recorded value: <strong>{c.value}</strong>
                          </p>
                          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                            <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                            {fmt(c.time)}
                            {c.managerNote && ` · Note: "${c.managerNote}"`}
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
                                {String(a.severity).toUpperCase()}
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
                    <h2>Temperature &amp; CCP monitoring history</h2>
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
                      <strong>No temperature controls recorded yet</strong>
                      <p className="muted">Recorded storage, cooking, cooling, reheating, and holding temperatures will show here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="record-list">
                    {tempControlsList.map((t, idx) => (
                      <div className="card record-row" key={`${t.code}-${idx}`}>
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
                                {String(t.reviewStatus).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <p className="muted" style={{ margin: '6px 0 2px' }}>
                            Measurement: <strong>{t.value}</strong>
                          </p>
                          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                            Recorded at {fmt(t.time)} {t.standard && `· Standard: ${t.standard}`}
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
                    <h2>Independent audit trail</h2>
                    <span className="muted">Timestamped record of supervisor checks, manager reviews, and verifications</span>
                  </div>
                  <span className="pill good">IMMUTABLE EVENT LOG</span>
                </div>

                {timeline.length === 0 ? (
                  <div className="card empty-state">
                    <FileText />
                    <div>
                      <strong>No audit trail events recorded yet</strong>
                      <p className="muted">All system actions and reviews will create an unalterable log here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="timeline">
                    {timeline.map((evt, idx) => (
                      <div className="timeline-item" key={evt.id || `evt-${idx}`}>
                        <div className="timeline-dot" />
                        <div className="timeline-content card">
                          <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>{evt.type}</strong>
                            <span className="muted" style={{ fontSize: 12 }}>{fmt(evt.at)}</span>
                          </div>
                          <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>{evt.detail}</p>
                          {evt.status && (
                            <span className="pill neutral" style={{ marginTop: 8, display: 'inline-block', fontSize: 11 }}>
                              Status: {evt.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
