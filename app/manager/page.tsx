'use client';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, History, Home, ShieldCheck, Wrench, Star, QrCode, Info, RefreshCw, Database, Server } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  FOODSAFE28,
  FoodSafeCheck,
  CheckRecord,
  Issue,
  CorrectiveAction,
  AuditTrailEvent,
  DinerSafetyRating,
  CustomerVoiceSummary,
  calculateCustomerVoiceSummary,
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
  const [serverRatings, setServerRatings] = useState<DinerSafetyRating[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [storageBackend, setStorageBackend] = useState<'postgresql' | 'server_file' | 'local'>('server_file');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('all');
  const [activeRestaurantName, setActiveRestaurantName] = useState<string>('Leopold Cafe & Bar');

  function resolveRestaurantName(outletId: string): string {
    if (outletId === 'leopold-cafe') return 'Leopold Cafe & Bar';
    if (outletId === 'the-table') return 'The Table';
    if (outletId === 'the-bombay-canteen') return 'The Bombay Canteen';
    if (outletId === 'bastian-mumbai') return 'Bastian';
    if (outletId === 'peter-cat') return 'Peter Cat';
    if (outletId === 'abc-restaurant') return 'ABC Restaurant';
    if (typeof window !== 'undefined') {
      try {
        const setupStr = localStorage.getItem('foodsafe365_setup');
        if (setupStr) {
          const setup = JSON.parse(setupStr);
          if (setup.name) return setup.name;
        }
      } catch {}
    }
    return outletId === 'all' ? 'All Outlets' : 'Restaurant';
  }

  async function loadServerFeedback(outletId: string = selectedOutletId) {
    setIsLoadingFeedback(true);
    setFeedbackError(null);
    try {
      const q = outletId && outletId !== 'all' ? `?outletId=${encodeURIComponent(outletId)}` : '';
      let receivedRatings: DinerSafetyRating[] = [];
      let backendStorage: 'postgresql' | 'server_file' | 'local' = 'server_file';

      const res = await fetch(`/api/v1/customer-feedback${q}`, {
        cache: 'no-store'
      });
      if (!res.ok) {
        if (res.status === 401) {
          // If unauthenticated, retry with demo mode for preview
          const retryRes = await fetch(`/api/v1/customer-feedback${q ? q + '&demo=true' : '?demo=true'}`, { cache: 'no-store' });
          if (retryRes.ok) {
            const retryJson = await retryRes.json();
            if (retryJson.data?.ratings) {
              receivedRatings = retryJson.data.ratings;
              if (retryJson.data.storage) backendStorage = retryJson.data.storage;
            }
          }
        } else {
          throw new Error(`Server returned status ${res.status}`);
        }
      } else {
        const json = await res.json();
        if (json.data?.ratings) {
          receivedRatings = json.data.ratings;
          if (json.data.storage) backendStorage = json.data.storage;
        }
      }

      // SAFELY MERGE with local cache so newly submitted client ratings are NEVER wiped out
      const local = loadState();
      const localRatings: DinerSafetyRating[] = local.dinerRatings || [];
      const mergedMap = new Map<string, DinerSafetyRating>();

      // 1. Add server ratings
      for (const r of receivedRatings) {
        mergedMap.set(r.id, r);
      }
      // 2. Preserve any local ratings not in server ratings
      for (const r of localRatings) {
        if (!mergedMap.has(r.id)) {
          mergedMap.set(r.id, r);
        }
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setServerRatings(mergedList);
      setStorageBackend(backendStorage);

      // Sync local cache with merged list
      try {
        local.dinerRatings = mergedList;
        localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(local));
      } catch {}
    } catch (err: any) {
      console.warn('[Manager] Unable to load server feedback:', err);
      setFeedbackError(err?.message || 'Server connection error');
      const local = loadState();
      if (local.dinerRatings) {
        setServerRatings(local.dinerRatings);
        setStorageBackend('local');
      }
    } finally {
      setIsLoadingFeedback(false);
    }
  }

  useEffect(() => {
    const refresh = () => setData(loadState());
    refresh();

    if (typeof window !== 'undefined') {
      const savedOutlet = localStorage.getItem('foodsafe365_outlet_id');
      const targetOutlet = savedOutlet && savedOutlet !== 'all' ? savedOutlet : 'leopold-cafe';
      setSelectedOutletId(targetOutlet);
      setActiveRestaurantName(resolveRestaurantName(targetOutlet));
      loadServerFeedback(targetOutlet);
    } else {
      loadServerFeedback(selectedOutletId);
    }

    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, []);

  // Reload when outlet selection changes
  useEffect(() => {
    setActiveRestaurantName(resolveRestaurantName(selectedOutletId));
    loadServerFeedback(selectedOutletId);
  }, [selectedOutletId]);

  const checks: Record<string, CheckRecord> = data.checks || {};
  const issues: Issue[] = data.issues || [];
  const actions: CorrectiveAction[] = data.actions || [];
  const timeline: AuditTrailEvent[] = data.timeline || [];
  const dinerRatings: DinerSafetyRating[] = serverRatings.length > 0 ? serverRatings : (data.dinerRatings || []);

  const activeRatings = useMemo(() => {
    if (selectedOutletId === 'all') return dinerRatings;
    return dinerRatings.filter(r => r.outletId === selectedOutletId);
  }, [dinerRatings, selectedOutletId]);

  const customerVoice: CustomerVoiceSummary = useMemo(() => {
    return calculateCustomerVoiceSummary(activeRatings);
  }, [activeRatings]);

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
          <div className="muted" style={{ fontSize: 13 }}>{activeRestaurantName} · Manager</div>
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

        {/* 5. THE MANAGER'S MONTHLY ADMIN AUDIT (Items 7 & 8) */}
        <section className="section-block" style={{ marginTop: 36 }}>
          <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="pill good" style={{ marginBottom: 6 }}>MONTHLY STATUTORY COMPLIANCE</span>
              <h2 style={{ fontSize: 22, margin: '4px 0 2px', color: '#0f172a' }}>
                5. The Manager&apos;s Monthly Admin Audit
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                Administrative points removed from daily floor supervisor routine. Audited monthly by the General Manager or Owner.
              </p>
            </div>
            <Link
              href="/providers?category=Occupational%20health%20providers"
              className="btn secondary"
              style={{ fontSize: 12.5, padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Book Diagnostic Camp / Training <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid2" style={{ gap: 16, marginTop: 16 }}>
            {/* Item 7: FoSTaC & Staff Training */}
            <div className="card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    🎓
                  </div>
                  <div>
                    <span className="eyebrow" style={{ margin: 0, fontSize: 10 }}>ITEM 7 · FS28-08</span>
                    <span style={{ fontSize: 9.5, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginLeft: 6 }}>
                      DESIRABLE (OPTIONAL)
                    </span>
                  </div>
                </div>
                <Link href="/checks?check=7" className="btn secondary" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                  Log Audit Check →
                </Link>
              </div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                Supervisor FoSTaC and Staff Food-Hygiene Training
              </h3>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' }}>
                Are supervisor FoSTaC and staff training certificates (optional) up to date and available? Training is desirable and recommended to reinforce hygienic practices.
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#475569' }}>
                <strong>Standard:</strong> Verified certificate copies filed in the audit folder or digital repository.
              </div>
            </div>

            {/* Item 8: Staff Medical Fitness & Stool Test Records */}
            <div className="card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    🩺
                  </div>
                  <div>
                    <span className="eyebrow" style={{ margin: 0, fontSize: 10 }}>ITEM 8 · FS28-09</span>
                    <span style={{ fontSize: 9.5, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginLeft: 6 }}>
                      [CRITICAL]
                    </span>
                  </div>
                </div>
                <Link href="/checks?check=8" className="btn secondary" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                  Log Audit Check →
                </Link>
              </div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                Staff Medical Fitness (Form 1A) &amp; 6-Monthly Stool Tests
              </h3>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' }}>
                Are staff medical fitness certificates and 6-monthly stool test records current? Administrative check frequently targeted during surprise FDA/FSSAI inspections.
              </p>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#475569' }}>
                <strong>Standard:</strong> 100% of active food handlers must hold active Form 1A certificates with stool pathogen clearance.
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CUSTOMER VOICE — WHAT ARE YOUR CUSTOMERS TELLING YOU? */}
        {/* ========================================================================= */}
        <section className="section-block" style={{ marginTop: 36 }}>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: 20,
            padding: '24px 28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Star size={12} fill="#059669" color="#059669" /> CUSTOMER VOICE
                  </div>
                  {storageBackend === 'postgresql' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      <Database size={11} /> PostgreSQL Live DB
                    </span>
                  ) : storageBackend === 'server_file' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      <Server size={11} /> Server Store (.data)
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      Local Cache
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
                  Customer Food-Safety Feedback
                </h2>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  What diners observed and experienced through your tabletop &amp; menu QR codes across all devices.
                </p>
              </div>

              {/* Outlet Selector, Refresh & Test QR */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedOutletId}
                  onChange={e => setSelectedOutletId(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Outlets ({dinerRatings.length} feedback)</option>
                  <option value="leopold-cafe">Leopold Cafe &amp; Bar (Mumbai)</option>
                  <option value="the-table">The Table (Mumbai)</option>
                  <option value="the-bombay-canteen">The Bombay Canteen</option>
                  <option value="bastian-mumbai">Bastian (Mumbai)</option>
                  <option value="peter-cat">Peter Cat (Kolkata)</option>
                  <option value="abc-restaurant">ABC Restaurant</option>
                </select>

                <button
                  type="button"
                  onClick={() => loadServerFeedback(selectedOutletId)}
                  disabled={isLoadingFeedback}
                  className="btn secondary"
                  style={{ fontSize: 12.5, padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                  title="Fetch latest customer ratings from server persistence layer"
                >
                  <RefreshCw size={13} style={{ animation: isLoadingFeedback ? 'spin 1s linear infinite' : 'none' }} />
                  {isLoadingFeedback ? 'Syncing…' : 'Refresh'}
                </button>

                <Link
                  href={`/qr/${selectedOutletId === 'all' ? 'leopold-cafe' : selectedOutletId}`}
                  className="btn secondary"
                  style={{ fontSize: 12.5, padding: '7px 12px' }}
                >
                  <QrCode size={13} style={{ marginRight: 4 }} /> Test Tabletop QR
                </Link>
              </div>
            </div>

            {feedbackError && (
              <div style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                fontSize: 13,
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }}>
                <span>⚠️ {feedbackError} Displaying locally cached ratings.</span>
                <button
                  type="button"
                  onClick={() => loadServerFeedback(selectedOutletId)}
                  className="btn secondary"
                  style={{ fontSize: 11, padding: '4px 8px' }}
                >
                  Retry Connection
                </button>
              </div>
            )}

            {isLoadingFeedback && dinerRatings.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: '#059669' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Loading Live Customer Feedback</h4>
                <p style={{ margin: 0, fontSize: 13 }}>Querying server persistence layer across all registered outlets…</p>
              </div>
            ) : customerVoice.totalRatings === 0 ? (
              /* EMPTY STATE */
              <div className="card empty-state" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '36px 20px', textAlign: 'center' }}>
                <Star size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  No customer ratings recorded yet
                </h3>
                <p className="muted" style={{ maxWidth: 480, margin: '0 auto 16px', fontSize: 13.5 }}>
                  Share your tabletop QR code with diners to start receiving verified food-safety feedback directly on your manager dashboard.
                </p>
                <Link href={`/qr/${selectedOutletId === 'all' ? 'leopold-cafe' : selectedOutletId}`} className="btn primary" style={{ fontSize: 13, padding: '8px 16px', background: '#059669', display: 'inline-flex', gap: 6, margin: '0 auto' }}>
                  <QrCode size={14} /> Open Restaurant Tabletop QR Code
                </Link>
              </div>
            ) : (
              <>
                {/* OVERALL SCORE & VOLUME SUMMARY */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '18px 20px',
                  marginBottom: 20
                }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Overall Customer Rating
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <strong style={{ fontSize: 36, fontWeight: 900, color: '#047857' }}>
                        {customerVoice.overallScore}
                      </strong>
                      <span style={{ fontSize: 18, color: '#64748b', fontWeight: 600 }}>/ 5</span>
                      <div style={{ display: 'inline-flex', color: '#059669', marginLeft: 4 }}>
                        <Star size={20} fill="#059669" />
                      </div>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                      Based on genuine diner table observations
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Number of Ratings
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                      <strong style={{ fontSize: 36, fontWeight: 900, color: '#0f172a' }}>
                        {customerVoice.totalRatings}
                      </strong>
                      <span style={{ fontSize: 14, color: '#64748b' }}>
                        {customerVoice.totalRatings === 1 ? 'diner rating' : 'diner ratings'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                      Customer Feedback (Not an audit or certification)
                    </p>
                  </div>
                </div>

                {/* EARLY FEEDBACK NOTICE (IF 1-2 RATINGS) */}
                {customerVoice.isEarlyFeedback && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 12,
                    padding: '14px 18px',
                    marginBottom: 22,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Info size={18} />
                    </div>
                    <div style={{ fontSize: 13.5, color: '#92400e', lineHeight: 1.45 }}>
                      <strong>Early customer feedback — more ratings are needed to identify a meaningful pattern.</strong>
                      <div style={{ fontSize: 12.5, color: '#b45309', marginTop: 2 }}>
                        Displaying initial observations. Trends become statistically reliable once 3 or more diners submit feedback.
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY PATTERNS (WHERE SUFFICIENT DATA EXISTS OR SUMMARY) */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px' }}>
                    Customer Experience Categories
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12
                  }}>
                    {[
                      customerVoice.cleanliness,
                      customerVoice.staffHygiene,
                      customerVoice.foodHandling,
                      customerVoice.overallConfidence
                    ].map(cat => (
                      <div
                        key={cat.key}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{cat.label}</span>
                          <strong style={{ fontSize: 14, color: cat.score >= 4 ? '#047857' : cat.score >= 3 ? '#d97706' : '#dc2626' }}>
                            {cat.score} / 5
                          </strong>
                        </div>
                        {/* Visual Progress Track */}
                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(0, (cat.score / 5) * 100))}%`,
                              height: '100%',
                              background: cat.score >= 4 ? '#059669' : cat.score >= 3 ? '#f59e0b' : '#ef4444',
                              borderRadius: 999
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WHAT ARE YOUR CUSTOMERS TELLING YOU? (AREAS REQUIRING ATTENTION & ACTION CTA) */}
                {customerVoice.weakerArea && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: 16,
                    padding: '20px 22px',
                    marginBottom: 24
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                      <div style={{ maxWidth: 640 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#166534',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'inline-block',
                          marginBottom: 4
                        }}>
                          WHAT ARE YOUR CUSTOMERS TELLING YOU?
                        </span>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f2922', margin: '2px 0 6px' }}>
                          Relatively Weaker Feedback: {customerVoice.weakerArea.label} ({customerVoice.weakerArea.score} / 5)
                        </h3>
                        <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#166534', lineHeight: 1.5 }}>
                          Customer feedback indicates potential areas requiring operational attention in <strong>{customerVoice.weakerArea.label}</strong>. Convert this observation into a verified kitchen check:
                        </p>
                        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ClipboardCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
                          <span>
                            <strong>Recommended FoodSafe365 Control:</strong> {customerVoice.weakerArea.checkCode} — {customerVoice.weakerArea.checkTitle}
                          </span>
                        </div>
                      </div>

                      {/* ACTION CTA: [START FOOD SAFETY CHECK] */}
                      <div>
                        <Link
                          href={`/checks?code=${customerVoice.weakerArea.checkCode}&from=customer_feedback&feedbackArea=${encodeURIComponent(customerVoice.weakerArea.label)}`}
                          className="btn primary"
                          style={{
                            background: '#059669',
                            borderColor: '#059669',
                            color: '#ffffff',
                            fontSize: 14,
                            fontWeight: 800,
                            padding: '12px 20px',
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <ClipboardCheck size={18} /> START FOOD SAFETY CHECK <ArrowRight size={16} />
                        </Link>
                        <p style={{ fontSize: 11, color: '#15803D', textAlign: 'center', margin: '6px 0 0', fontWeight: 600 }}>
                          Opens {customerVoice.weakerArea.checkCode} check
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* RECENT CUSTOMER REMARKS & OBSERVATIONS LOG */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px' }}>
                    Recent Customer Remarks &amp; Observations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {customerVoice.recentObservations.map(rating => (
                      <div
                        key={rating.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderLeft: `4px solid ${rating.overallScore >= 4 ? '#059669' : rating.overallScore >= 3 ? '#f59e0b' : '#ef4444'}`,
                          borderRadius: 12,
                          padding: '16px 18px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                              {rating.tableNumber || 'Table QR'}
                            </span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              · {rating.dinerName || 'Customer'}
                            </span>
                            <span className="pill neutral" style={{ fontSize: 10, padding: '1px 6px' }}>
                              CUSTOMER FEEDBACK
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <strong style={{ fontSize: 14, color: '#047857' }}>
                              {rating.overallScore}★
                            </strong>
                            <Link
                              href={`/checks?from=customer_feedback&table=${encodeURIComponent(rating.tableNumber || '')}`}
                              className="btn secondary"
                              style={{ fontSize: 11.5, padding: '3px 9px' }}
                            >
                              Verify with Check →
                            </Link>
                          </div>
                        </div>

                        {/* 5-score breakdown mini tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, fontSize: 11.5, color: '#475569' }}>
                          <span>Cleanliness: <strong>{rating.scores?.cleanliness || 5}★</strong></span>
                          <span>Staff: <strong>{rating.scores?.staffHygiene || 5}★</strong></span>
                          <span>Food: <strong>{rating.scores?.foodFreshness || 5}★</strong></span>
                          <span>Water: <strong>{rating.scores?.safeWater || 5}★</strong></span>
                          <span>Washroom: <strong>{rating.scores?.washroom || 5}★</strong></span>
                        </div>

                        {rating.feedback ? (
                          <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: '#1e293b', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1' }}>
                            &ldquo;{rating.feedback}&rdquo;
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                            No additional text remarks provided.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

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
