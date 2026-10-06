'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Search,
  Filter,
  Check,
  AlertCircle,
  X,
  Play
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import {
  CONTROLLED_SERVICE_CATEGORIES,
  isExternalServiceRequired,
  inferServiceCategory,
  ServiceRequest
} from '@/lib/service-provider-contracts';

interface ActionItem {
  id: string;
  outletId?: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: 'open' | 'in_progress' | 'awaiting_verification' | 'closed';
  dueDate?: string;
  assignedTo?: string;
  responsiblePerson?: string;
  requiresExternalService?: boolean;
  serviceCategory?: string;
  createdAt: string;
}

export default function GroceryActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // SPRINT 23: Service Provider integration states
  const [serviceRequests, setServiceRequests] = useState<Record<string, ServiceRequest>>({});
  const [activeRequestModal, setActiveRequestModal] = useState<ActionItem | null>(null);
  const [handledInternallyIds, setHandledInternallyIds] = useState<Record<string, boolean>>({});
  const [preferredDate, setPreferredDate] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessActionId, setRequestSuccessActionId] = useState<string | null>(null);
  const [rejectionActionId, setRejectionActionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showActivityIds, setShowActivityIds] = useState<Record<string, boolean>>({});

  const fetchActions = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch(`/api/v1/actions?outletId=${encodeURIComponent(outletId)}`);
      const json = await res.json();
      if (res.ok) {
        const list = json.data?.actions || json.actions || [];
        setActions(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }
      const res = await fetch(`/api/v1/service-requests?outletId=${encodeURIComponent(outletId)}`, {
        headers: {
          'x-foodsafe-user-id': 'demo-grocery-user',
          'x-foodsafe-org-id': 'demo-org',
          'x-foodsafe-outlet-id': outletId,
          'x-foodsafe-role': 'manager'
        }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const map: Record<string, ServiceRequest> = {};
        for (const req of json.data) {
          if (req.correctiveActionId) {
            map[req.correctiveActionId] = req;
          }
        }
        setServiceRequests(map);
      }
    } catch (e) {
      console.warn('Could not load service requests for grocery store:', e);
    }
  };

  useEffect(() => {
    fetchActions();
    fetchServiceRequests();
  }, []);

  const handleUpdateStatus = async (actionId: string, newStatus: string) => {
    setUpdatingId(actionId);
    try {
      const res = await fetch(`/api/v1/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchActions();
      } else {
        alert('Failed to update action status');
      }
    } catch (e) {
      alert('Error updating action');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'ALL'
    ? actions
    : actions.filter(a => a.status === filter);

  const openCount = actions.filter(a => a.status === 'open').length;
  const inProgressCount = actions.filter(a => a.status === 'in_progress').length;
  const verifyCount = actions.filter(a => a.status === 'awaiting_verification').length;
  const closedCount = actions.filter(a => a.status === 'closed').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', padding: '24px 20px 48px', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            CORRECTIVE ACTION &amp; VERIFICATION
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Grocery Food Safety Actions
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#64748B' }}>
            Issues identified during daily checks, temperature audits, and receiving inspections.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 20
        }}>
          {[
            { key: 'ALL', label: `All (${actions.length})` },
            { key: 'open', label: `Needs Attention (${openCount})` },
            { key: 'in_progress', label: `Being Fixed (${inProgressCount})` },
            { key: 'awaiting_verification', label: `Verification Needed (${verifyCount})` },
            { key: 'closed', label: `Verified (${closedCount})` }
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: filter === t.key ? '2px solid #059669' : '1px solid #CBD5E1',
                background: filter === t.key ? '#059669' : '#ffffff',
                color: filter === t.key ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Action Items List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            Loading store actions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1.5px dashed #CBD5E1',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              No Open Issues in this View
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#64748B' }}>
              All daily food safety checks, receiving deliveries, and temperature readings are in order.
            </p>
            <Link
              href="/grocery/daily-check"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>Run Daily Check</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(a => {
              const isOpen = a.status === 'open';
              const isInProgress = a.status === 'in_progress';
              const isAwaiting = a.status === 'awaiting_verification';
              const isClosed = a.status === 'closed';

              return (
                <div
                  key={a.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 16,
                    padding: '20px 22px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: isOpen ? 'rgba(239, 68, 68, 0.12)' : isInProgress ? 'rgba(245, 158, 11, 0.12)' : isAwaiting ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          color: isOpen ? '#dc2626' : isInProgress ? '#d97706' : isAwaiting ? '#2563eb' : '#059669'
                        }}>
                          {isOpen ? 'Needs Attention' : isInProgress ? 'Being Fixed' : isAwaiting ? 'Verification Needed' : 'Verified OK'}
                        </span>
                        {a.priority === 'critical' || a.priority === 'high' ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>
                            🔥 High Priority
                          </span>
                        ) : null}
                      </div>

                      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                        {a.title}
                      </h3>
                      <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                        {a.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {isOpen && (
                        <button
                          type="button"
                          disabled={updatingId === a.id}
                          onClick={() => handleUpdateStatus(a.id, 'in_progress')}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          Start Fix →
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          type="button"
                          disabled={updatingId === a.id}
                          onClick={() => handleUpdateStatus(a.id, 'awaiting_verification')}
                          style={{
                            background: '#d97706',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          Mark Fixed (Submit for Verify) →
                        </button>
                      )}

                      {isAwaiting && (
                        <button
                          type="button"
                          disabled={updatingId === a.id}
                          onClick={() => handleUpdateStatus(a.id, 'closed')}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <Check size={14} />
                          <span>Manager Verify &amp; Close</span>
                        </button>
                      )}

                      {a.requiresExternalService && !isClosed && (
                        <Link
                          href={`/providers?category=${encodeURIComponent(a.serviceCategory || '')}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#2563eb',
                            borderRadius: 8,
                            padding: '7px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <Wrench size={13} />
                          <span>Find {a.serviceCategory || 'Service'} Partner</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* SPRINT 23: CONTEXTUAL SERVICE PROVIDER WORKFLOW */}
                  {isExternalServiceRequired(a) && !isClosed && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                      {(() => {
                        const sReq = serviceRequests[a.id];
                        const categoryKey = inferServiceCategory(a);
                        const categoryLabel = CONTROLLED_SERVICE_CATEGORIES.find(c => c.id === categoryKey)?.label || categoryKey.replace(/_/g, ' ').toUpperCase();

                        const PROGRESSION = [
                          { key: 'requested', label: 'REQUESTED' },
                          { key: 'accepted', label: 'ACCEPTED' },
                          { key: 'in_progress', label: 'IN PROGRESS' },
                          { key: 'completed', label: 'COMPLETED' },
                          { key: 'verification_required', label: 'VERIFICATION REQUIRED' },
                          { key: 'verified', label: 'VERIFIED' }
                        ];

                        const getProgressStep = (status: string) => {
                          if (status === 'restaurant_confirmed') return 5;
                          if (status === 'completed') return 4;
                          if (status === 'in_progress') return 2;
                          if (status === 'accepted') return 1;
                          return 0;
                        };

                        const getPlainStatus = (status: string) => {
                          switch (status) {
                            case 'accepted': return 'Accepted';
                            case 'in_progress': return 'Service in progress';
                            case 'completed': return 'Service completed — Ready for verification';
                            case 'restaurant_confirmed': return 'Verified';
                            case 'requested':
                            default: return 'Requested';
                          }
                        };

                        if (sReq) {
                          const currentStepIdx = getProgressStep(sReq.status);
                          return (
                            <div style={{
                              background: '#ffffff',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: 12,
                              padding: '16px 18px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                              {requestSuccessActionId === a.id && (
                                <div style={{
                                  background: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: 8,
                                  padding: '10px 14px',
                                  marginBottom: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  fontSize: 13,
                                  color: '#065f46'
                                }}>
                                  <CheckCircle2 size={18} color="#059669" />
                                  <span><strong>✓ SERVICE REQUEST SENT</strong> — “Your request has been sent to an appropriate service provider.”</span>
                                </div>
                              )}

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                                <div>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    SERVICE REQUEST
                                  </span>
                                  <h4 style={{ fontSize: 15.5, fontWeight: 800, margin: '2px 0', color: '#0F172A' }}>
                                    {categoryLabel}
                                  </h4>
                                  <div style={{ fontSize: 12.5, color: '#475569' }}>
                                    Status: <strong>{getPlainStatus(sReq.status).toUpperCase()}</strong>
                                  </div>
                                </div>

                                <Link
                                  href="/providers/dashboard"
                                  target="_blank"
                                  style={{ fontSize: 12, color: '#059669', textDecoration: 'none', fontWeight: 700 }}
                                >
                                  Provider Portal View →
                                </Link>
                              </div>

                              {/* DYNAMIC PROGRESSION BAR */}
                              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, margin: '10px 0', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                                  PROGRESSION
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5 }}>
                                  {PROGRESSION.map((step, idx) => {
                                    const isCompleted = idx < currentStepIdx || (sReq.status === 'restaurant_confirmed' && idx === 5);
                                    const isCurrent = idx === currentStepIdx && sReq.status !== 'restaurant_confirmed';
                                    return (
                                      <div key={step.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{
                                          padding: '3px 8px',
                                          borderRadius: 16,
                                          fontSize: 10.5,
                                          fontWeight: 800,
                                          background: isCurrent ? '#0284c7' : isCompleted ? '#ecfdf5' : '#ffffff',
                                          color: isCurrent ? '#ffffff' : isCompleted ? '#065f46' : '#64748b',
                                          border: isCurrent ? '1px solid #0284c7' : isCompleted ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                                        }}>
                                          {isCompleted && idx !== currentStepIdx ? '✓ ' : ''}{step.label}
                                        </span>
                                        {idx < PROGRESSION.length - 1 && (
                                          <span style={{ color: idx < currentStepIdx ? '#059669' : '#cbd5e1', fontWeight: 900, fontSize: 10 }}>
                                            →
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>
                                <div>Partner: <strong>{sReq.providerName}</strong> · Requested: {new Date(sReq.requestedAt).toLocaleDateString()}</div>
                                {sReq.notes && <div>Outlet Note: <em>{sReq.notes}</em></div>}
                              </div>

                              {/* RESTAURANT VERIFICATION SECTION */}
                              {sReq.status === 'completed' && (
                                <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: 10, padding: '14px 16px', margin: '10px 0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <CheckCircle2 size={18} color="#1d4ed8" />
                                    <strong style={{ fontSize: 14, color: '#1e3a8a', textTransform: 'uppercase' }}>
                                      SERVICE COMPLETED
                                    </strong>
                                  </div>
                                  <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 8 }}>
                                    <div><strong>Service:</strong> {categoryLabel}</div>
                                    <div><strong>Provider note:</strong> {sReq.completionNotes || sReq.notes || 'Service performed as required.'}</div>
                                  </div>

                                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#92400e', marginBottom: 10, fontWeight: 600 }}>
                                    ⚠️ Service provider completion does not automatically mean the food-safety issue is verified.
                                  </div>

                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`/api/v1/service-requests/${sReq.id}`, {
                                            method: 'PATCH',
                                            headers: {
                                              'Content-Type': 'application/json',
                                              'x-foodsafe-user-id': 'demo-grocery-user',
                                              'x-foodsafe-role': 'manager',
                                              'x-foodsafe-outlet-id': 'store-nature-basket-bandra'
                                            },
                                            body: JSON.stringify({ status: 'restaurant_confirmed' })
                                          });
                                          if (res.ok) {
                                            handleUpdateStatus(a.id, 'closed');
                                            fetchServiceRequests();
                                          }
                                        } catch {}
                                      }}
                                      style={{
                                        padding: '8px 16px',
                                        background: '#059669',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      VERIFY COMPLETION
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setRejectionActionId(rejectionActionId === a.id ? null : a.id)}
                                      style={{
                                        padding: '8px 14px',
                                        background: '#fff',
                                        color: '#dc2626',
                                        border: '1px solid #fca5a5',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      NEEDS FURTHER ACTION
                                    </button>
                                  </div>

                                  {rejectionActionId === a.id && (
                                    <div style={{ marginTop: 10, padding: 10, background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                                        Short explanation:
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="e.g. Chiller still fluctuating above safe limits..."
                                        style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box', marginBottom: 8 }}
                                      />
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (!rejectionReason.trim()) return;
                                            try {
                                              const res = await fetch(`/api/v1/service-requests/${sReq.id}`, {
                                                method: 'PATCH',
                                                headers: {
                                                  'Content-Type': 'application/json',
                                                  'x-foodsafe-user-id': 'demo-grocery-user',
                                                  'x-foodsafe-role': 'manager',
                                                  'x-foodsafe-outlet-id': 'store-nature-basket-bandra'
                                                },
                                                body: JSON.stringify({ status: 'in_progress', notes: rejectionReason })
                                              });
                                              if (res.ok) {
                                                setRejectionActionId(null);
                                                setRejectionReason('');
                                                fetchServiceRequests();
                                              }
                                            } catch {}
                                          }}
                                          style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                        >
                                          Return to In Progress
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRejectionActionId(null)}
                                          style={{ padding: '6px 10px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* AUDIT TRAIL */}
                              {sReq.auditTrail && sReq.auditTrail.length > 0 && (
                                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                                  <button
                                    type="button"
                                    onClick={() => setShowActivityIds(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                  >
                                    {showActivityIds[a.id] ? 'HIDE ACTIVITY' : 'VIEW ACTIVITY'} ({sReq.auditTrail.length})
                                  </button>
                                  {showActivityIds[a.id] && (
                                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      {sReq.auditTrail.map((entry, idx) => {
                                        const d = new Date(entry.timestamp);
                                        const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                        let desc = entry.action;
                                        if (entry.status === 'requested') desc = `Store requested ${categoryLabel.toLowerCase()}`;
                                        else if (entry.status === 'accepted') desc = 'Provider accepted request';
                                        else if (entry.status === 'in_progress') desc = entry.notes ? `Further action: "${entry.notes}"` : 'Service started';
                                        else if (entry.status === 'completed') desc = entry.notes ? `Service completed — "${entry.notes}"` : 'Service completed';
                                        else if (entry.status === 'restaurant_confirmed') desc = 'Store verified completion';

                                        return (
                                          <div key={idx} style={{ fontSize: 12, color: '#475569' }}>
                                            <span style={{ fontWeight: 700, color: '#0F172A' }}>{dateStr}</span> — {desc}
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

                        if (handledInternallyIds[a.id]) {
                          return (
                            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, fontSize: 12.5, color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Handling internally without external service provider.</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setHandledInternallyIds(prev => ({ ...prev, [a.id]: false }));
                                  setActiveRequestModal(a);
                                }}
                                style={{ background: 'none', border: 'none', color: '#059669', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                              >
                                Need external help? Get Service Help →
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div style={{ background: '#ffffff', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '14px 16px', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <AlertTriangle size={18} color="#d97706" />
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                                EXTERNAL HELP MAY BE NEEDED
                              </span>
                            </div>
                            <div style={{ fontSize: 13, color: '#0F172A', marginBottom: 2 }}>
                              Issue: <span style={{ color: '#475569' }}>{a.description || a.title}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#0F172A', marginBottom: 12 }}>
                              Recommended service: <span style={{ fontWeight: 700, color: '#059669' }}>{categoryLabel}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => setActiveRequestModal(a)}
                                style={{
                                  background: '#059669',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '9px 16px',
                                  fontSize: 13,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5
                                }}
                              >
                                <Wrench size={14} />
                                GET SERVICE HELP
                              </button>
                              <button
                                type="button"
                                onClick={() => setHandledInternallyIds(prev => ({ ...prev, [a.id]: true }))}
                                style={{
                                  background: '#f8fafc',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: 8,
                                  padding: '9px 14px',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                HANDLE INTERNALLY
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: 12,
                    color: '#64748B',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: 10,
                    marginTop: 10,
                    flexWrap: 'wrap'
                  }}>
                    <span>👤 Responsible: {a.responsiblePerson || a.assignedTo || 'Duty Supervisor'}</span>
                    {a.dueDate ? <span>📅 Due: {a.dueDate}</span> : null}
                    <span>⏱ Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SPRINT 23: SIMPLE CREATE SERVICE REQUEST MODAL FOR GROCERY */}
        {activeRequestModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16
            }}
            onClick={() => setActiveRequestModal(null)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                maxWidth: 580,
                width: '100%',
                padding: '24px 26px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    CREATE SERVICE REQUEST
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    Request External Service Provider
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRequestModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Existing information shown automatically */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 16,
                background: '#f8fafc',
                padding: 14,
                borderRadius: 10,
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Outlet</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Nature&apos;s Basket - Bandra</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Issue</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{activeRequestModal.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Service Category</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
                    {CONTROLLED_SERVICE_CATEGORIES.find(c => c.id === inferServiceCategory(activeRequestModal))?.label || inferServiceCategory(activeRequestModal).replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Priority</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: activeRequestModal.priority === 'critical' ? '#dc2626' : '#d97706', textTransform: 'uppercase' }}>
                    {activeRequestModal.priority || 'High'}
                  </div>
                </div>
              </div>

              {/* Inputs: Preferred date/time and Additional note */}
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
                  placeholder="e.g. Access available via delivery bay before morning replenishment."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={async () => {
                    setSubmittingRequest(true);
                    try {
                      const res = await fetch('/api/v1/service-requests', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-foodsafe-user-id': 'demo-grocery-user',
                          'x-foodsafe-role': 'manager',
                          'x-foodsafe-outlet-id': 'store-nature-basket-bandra'
                        },
                        body: JSON.stringify({
                          correctiveActionId: activeRequestModal.id,
                          correctiveActionTitle: activeRequestModal.title,
                          serviceCategory: inferServiceCategory(activeRequestModal),
                          problemDescription: activeRequestModal.description || activeRequestModal.title,
                          priority: activeRequestModal.priority || 'high',
                          scheduledAt: preferredDate || undefined,
                          notes: requestNotes || undefined,
                          outletName: "Nature's Basket - Bandra",
                          outletCity: 'Mumbai'
                        })
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json?.error?.message || 'Failed to dispatch request');
                      setServiceRequests(prev => ({ ...prev, [activeRequestModal.id]: json.data }));
                      setRequestSuccessActionId(activeRequestModal.id);
                      setActiveRequestModal(null);
                      setPreferredDate('');
                      setRequestNotes('');
                    } catch (err: any) {
                      alert(err.message || 'Error submitting request');
                    } finally {
                      setSubmittingRequest(false);
                    }
                  }}
                  disabled={submittingRequest}
                  style={{
                    padding: '12px 22px',
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
                  type="button"
                  onClick={() => setActiveRequestModal(null)}
                  style={{
                    padding: '12px 16px',
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
          </div>
        )}
      </main>
    </div>
  );
}
