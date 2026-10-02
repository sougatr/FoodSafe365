'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ChevronLeft, Clock3, Home, ShieldCheck, Wrench, ArrowRight, Play, Check, ExternalLink, Calendar, User, RefreshCw } from 'lucide-react';
import {
  CorrectiveAction,
  AppPhase1State,
  PHASE1_STORAGE_KEY,
  AuditTrailEvent
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

function statusBadge(s: string) {
  switch (s) {
    case 'open':
      return { label: 'Open', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '🔴' };
    case 'in_progress':
      return { label: 'In Progress', color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '🟠' };
    case 'awaiting_verification':
      return { label: 'Awaiting Verification', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '🔵' };
    case 'closed':
      return { label: 'Closed & Verified', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '🟢' };
    default:
      return { label: s.replace(/_/g, ' '), color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', dot: '⚪' };
  }
}

export default function ActionsPage() {
  const [data, setData] = useState<AppPhase1State>({});
  const [tab, setTab] = useState('all');
  const [serverActions, setServerActions] = useState<CorrectiveAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  async function syncServerActions() {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/actions', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.actions && Array.isArray(json.data.actions)) {
          setServerActions(json.data.actions);
        }
      }
    } catch (err) {
      console.warn('[ActionsPage] Could not sync server actions:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    const refresh = () => setData(loadState());
    refresh();
    syncServerActions();
    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, []);

  // Merge server actions with local state actions without duplicate ids
  const actions: CorrectiveAction[] = useMemo(() => {
    const local = data.actions || [];
    const map = new Map<string, CorrectiveAction>();
    // Start with server actions
    serverActions.forEach(a => map.set(a.id, a));
    // Overlay local actions
    local.forEach(a => map.set(a.id, a));
    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data.actions, serverActions]);

  const shown = useMemo(() => {
    if (tab === 'all') return actions;
    if (tab === 'guest') return actions.filter(a => a.checkCode === 'GUEST-GRIEVANCE');
    return actions.filter(a => a.status === tab);
  }, [actions, tab]);

  const openCount = actions.filter(a => a.status === 'open').length;
  const inProgressCount = actions.filter(a => a.status === 'in_progress').length;
  const awaitingCount = actions.filter(a => a.status === 'awaiting_verification').length;
  const closedCount = actions.filter(a => a.status === 'closed').length;

  async function updateActionStatus(actionId: string, newStatus: 'in_progress' | 'awaiting_verification' | 'closed') {
    const now = new Date().toISOString();
    const existing = actions.find(a => a.id === actionId);
    if (!existing) return;

    const updatedActions = actions.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          status: newStatus,
          completedAt: newStatus === 'awaiting_verification' ? now : a.completedAt,
          closedAt: newStatus === 'closed' ? now : a.closedAt,
          verifiedAt: newStatus === 'closed' ? now : a.verifiedAt,
          verificationStatus: newStatus === 'closed' ? ('pass' as const) : a.verificationStatus
        };
      }
      return a;
    });

    const event: AuditTrailEvent = {
      id: `evt-action-status-${Date.now()}`,
      at: now,
      type: `Action status updated: ${newStatus}`,
      detail: `${existing.title} updated to ${newStatus.replace(/_/g, ' ')}.`,
      status: newStatus
    };

    const nextState: AppPhase1State = {
      ...data,
      actions: updatedActions,
      timeline: [event, ...(data.timeline || [])]
    };

    saveState(nextState);
    setData(nextState);

    // Call server API for persistence
    try {
      if (newStatus === 'in_progress') {
        await fetch(`/api/v1/actions/${actionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' })
        });
      } else if (newStatus === 'awaiting_verification') {
        await fetch(`/api/v1/actions/${actionId}/submit-verification`, { method: 'POST' });
      } else if (newStatus === 'closed') {
        await fetch(`/api/v1/actions/${actionId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: 'pass', notes: 'Verified and approved by manager' })
        });
      }
    } catch (err) {
      console.warn('[ActionsPage] Non-fatal status update sync warning:', err);
    }
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
          <span className="pill neutral" style={{ fontSize: 11, padding: '3px 9px' }}>
            CORRECTIVE ACTIONS HUB
          </span>
          <ThemeToggle />
          <button
            onClick={syncServerActions}
            disabled={isSyncing}
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '6px 12px' }}
            title="Sync with server persistence"
          >
            <RefreshCw size={13} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            {isSyncing ? 'Syncing…' : 'Sync'}
          </button>
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
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '4px 0 10px', letterSpacing: '-0.02em' }}>
              Restaurant Corrective Actions
            </h1>
            <p className="muted" style={{ fontSize: 15, margin: 0, maxWidth: 680 }}>
              Operational tracking for all internal check deviations and customer feedback triggers. Define containment, assign responsibility, track remediation, and complete independent manager verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="check-progress-box" style={{
              background: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <strong style={{ fontSize: 26, display: 'block', color: openCount > 0 ? '#ef4444' : '#059669', lineHeight: 1.1 }}>{openCount}</strong>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>🔴 OPEN</span>
            </div>
            <div className="check-progress-box" style={{
              background: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <strong style={{ fontSize: 26, display: 'block', color: '#d97706', lineHeight: 1.1 }}>{inProgressCount}</strong>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>🟠 IN PROGRESS</span>
            </div>
            <div className="check-progress-box" style={{
              background: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <strong style={{ fontSize: 26, display: 'block', color: '#2563eb', lineHeight: 1.1 }}>{awaitingCount}</strong>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>🔵 AWAITING VERIFICATION</span>
            </div>
            <div className="check-progress-box" style={{
              background: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <strong style={{ fontSize: 26, display: 'block', color: '#059669', lineHeight: 1.1 }}>{closedCount}</strong>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700 }}>🟢 VERIFIED CLOSED</span>
            </div>
          </div>
        </div>

        {/* STATUS TABS */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {[
            ['all', `All Actions (${actions.length})`],
            ['open', `🔴 Open (${openCount})`],
            ['in_progress', `🟠 In Progress (${inProgressCount})`],
            ['awaiting_verification', `🔵 Awaiting Verification (${awaitingCount})`],
            ['closed', `🟢 Closed & Verified (${closedCount})`],
            ['guest', `🚨 Guest Reports (${actions.filter(a => a.checkCode === 'GUEST-GRIEVANCE').length})`],
          ].map(([v, l]) => (
            <button
              key={v}
              className={tab === v ? 'tab active' : 'tab'}
              onClick={() => setTab(v)}
            >
              {l}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card empty-state" style={{ background: '#ffffff', border: '1.5px dashed #cbd5e1', padding: '40px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={40} style={{ color: '#059669', margin: '0 auto 12px' }} />
            <div>
              <strong style={{ fontSize: 16 }}>No corrective actions in this view</strong>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13.5 }}>
                {actions.length === 0
                  ? 'When a supervisor or manager identifies a non-conformance during checks, a structured action is created and tracked here.'
                  : 'There are no corrective actions matching the selected filter.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shown.map(a => {
              const badge = statusBadge(a.status);
              const isOverdue = a.dueDate && a.status !== 'closed' && new Date(a.dueDate).getTime() < (Date.now() - 86400000);

              return (
                <div
                  key={a.id}
                  className="card"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '20px 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* CARD HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: 999,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          <span>{badge.dot}</span> {badge.label.toUpperCase()}
                        </span>

                        {a.sourceCheckCode && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#f1f5f9', color: '#475569' }}>
                            CONTROL: {a.sourceCheckCode}
                          </span>
                        )}

                        {a.priority && (
                          <span className={`pill ${a.priority === 'critical' ? 'danger' : 'attention'}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                            PRIORITY: {a.priority.toUpperCase()}
                          </span>
                        )}

                        {a.sourceType === 'customer_feedback_trigger' && (
                          <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                            CUSTOMER FEEDBACK TRIGGER
                          </span>
                        )}

                        {a.requiresExternalService && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                            🛠️ External Service Required: {a.serviceCategory ? a.serviceCategory.replace(/_/g, ' ').toUpperCase() : 'Specialist'}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '2px 0 4px' }}>
                        {a.title}
                      </h3>
                    </div>

                    <Link
                      href={`/actions/${a.id}`}
                      className="btn secondary"
                      style={{ fontSize: 12.5, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      Full Details <ArrowRight size={14} />
                    </Link>
                  </div>

                  {/* STRUCTURED OPERATIONAL BLOCKS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 12 }}>
                    {/* 1. What is the problem? */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                        1. What is the problem? (Issue Identified)
                      </span>
                      <p style={{ margin: 0, fontSize: 13.5, color: '#1e293b', lineHeight: 1.45 }}>
                        {a.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* 2. What needs to be done? */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                        2. What needs to be done? (Remediation Plan)
                      </span>
                      <p style={{ margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.45 }}>
                        {a.immediateAction && (
                          <span style={{ display: 'block', marginBottom: 3 }}>
                            <strong style={{ color: '#0f172a' }}>Immediate:</strong> {a.immediateAction}
                          </span>
                        )}
                        {a.correctiveAction && (
                          <span style={{ display: 'block' }}>
                            <strong style={{ color: '#0f172a' }}>Corrective:</strong> {a.correctiveAction}
                          </span>
                        )}
                        {!a.immediateAction && !a.correctiveAction && (
                          <span className="muted">Remediation actions pending submission.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 3. ASSIGNMENT & SCHEDULE BAR */}
                  <div style={{
                    marginTop: 14,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 12.5, color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <User size={14} style={{ color: '#64748b' }} />
                        <strong>Assigned:</strong> {a.responsiblePerson || a.assignedTo || 'Duty Supervisor'}
                      </span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={14} style={{ color: isOverdue ? '#dc2626' : '#64748b' }} />
                        <strong style={{ color: isOverdue ? '#dc2626' : '#475569' }}>Due:</strong> {a.dueDate || 'Unscheduled'}
                        {isOverdue && (
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: '#fef2f2', color: '#dc2626' }}>
                            OVERDUE
                          </span>
                        )}
                      </span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Clock3 size={14} style={{ color: '#64748b' }} />
                        <span>Identified: {new Date(a.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {/* QUICK ACTION STATUS BUTTONS */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {a.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => updateActionStatus(a.id, 'in_progress')}
                          className="btn primary"
                          style={{ fontSize: 12, padding: '6px 12px', background: '#d97706', borderColor: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <Play size={13} /> START ACTION
                        </button>
                      )}

                      {a.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => updateActionStatus(a.id, 'awaiting_verification')}
                          className="btn primary"
                          style={{ fontSize: 12, padding: '6px 12px', background: '#2563eb', borderColor: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <Check size={13} /> MARK COMPLETED → SUBMIT VERIFICATION
                        </button>
                      )}

                      {a.status === 'awaiting_verification' && (
                        <button
                          type="button"
                          onClick={() => updateActionStatus(a.id, 'closed')}
                          className="btn primary"
                          style={{ fontSize: 12, padding: '6px 12px', background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <ShieldCheck size={13} /> VERIFY &amp; CLOSE ACTION
                        </button>
                      )}

                      {a.status === 'closed' && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={14} /> Verified Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
