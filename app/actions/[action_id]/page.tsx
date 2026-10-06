'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  Home, 
  ShieldCheck, 
  Wrench, 
  Clock, 
  FileText,
  Calendar,
  Building2,
  User,
  Phone,
  ArrowRight,
  RefreshCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import {
  CorrectiveAction,
  Issue,
  AuditTrailEvent,
  AppPhase1State,
  PHASE1_STORAGE_KEY
} from '@/lib/foodsafety28';
import { 
  ServiceProvider, 
  ServiceRequest, 
  CONTROLLED_SERVICE_CATEGORIES,
  isExternalServiceRequired,
  inferServiceCategory
} from '@/lib/service-provider-contracts';

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

  // Service Provider Stage 3 states
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [handledInternally, setHandledInternally] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSentSuccess, setRequestSentSuccess] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  
  // Service Request form fields
  const [preferredDate, setPreferredDate] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  
  // Verification states
  const [confirmingService, setConfirmingService] = useState(false);
  const [showNeedsFurtherAction, setShowNeedsFurtherAction] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingService, setRejectingService] = useState(false);

  const fetchServiceRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/service-requests?correctiveActionId=${params.action_id}`, {
        headers: {
          'x-foodsafe-user-id': 'demo-user',
          'x-foodsafe-org-id': 'demo-org',
          'x-foodsafe-outlet-id': 'the-table',
          'x-foodsafe-role': 'manager'
        },
        cache: 'no-store'
      });
      const json = await res.json();
      if (res.ok && json.data && json.data.length > 0) {
        setServiceRequest(json.data[0]);
      }
    } catch (err) {
      console.warn('Could not fetch linked service request:', err);
    }
  }, [params.action_id]);

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
      } else {
        fetch(`/api/v1/actions/${params.action_id}`, { cache: 'no-store' })
          .then(res => res.ok ? res.json() : null)
          .then(json => {
            if (json?.data) {
              const act = json.data;
              setAction(act);
              setImmediate(act.immediateAction || '');
              setCorrective(act.correctiveAction || '');
              setRoot(act.rootCause || '');
            }
          })
          .catch(() => {});
      }
    };
    refresh();
    fetchServiceRequest();
    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, [params.action_id, fetchServiceRequest]);

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

        {/* SPRINT 23: CONTEXTUAL SERVICE PROVIDER WORKFLOW */}
        {action.status !== 'closed' && (
          <div style={{ marginBottom: 24 }}>
            {/* PROGRESSION STEPS DEFINITION */}
            {(() => {
              const PROGRESSION = [
                { key: 'requested', label: 'REQUESTED' },
                { key: 'accepted', label: 'ACCEPTED' },
                { key: 'in_progress', label: 'IN PROGRESS' },
                { key: 'completed', label: 'COMPLETED' },
                { key: 'verification_required', label: 'VERIFICATION REQUIRED' },
                { key: 'verified', label: 'VERIFIED' }
              ];

              const categoryKey = inferServiceCategory(action);
              const categoryLabel = CONTROLLED_SERVICE_CATEGORIES.find(c => c.id === categoryKey)?.label || categoryKey.replace(/_/g, ' ').toUpperCase();

              const getProgressStep = (status: string) => {
                if (status === 'restaurant_confirmed') return 5;
                if (status === 'completed') return 4;
                if (status === 'in_progress') return 2;
                if (status === 'accepted') return 1;
                return 0; // requested
              };

              const getPlainStatus = (status: string) => {
                switch (status) {
                  case 'accepted': return 'Accepted';
                  case 'in_progress': return 'Service in progress';
                  case 'completed': return 'Service completed — Ready for verification';
                  case 'restaurant_confirmed': return 'Verified';
                  case 'declined': return 'Declined';
                  case 'cancelled': return 'Cancelled';
                  case 'requested':
                  default: return 'Requested';
                }
              };

              if (serviceRequest) {
                const currentStepIdx = getProgressStep(serviceRequest.status);
                return (
                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 16,
                    padding: '22px 24px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    {/* CONFIRMATION BANNER IF JUST SUBMITTED */}
                    {requestSentSuccess && (
                      <div style={{
                        background: '#ecfdf5',
                        border: '1.5px solid #a7f3d0',
                        borderRadius: 10,
                        padding: '12px 16px',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10
                      }}>
                        <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <strong style={{ fontSize: 14, color: '#065f46', display: 'block' }}>
                            ✓ SERVICE REQUEST SENT
                          </strong>
                          <span style={{ fontSize: 13, color: '#047857' }}>
                            “Your request has been sent to an appropriate service provider.”
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STATUS CARD HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          SERVICE REQUEST
                        </span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 4px', color: '#0F172A' }}>
                          {categoryLabel}
                        </h3>
                        <div style={{ fontSize: 13.5, color: '#475569' }}>
                          Status: <strong style={{ color: serviceRequest.status === 'restaurant_confirmed' ? '#059669' : serviceRequest.status === 'completed' ? '#2563eb' : '#0F172A' }}>
                            {getPlainStatus(serviceRequest.status).toUpperCase()}
                          </strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <Link
                          href="/providers/dashboard"
                          target="_blank"
                          style={{
                            fontSize: 12,
                            color: '#059669',
                            textDecoration: 'none',
                            fontWeight: 700,
                            padding: '5px 10px',
                            background: '#ecfdf5',
                            borderRadius: 6,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          Provider Portal View →
                        </Link>
                      </div>
                    </div>

                    {/* DYNAMIC PROGRESSION BAR */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: 12,
                      padding: '14px 16px',
                      marginBottom: 16,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                        PROGRESSION
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        {PROGRESSION.map((step, idx) => {
                          const isCompleted = idx < currentStepIdx || (serviceRequest.status === 'restaurant_confirmed' && idx === 5);
                          const isCurrent = idx === currentStepIdx && serviceRequest.status !== 'restaurant_confirmed';
                          return (
                            <div key={step.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.03em',
                                background: isCurrent ? '#0284c7' : isCompleted ? '#ecfdf5' : '#ffffff',
                                color: isCurrent ? '#ffffff' : isCompleted ? '#065f46' : '#64748b',
                                border: isCurrent ? '1.5px solid #0284c7' : isCompleted ? '1.5px solid #a7f3d0' : '1px solid #cbd5e1'
                              }}>
                                {isCompleted && idx !== currentStepIdx ? '✓ ' : ''}{step.label}
                              </span>
                              {idx < PROGRESSION.length - 1 && (
                                <span style={{ color: idx < currentStepIdx ? '#059669' : '#cbd5e1', fontWeight: 900, fontSize: 11 }}>
                                  →
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PARTNER / REQUEST SUMMARY */}
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
                      <div>Partner: <strong style={{ color: '#0F172A' }}>{serviceRequest.providerName}</strong></div>
                      <div>Requested: <span>{new Date(serviceRequest.requestedAt).toLocaleDateString()}</span></div>
                      {serviceRequest.scheduledAt && <div>Preferred Service Date: <strong>{serviceRequest.scheduledAt}</strong></div>}
                      {serviceRequest.notes && <div>Outlet Note: <em>{serviceRequest.notes}</em></div>}
                    </div>

                    {/* RESTAURANT VERIFICATION SECTION */}
                    {serviceRequest.status === 'completed' && (
                      <div style={{
                        background: '#eff6ff',
                        border: '1.5px solid #93c5fd',
                        borderRadius: 12,
                        padding: '18px 22px',
                        marginTop: 14,
                        marginBottom: 16
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <CheckCircle2 size={22} color="#1d4ed8" />
                          <strong style={{ fontSize: 16, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            SERVICE COMPLETED
                          </strong>
                        </div>

                        <div style={{ fontSize: 13.5, color: '#1e293b', marginBottom: 12, lineHeight: 1.6 }}>
                          <div><strong>Service:</strong> {categoryLabel}</div>
                          <div><strong>Provider:</strong> {serviceRequest.providerName}</div>
                          <div><strong>Provider note:</strong> {serviceRequest.completionNotes || serviceRequest.notes || 'Treatment / repair completed as per standard procedure.'}</div>
                        </div>

                        {/* GOVERNANCE DISTINCTION NOTICE */}
                        <div style={{
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          color: '#92400e',
                          lineHeight: 1.45,
                          marginBottom: 14,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                          <span>
                            Service provider completion does not automatically mean the food-safety issue is verified.
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            onClick={async () => {
                              setConfirmingService(true);
                              try {
                                const res = await fetch(`/api/v1/service-requests/${serviceRequest.id}`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'x-foodsafe-user-id': 'demo-user',
                                    'x-foodsafe-role': 'manager',
                                    'x-foodsafe-outlet-id': 'the-table'
                                  },
                                  body: JSON.stringify({ status: 'restaurant_confirmed' })
                                });
                                const json = await res.json();
                                if (!res.ok) throw new Error(json?.error?.message || 'Confirmation failed');
                                
                                setServiceRequest(json.data);
                                
                                const now = new Date().toISOString();
                                const auditEvent: AuditTrailEvent = {
                                  id: `evt-srv-verify-${Date.now()}`,
                                  at: now,
                                  type: 'External service verified',
                                  detail: `External service completed by ${serviceRequest.providerName} verified and closed by Manager.`,
                                  status: 'closed'
                                };

                                const nextActions = (data.actions || []).map(a =>
                                  a.id === action.id ? {
                                    ...a,
                                    status: 'closed' as const,
                                    closedAt: now,
                                    verificationStatus: 'pass' as const,
                                    verificationNote: `Verified completion of service by ${serviceRequest.providerName}`
                                  } : a
                                );
                                const nextState = {
                                  ...data,
                                  actions: nextActions,
                                  timeline: [auditEvent, ...(data.timeline || [])]
                                };
                                saveState(nextState);
                                setData(nextState);
                                setAction(prev => prev ? {
                                  ...prev,
                                  status: 'closed',
                                  closedAt: now,
                                  verificationStatus: 'pass',
                                  verificationNote: `Verified completion of service by ${serviceRequest.providerName}`
                                } : null);
                                setMessage('✓ Service verified by restaurant manager. Food-safety corrective action closed.');
                              } catch (err: any) {
                                alert(err.message || 'Error verifying service');
                              } finally {
                                setConfirmingService(false);
                              }
                            }}
                            disabled={confirmingService}
                            style={{
                              padding: '12px 20px',
                              minHeight: 44,
                              background: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 800,
                              cursor: confirmingService ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8
                            }}
                          >
                            <CheckCircle2 size={16} />
                            {confirmingService ? 'Verifying...' : 'VERIFY COMPLETION'}
                          </button>

                          <button
                            onClick={() => setShowNeedsFurtherAction(!showNeedsFurtherAction)}
                            style={{
                              padding: '12px 18px',
                              minHeight: 44,
                              background: '#ffffff',
                              color: '#dc2626',
                              border: '1.5px solid #fca5a5',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8
                            }}
                          >
                            <AlertTriangle size={16} />
                            NEEDS FURTHER ACTION
                          </button>
                        </div>

                        {showNeedsFurtherAction && (
                          <div style={{ marginTop: 14, padding: 14, background: '#ffffff', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                              Please provide a short explanation: Why does this need further action?
                            </label>
                            <textarea
                              rows={2}
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              placeholder="e.g. Chiller still fluctuating above 8°C. Door gasket needs resealing."
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: 13,
                                boxSizing: 'border-box',
                                marginBottom: 10
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={async () => {
                                  if (!rejectionReason.trim()) {
                                    alert('Please enter a short explanation.');
                                    return;
                                  }
                                  setRejectingService(true);
                                  try {
                                    const res = await fetch(`/api/v1/service-requests/${serviceRequest.id}`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'x-foodsafe-user-id': 'demo-user',
                                        'x-foodsafe-role': 'manager',
                                        'x-foodsafe-outlet-id': 'the-table'
                                      },
                                      body: JSON.stringify({
                                        status: 'in_progress',
                                        notes: rejectionReason
                                      })
                                    });
                                    const json = await res.json();
                                    if (!res.ok) throw new Error(json?.error?.message || 'Failed to update request');

                                    setServiceRequest(json.data);
                                    const now = new Date().toISOString();
                                    const auditEvent: AuditTrailEvent = {
                                      id: `evt-srv-reopen-${Date.now()}`,
                                      at: now,
                                      type: 'Restaurant requested further action',
                                      detail: `External service returned for further action by Manager: "${rejectionReason}". Request returned to in-progress.`,
                                      status: 'in_progress'
                                    };

                                    const nextActions = (data.actions || []).map(a =>
                                      a.id === action.id ? { ...a, status: 'in_progress' as const } : a
                                    );
                                    const nextState = {
                                      ...data,
                                      actions: nextActions,
                                      timeline: [auditEvent, ...(data.timeline || [])]
                                    };
                                    saveState(nextState);
                                    setData(nextState);
                                    setAction(prev => prev ? { ...prev, status: 'in_progress' } : null);
                                    setShowNeedsFurtherAction(false);
                                    setMessage('Request returned to In Progress. Provider notified with your notes.');
                                  } catch (err: any) {
                                    alert(err.message || 'Error submitting explanation');
                                  } finally {
                                    setRejectingService(false);
                                  }
                                }}
                                disabled={rejectingService}
                                style={{
                                  padding: '10px 16px',
                                  background: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: rejectingService ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {rejectingService ? 'Submitting...' : 'Return to In Progress'}
                              </button>
                              <button
                                onClick={() => setShowNeedsFurtherAction(false)}
                                style={{
                                  padding: '10px 14px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: 6,
                                  fontSize: 13,
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* VERIFIED BANNER IF RESTAURANT CONFIRMED */}
                    {serviceRequest.status === 'restaurant_confirmed' && (
                      <div style={{
                        background: '#ecfdf5',
                        border: '1.5px solid #a7f3d0',
                        borderRadius: 10,
                        padding: '12px 16px',
                        marginTop: 12,
                        marginBottom: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}>
                        <CheckCircle2 size={20} color="#059669" />
                        <strong style={{ fontSize: 14, color: '#065f46' }}>
                          ✓ VERIFIED — Food safety corrective action confirmed and closed.
                        </strong>
                      </div>
                    )}

                    {/* SPRINT 23 SECTION 8: OPTIONAL READABLE AUDIT TRAIL */}
                    {serviceRequest.auditTrail && serviceRequest.auditTrail.length > 0 && (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                        <button
                          onClick={() => setShowActivity(!showActivity)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#059669',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <span>{showActivity ? 'HIDE ACTIVITY' : 'VIEW ACTIVITY'}</span>
                          <span style={{ fontSize: 11, background: '#ecfdf5', color: '#065f46', padding: '1px 6px', borderRadius: 10 }}>
                            {serviceRequest.auditTrail.length}
                          </span>
                        </button>

                        {showActivity && (
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {serviceRequest.auditTrail.map((entry, idx) => {
                              const d = new Date(entry.timestamp);
                              const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                              let desc = entry.action;
                              if (entry.status === 'requested') desc = `Restaurant requested ${categoryLabel.toLowerCase()}`;
                              else if (entry.status === 'accepted') desc = 'Provider accepted request';
                              else if (entry.status === 'in_progress') {
                                if (entry.notes && entry.notes.toLowerCase().includes('further action')) {
                                  desc = `Returned for further action: "${entry.notes}"`;
                                } else {
                                  desc = 'Service started';
                                }
                              } else if (entry.status === 'completed') {
                                desc = entry.notes ? `Service completed — "${entry.notes}"` : 'Service completed';
                              } else if (entry.status === 'restaurant_confirmed') {
                                desc = 'Restaurant verified completion';
                              }

                              return (
                                <div key={idx} style={{ fontSize: 12.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
                                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{dateStr}</span>
                                  <span>—</span>
                                  <span>{desc}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              if (isExternalServiceRequired(action)) {
                if (handledInternally) {
                  return (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10
                    }}>
                      <div style={{ fontSize: 13, color: '#475569' }}>
                        <strong>Notice:</strong> Handling internally without external service provider.
                      </div>
                      <button
                        onClick={() => {
                          setHandledInternally(false);
                          setShowRequestForm(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#059669',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Need external help? Get Service Help →
                      </button>
                    </div>
                  );
                }

                if (!showRequestForm) {
                  return (
                    <div style={{
                      background: '#ffffff',
                      border: '1.5px solid #f59e0b',
                      borderRadius: 16,
                      padding: '22px 24px',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <AlertTriangle size={20} color="#d97706" />
                        <span style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#b45309',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          EXTERNAL HELP MAY BE NEEDED
                        </span>
                      </div>

                      <p style={{ margin: '0 0 6px', fontSize: 14.5, color: '#0F172A', fontWeight: 600 }}>
                        Issue: <span style={{ fontWeight: 400, color: '#334155' }}>{action.description || action.title}</span>
                      </p>

                      <p style={{ margin: '0 0 18px', fontSize: 14, color: '#0F172A', fontWeight: 600 }}>
                        Recommended service: <span style={{
                          fontWeight: 700,
                          color: '#059669',
                          background: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: 6
                        }}>
                          {categoryLabel}
                        </span>
                      </p>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setShowRequestForm(true)}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 20px',
                            minHeight: 44,
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Wrench size={16} />
                          GET SERVICE HELP
                        </button>

                        <button
                          onClick={() => setHandledInternally(true)}
                          style={{
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 8,
                            padding: '12px 18px',
                            minHeight: 44,
                            fontSize: 13.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          HANDLE INTERNALLY
                        </button>
                      </div>
                    </div>
                  );
                }

                // SPRINT 23 SECTION 2: CREATE SERVICE REQUEST SCREEN
                return (
                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid #059669',
                    borderRadius: 16,
                    padding: '24px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          CREATE SERVICE REQUEST
                        </span>
                        <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                          Connect with Appropriate Service Partner
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowRequestForm(false)}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>

                    {/* EXISTING INFORMATION AUTOMATICALLY SHOWN (READ-ONLY) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 12,
                      marginBottom: 18,
                      background: '#f8fafc',
                      padding: 14,
                      borderRadius: 10,
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Outlet</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>ABC Restaurant - Bandra</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Issue</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{action.title}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Service Category</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#059669' }}>
                          {categoryLabel}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Priority</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: action.severity === 'critical' ? '#dc2626' : '#d97706', textTransform: 'uppercase' }}>
                          {action.severity || 'High'}
                        </div>
                      </div>
                    </div>

                    {/* ONLY ASK FOR: PREFERRED DATE/TIME & ADDITIONAL NOTE */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        Preferred Date / Time
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        Additional Note
                      </label>
                      <textarea
                        rows={3}
                        value={requestNotes}
                        onChange={e => setRequestNotes(e.target.value)}
                        placeholder="e.g. Access available via rear service lane before 11:30 AM lunch shift."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={async () => {
                          setSubmittingRequest(true);
                          try {
                            const res = await fetch('/api/v1/service-requests', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'x-foodsafe-user-id': 'demo-user',
                                'x-foodsafe-role': 'manager',
                                'x-foodsafe-outlet-id': 'the-table'
                              },
                              body: JSON.stringify({
                                correctiveActionId: action.id,
                                correctiveActionTitle: action.title,
                                serviceCategory: categoryKey,
                                problemDescription: action.description || action.title,
                                priority: action.severity === 'critical' ? 'urgent' : action.severity === 'high' ? 'high' : 'medium',
                                scheduledAt: preferredDate || undefined,
                                notes: requestNotes || undefined,
                                outletName: 'ABC Restaurant - Bandra',
                                outletCity: 'Mumbai'
                              })
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json?.error?.message || 'Failed to dispatch request');
                            setServiceRequest(json.data);
                            setShowRequestForm(false);
                            setRequestSentSuccess(true);
                          } catch (err: any) {
                            alert(err.message || 'Error submitting request');
                          } finally {
                            setSubmittingRequest(false);
                          }
                        }}
                        disabled={submittingRequest}
                        style={{
                          padding: '12px 24px',
                          minHeight: 44,
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: submittingRequest ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {submittingRequest ? 'Sending Request...' : 'SEND SERVICE REQUEST'}
                      </button>

                      <button
                        onClick={() => setShowRequestForm(false)}
                        style={{
                          padding: '12px 18px',
                          minHeight: 44,
                          background: '#f8fafc',
                          color: '#475569',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
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
