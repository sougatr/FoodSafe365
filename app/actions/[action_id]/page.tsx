'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ChevronLeft, Home, ShieldCheck, Wrench, Clock, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import {
  CorrectiveAction,
  Issue,
  AuditTrailEvent,
  AppPhase1State,
  PHASE1_STORAGE_KEY
} from '@/lib/foodsafety28';

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

function label(s: string) {
  switch (s) {
    case 'awaiting_verification':
      return 'Awaiting manager verification';
    case 'in_progress':
      return 'In progress';
    case 'closed':
      return 'Closed & verified';
    case 'open':
    default:
      return 'Open — action required';
  }
}

export default function ActionDetail() {
  const params = useParams<{ action_id: string }>();
  const [data, setData] = useState<AppPhase1State>({});
  const [action, setAction] = useState<CorrectiveAction | null>(null);
  const [immediate, setImmediate] = useState('');
  const [corrective, setCorrective] = useState('');
  const [root, setRoot] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const refresh = () => {
      const state = loadState();
      setData(state);
      const found = (state.actions || []).find((a: CorrectiveAction) => a.id === params.action_id) || null;
      setAction(found);
      if (found) {
        setImmediate(found.immediateAction || '');
        setCorrective(found.correctiveAction || '');
        setRoot(found.rootCause || '');
        setNote(found.verificationNote || '');
      }
    };
    refresh();
    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, [params.action_id]);

  if (!action) {
    return (
      <main>
        <div className="container" style={{ paddingTop: 40 }}>
          <p className="muted">Action not found.</p>
          <Link href="/actions" className="btn secondary">
            Back to Restaurant Actions
          </Link>
        </div>
      </main>
    );
  }

  function submitAction() {
    if (!action) return;
    if (!immediate.trim() && !corrective.trim()) {
      alert('Please enter at least an immediate action or corrective action.');
      return;
    }

    const now = new Date().toISOString();
    const auditEvent: AuditTrailEvent = {
      id: `evt-action-sub-${Date.now()}`,
      at: now,
      type: 'Restaurant submitted action',
      detail: `${action.title} submitted for verification. Immediate: "${immediate}". Corrective: "${corrective}".`,
      status: 'awaiting_verification'
    };

    const nextActions = (data.actions || []).map(a =>
      a.id === action.id
        ? {
            ...a,
            immediateAction: immediate,
            correctiveAction: corrective,
            rootCause: root,
            status: 'awaiting_verification' as const,
            completedAt: now
          }
        : a
    );

    const nextIssues = (data.issues || []).map(i =>
      i.actionId === action.id || i.id === action.issueId
        ? { ...i, status: 'awaiting_verification' as const }
        : i
    );

    const nextState: AppPhase1State = {
      ...data,
      actions: nextActions,
      issues: nextIssues,
      timeline: [auditEvent, ...(data.timeline || [])]
    };

    saveState(nextState);
    setData(nextState);
    setAction(nextActions.find(a => a.id === action.id) || null);
    setMessage('Action successfully submitted for manager verification.');
  }

  function verify(result: 'pass' | 'fail') {
    if (!action) return;
    const now = new Date().toISOString();

    if (result === 'pass') {
      const auditEvent: AuditTrailEvent = {
        id: `evt-verify-pass-${Date.now()}`,
        at: now,
        type: 'Manager verified correction',
        detail: `Verified and closed: ${action.title}.${note ? ` Verification note: "${note}".` : ''}`,
        status: 'closed'
      };

      const nextActions = (data.actions || []).map(a =>
        a.id === action.id
          ? {
              ...a,
              status: 'closed' as const,
              verificationStatus: 'pass' as const,
              verificationNote: note,
              closedAt: now
            }
          : a
      );

      const nextIssues = (data.issues || []).map(i =>
        i.actionId === action.id || i.id === action.issueId
          ? { ...i, status: 'closed' as const, verifiedAt: now }
          : i
      );

      const nextState: AppPhase1State = {
        ...data,
        actions: nextActions,
        issues: nextIssues,
        timeline: [auditEvent, ...(data.timeline || [])]
      };

      saveState(nextState);
      setData(nextState);
      setAction(nextActions.find(a => a.id === action.id) || null);
      setMessage('Correction verified by manager. Alert and Action are now closed.');
    } else {
      const auditEvent: AuditTrailEvent = {
        id: `evt-verify-fail-${Date.now()}`,
        at: now,
        type: 'Manager rejected verification',
        detail: `Verification failed for ${action.title}. Action reopened for further correction.${note ? ` Manager note: "${note}".` : ''}`,
        status: 'in_progress'
      };

      const nextActions = (data.actions || []).map(a =>
        a.id === action.id
          ? {
              ...a,
              status: 'in_progress' as const,
              verificationStatus: 'fail' as const,
              verificationNote: note
            }
          : a
      );

      const nextIssues = (data.issues || []).map(i =>
        i.actionId === action.id || i.id === action.issueId
          ? { ...i, status: 'action_in_progress' as const }
          : i
      );

      const nextState: AppPhase1State = {
        ...data,
        actions: nextActions,
        issues: nextIssues,
        timeline: [auditEvent, ...(data.timeline || [])]
      };

      saveState(nextState);
      setData(nextState);
      setAction(nextActions.find(a => a.id === action.id) || null);
      setMessage('Verification failed. Action has been reopened for the restaurant team to complete further correction.');
    }
  }

  const editable = ['open', 'in_progress'].includes(action.status);

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
            ACTION TICKET #{action.id}
          </span>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> Home
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>ABC Restaurant · Corrective Action</div>
        </div>
      </div>

      <div className="container">
        <div className="checks-nav" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Link href="/home" className="muted nav-link" style={{ padding: '4px 8px' }}>
            <ChevronLeft size={16} /> Home
          </Link>
          <span className="muted" style={{ fontSize: 12 }}>/</span>
          <Link href="/actions" className="muted nav-link" style={{ padding: '4px 8px' }}>
            Restaurant actions
          </Link>
          <span className="muted" style={{ fontSize: 12 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Action #{action.id}</span>
        </div>

        <div className="checks-header">
          <div>
            <p className="eyebrow">CORRECTIVE ACTION & VERIFICATION</p>
            <h1>{action.title}</h1>
            <p className="muted">
              Complete the immediate and preventive correction, then submit for manager verification.
            </p>
          </div>
          <div className="check-progress-box">
            <strong>{action.status.replace(/_/g, ' ').toUpperCase()}</strong>
            <span className="muted">{action.severity.toUpperCase()} SEVERITY</span>
          </div>
        </div>

        {message && (
          <div
            className={`notice ${action.status === 'closed' ? 'good-notice' : 'info'}`}
            style={{ marginBottom: 20 }}
          >
            <CheckCircle2 size={18} />
            <div>{message}</div>
          </div>
        )}

        <div className="card action-detail-status" style={{ marginBottom: 24 }}>
          <div className={`icon-tile ${action.status === 'closed' ? 'good' : action.severity === 'critical' ? 'danger' : 'attention'}`}>
            {action.status === 'closed' ? <CheckCircle2 /> : <Wrench />}
          </div>
          <div style={{ flex: 1 }}>
            <span className="eyebrow">ALERT ORIGIN & STANDARD</span>
            <h2>Manager-confirmed food-safety alert</h2>
            <p className="muted" style={{ margin: '4px 0 8px' }}>{action.description}</p>
            <div className="action-meta">
              <span><Clock size={14} /> Created: {new Date(action.createdAt).toLocaleString()}</span>
              {action.closedAt && (
                <span><CheckCircle2 size={14} /> Closed: {new Date(action.closedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* FoodSafe Verified Service Partner Integration */}
        {action.status !== 'closed' && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0
              }}>
                {action.checkCode === 'FS28-08' ? '🎓' : action.checkCode === 'FS28-09' ? '🩺' : ['FS28-26', 'FS28-27'].includes(action.checkCode) ? '🪲' : ['FS28-19', 'FS28-20'].includes(action.checkCode) ? '❄️' : '✨'}
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a', display: 'block' }}>
                  {action.checkCode === 'FS28-08'
                    ? 'Need Accredited FoSTaC Food Safety Supervisor & Staff Training?'
                    : action.checkCode === 'FS28-09'
                    ? 'Need 6-Monthly Staff Medical Checkups, Form 1A Certificates & Stool Tests?'
                    : ['FS28-26', 'FS28-27'].includes(action.checkCode)
                    ? 'Need Urgent Professional Pest Control Eradication or Trap Servicing?'
                    : ['FS28-19', 'FS28-20'].includes(action.checkCode)
                    ? 'Need Commercial Refrigeration / Cold Room Breakdown Repair?'
                    : 'Need an accredited service partner to resolve this issue?'}
                </strong>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
                  Book on-demand FoodSafe verified providers with official compliance certificates for manager verification.
                </p>
              </div>
            </div>
            <Link
              href={`/providers?check=${action.checkCode}&actionId=${action.id}`}
              target="_blank"
              className="btn primary"
              style={{ background: '#059669', whiteSpace: 'nowrap', fontSize: 13, padding: '9px 16px' }}
            >
              Book Service Partner →
            </Link>
          </div>
        )}

        <div className="grid grid2">
          {/* STEP 1: RESTAURANT ACTION */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="stat" style={{ fontSize: 18, width: 28, height: 28, lineHeight: '28px' }}>1</div>
              <h2 style={{ margin: 0 }}>Restaurant Action</h2>
            </div>

            <label className="field">
              <span>Immediate containment action</span>
              <textarea
                className="input textarea"
                value={immediate}
                onChange={e => setImmediate(e.target.value)}
                disabled={!editable}
                placeholder="What did the team do immediately to contain the risk? (e.g. moved chilled food to backup unit, stopped service, discarded expired stock)"
              />
            </label>

            <label className="field">
              <span>Corrective action to prevent recurrence</span>
              <textarea
                className="input textarea"
                value={corrective}
                onChange={e => setCorrective(e.target.value)}
                disabled={!editable}
                placeholder="What permanent fix or operational adjustment was made? (e.g. repaired thermostat seal, retrained staff on handwashing, cleared drain obstruction)"
              />
            </label>

            <label className="field">
              <span>Root cause analysis (optional)</span>
              <textarea
                className="input textarea"
                value={root}
                onChange={e => setRoot(e.target.value)}
                disabled={!editable}
                placeholder="Why did the failure occur? (e.g. door left ajar during delivery, missing sanitiser dispenser refill)"
              />
            </label>

            {editable && (
              <button className="btn primary" onClick={submitAction} style={{ marginTop: 16 }}>
                Submit for Manager Verification <ShieldCheck size={17} />
              </button>
            )}

            {!editable && (
              <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
                {action.status === 'awaiting_verification'
                  ? 'Submitted and awaiting manager review in Step 2.'
                  : 'Action has been verified and closed.'}
              </p>
            )}
          </div>

          {/* STEP 2: MANAGER VERIFICATION */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="stat" style={{ fontSize: 18, width: 28, height: 28, lineHeight: '28px' }}>2</div>
              <h2 style={{ margin: 0 }}>Manager Verification</h2>
            </div>

            <p className="muted" style={{ marginTop: 0 }}>
              The manager independently verifies that the correction is effective and standard conditions have been restored before closing the issue.
            </p>

            <label className="field">
              <span>Manager verification note</span>
              <textarea
                className="input textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={action.status !== 'awaiting_verification'}
                placeholder={
                  action.status === 'awaiting_verification'
                    ? 'What did the manager inspect? (e.g. independently measured refrigerator core at 3.2°C; verified cleaning log)'
                    : 'Verification notes will be entered once the restaurant submits in Step 1.'
                }
              />
            </label>

            {action.status === 'awaiting_verification' && (
              <div style={{ marginTop: 16 }}>
                <p className="eyebrow" style={{ marginBottom: 8 }}>VERIFICATION DECISION</p>
                <div className="verification-grid">
                  <button className="answer good-answer" onClick={() => verify('pass')}>
                    <CheckCircle2 />
                    <span>Verified</span>
                    <small>Control restored — close alert</small>
                  </button>
                  <button className="answer issue-answer" onClick={() => verify('fail')}>
                    <AlertTriangle />
                    <span>Not verified</span>
                    <small>Reopen action for further correction</small>
                  </button>
                </div>
              </div>
            )}

            {action.status === 'closed' && (
              <div className="notice good-notice" style={{ marginTop: 16 }}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>Verified and closed</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    {action.verificationNote || 'Manager confirmed control was restored.'}
                  </p>
                </div>
              </div>
            )}

            {['open', 'in_progress'].includes(action.status) && (
              <div className="notice info" style={{ marginTop: 16 }}>
                <Clock size={18} />
                <div>
                  <strong>Awaiting restaurant correction</strong>
                  <p style={{ margin: '4px 0 0' }}>
                    The restaurant must complete Step 1 and submit for verification before the manager can verify.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <Link href="/actions" className="btn secondary">
            Back to Actions List
          </Link>
          <Link href="/manager" className="btn secondary">
            Manager Review
          </Link>
          <Link href="/records" className="btn secondary">
            View Audit Trail
          </Link>
        </div>
      </div>
    </main>
  );
}
