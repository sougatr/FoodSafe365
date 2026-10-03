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
  CONTROLLED_SERVICE_CATEGORIES 
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

function inferCategory(act: CorrectiveAction): string {
  if (act.serviceCategory) return act.serviceCategory;
  const code = act.checkCode || (act as any).sourceCheckCode || '';
  if (['FS28-26', 'FS28-27'].includes(code) || /pest/i.test(act.title + ' ' + act.description)) return 'pest_control';
  if (['FS28-19', 'FS28-20'].includes(code) || /refrig|chiller|freezer|cold/i.test(act.title + ' ' + act.description)) return 'refrigeration';
  if (['FS28-01', 'FS28-02', 'FS28-03', 'FS28-04'].includes(code) || /clean|grease|drain|exhaust/i.test(act.title + ' ' + act.description)) return 'deep_cleaning';
  if (['FS28-13', 'FS28-14'].includes(code) || /water|potability/i.test(act.title + ' ' + act.description)) return 'water_testing';
  if (['FS28-08'].includes(code) || /fostac|training/i.test(act.title + ' ' + act.description)) return 'training';
  if (['FS28-09'].includes(code) || /medical|health/i.test(act.title + ' ' + act.description)) return 'occupational_health';
  if (['FS28-21'].includes(code) || /calibrat/i.test(act.title + ' ' + act.description)) return 'calibration';
  return 'equipment';
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
  const [matchingProviders, setMatchingProviders] = useState<ServiceProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [confirmingService, setConfirmingService] = useState(false);

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

        {/* STAGE 3: CONTEXTUAL SERVICE PROVIDER WORKFLOW */}
        {action.status !== 'closed' && (
          <div style={{ marginBottom: 24 }}>
            {/* 1. IF ACTIVE SERVICE REQUEST EXISTS */}
            {serviceRequest ? (
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 16,
                padding: '20px 24px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        background: serviceRequest.status === 'restaurant_confirmed' ? '#ecfdf5' : serviceRequest.status === 'completed' ? '#eff6ff' : serviceRequest.status === 'in_progress' ? '#fff7ed' : '#fef3c7',
                        color: serviceRequest.status === 'restaurant_confirmed' ? '#065f46' : serviceRequest.status === 'completed' ? '#1d4ed8' : serviceRequest.status === 'in_progress' ? '#c2410c' : '#b45309',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 20,
                        textTransform: 'uppercase'
                      }}>
                        {serviceRequest.status === 'restaurant_confirmed'
                          ? '✅ Service Confirmed by Restaurant'
                          : serviceRequest.status === 'completed'
                          ? '🔵 Service Completed by Provider'
                          : serviceRequest.status === 'in_progress'
                          ? '🟠 Service In Progress'
                          : serviceRequest.status === 'accepted'
                          ? '🟢 Accepted by Provider'
                          : '🟡 Service Requested'}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Req #{serviceRequest.id}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 2px', color: '#0F172A' }}>
                      Assigned Partner: {serviceRequest.providerName}
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      Category: {serviceRequest.serviceCategory.replace(/_/g, ' ').toUpperCase()} · Requested: {new Date(serviceRequest.requestedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href="/providers/dashboard"
                    target="_blank"
                    style={{
                      fontSize: 12,
                      color: '#059669',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                      padding: '4px 8px',
                      background: '#ecfdf5',
                      borderRadius: 6
                    }}
                  >
                    Provider Portal View →
                  </Link>
                </div>

                {serviceRequest.notes && (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#334155',
                    marginBottom: 14
                  }}>
                    <strong>Remediation Notes:</strong> {serviceRequest.notes}
                  </div>
                )}

                {/* RESTAURANT CONFIRMATION PROMPT WHEN SERVICE IS COMPLETED */}
                {serviceRequest.status === 'completed' && (
                  <div style={{
                    background: '#eff6ff',
                    border: '1.5px solid #93c5fd',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginTop: 12,
                    marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <CheckCircle2 size={20} color="#1d4ed8" />
                      <strong style={{ fontSize: 15, color: '#1e3a8a' }}>
                        Service completed by {serviceRequest.providerName}. Please inspect and confirm on-site.
                      </strong>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#3b82f6', lineHeight: 1.5 }}>
                      Confirming external completion marks this service verified and automatically advances the corrective action to Manager Verification.
                    </p>
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
                          
                          // Advance action to awaiting_verification
                          const nextActions = (data.actions || []).map(a =>
                            a.id === action.id ? { ...a, status: 'awaiting_verification' as const } : a
                          );
                          const nextState = { ...data, actions: nextActions };
                          saveState(nextState);
                          setAction(prev => prev ? { ...prev, status: 'awaiting_verification' } : null);
                          setMessage('Service confirmed by restaurant. Ticket moved to Step 2: Manager Verification.');
                        } catch (err: any) {
                          alert(err.message || 'Error confirming service');
                        } finally {
                          setConfirmingService(false);
                        }
                      }}
                      disabled={confirmingService}
                      style={{
                        padding: '10px 18px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: confirmingService ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      {confirmingService ? 'Confirming...' : 'Confirm Service Work & Move to Verification'} <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* NON-NEGOTIABLE COMPLIANCE PRINCIPLE */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: '#64748b',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>FoodSafe365 Governance Principle:</strong> Service completion by an external partner does not equal food safety certification. An internal restaurant manager must inspect the premises and verify the correction in Step 2.
                  </span>
                </div>
              </div>
            ) : (
              /* 2. NO SERVICE REQUEST YET: CONTEXTUAL DISCOVERY */
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 16,
                padding: '20px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0
                    }}>
                      <Wrench size={22} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 16, color: '#0f172a', display: 'block' }}>
                        Need Professional Help? Find Relevant Service Providers
                      </strong>
                      <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
                        FoodSafe365 connects this corrective action directly to verified specialist providers for remediation.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!showDiscovery) {
                        setShowDiscovery(true);
                        setDiscoveryLoading(true);
                        const cat = inferCategory(action);
                        try {
                          const res = await fetch(`/api/v1/providers?category=${cat}&city=Mumbai`);
                          const json = await res.json();
                          if (res.ok && json.data) {
                            setMatchingProviders(json.data);
                            if (json.data.length > 0) {
                              setSelectedProviderId(json.data[0].id);
                            }
                          }
                        } catch (e) {
                          console.warn('Failed to load providers:', e);
                        } finally {
                          setDiscoveryLoading(false);
                        }
                      } else {
                        setShowDiscovery(false);
                      }
                    }}
                    style={{
                      background: showDiscovery ? '#f1f5f9' : '#059669',
                      color: showDiscovery ? '#334155' : '#ffffff',
                      border: showDiscovery ? '1px solid #cbd5e1' : 'none',
                      borderRadius: 8,
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {showDiscovery ? 'Close Provider Search' : `Find ${inferCategory(action).replace(/_/g, ' ').toUpperCase()} Partners →`}
                  </button>
                </div>

                {/* EXPANDABLE PROVIDER DISCOVERY PANEL */}
                {showDiscovery && (
                  <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>
                      Available FoodSafe365 Partners in Mumbai for "{inferCategory(action).replace(/_/g, ' ')}"
                    </h4>

                    {discoveryLoading ? (
                      <p className="muted" style={{ fontSize: 13 }}>Searching verified providers...</p>
                    ) : matchingProviders.length === 0 ? (
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#64748b' }}>
                        No specific providers currently registered in this city for this category. You may still register an external agency or assign internal staff.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                        {matchingProviders.map(p => {
                          const isSelected = selectedProviderId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedProviderId(p.id)}
                              style={{
                                padding: '14px 16px',
                                borderRadius: 10,
                                border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                                background: isSelected ? '#ecfdf5' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <strong style={{ fontSize: 14, color: '#0f172a' }}>{p.businessName}</strong>
                                  <span style={{ fontSize: 11, background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: 4 }}>
                                    {p.city}
                                  </span>
                                </div>
                                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748b' }}>
                                  {p.description}
                                </p>
                              </div>

                              <input
                                type="radio"
                                name="selected_provider"
                                checked={isSelected}
                                onChange={() => setSelectedProviderId(p.id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {matchingProviders.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                              Preferred Service Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={preferredDate}
                              onChange={e => setPreferredDate(e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                              Additional Notes for Technician
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Please visit before 11 AM before lunch rush."
                              value={requestNotes}
                              onChange={e => setRequestNotes(e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            const p = matchingProviders.find(x => x.id === selectedProviderId);
                            if (!p) {
                              alert('Please select a service provider');
                              return;
                            }
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
                                  providerId: p.id,
                                  providerName: p.businessName,
                                  serviceCategory: inferCategory(action),
                                  problemDescription: action.description,
                                  notes: requestNotes,
                                  scheduledAt: preferredDate || undefined,
                                  outletName: 'ABC Restaurant',
                                  outletCity: 'Mumbai'
                                })
                              });
                              const json = await res.json();
                              if (!res.ok) throw new Error(json?.error?.message || 'Failed to dispatch request');
                              setServiceRequest(json.data);
                              setShowDiscovery(false);
                              setMessage(`Service request sent to ${p.businessName}. You can track status above.`);
                            } catch (err: any) {
                              alert(err.message || 'Error submitting request');
                            } finally {
                              setSubmittingRequest(false);
                            }
                          }}
                          disabled={submittingRequest || !selectedProviderId}
                          style={{
                            padding: '10px 18px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: submittingRequest ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {submittingRequest ? 'Dispatching Request...' : 'Send Service Request to Provider'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
