'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Play, 
  ShieldCheck, 
  ChevronRight, 
  Home, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  FileText,
  UserCheck,
  AlertTriangle,
  User,
  Phone,
  X
} from 'lucide-react';
import { ServiceRequest, CONTROLLED_SERVICE_CATEGORIES } from '@/lib/service-provider-contracts';

export default function ProviderDashboardPage() {
  const [provider, setProvider] = useState<any>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'in_progress' | 'completed'>('new');
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [followUpDates, setFollowUpDates] = useState<Record<string, string>>({});
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [message, setMessage] = useState<{ type: 'good' | 'error'; text: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/v1/service-requests', {
        credentials: 'same-origin',
        cache: 'no-store'
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setAuthStatus('unauthenticated');
        setErrorMessage('Authentication required. Your session has expired or you are not signed in as a service partner.');
        setRequests([]);
        return;
      }
      if (res.status === 403) {
        setAuthStatus('forbidden');
        setErrorMessage('Access denied. A verified service provider account is required to view this portal.');
        setRequests([]);
        return;
      }
      if (!res.ok) {
        setAuthStatus('error');
        setErrorMessage(json?.error?.message || 'Failed to retrieve service requests');
        setRequests([]);
        return;
      }

      setAuthStatus('authenticated');
      const data: ServiceRequest[] = json.data || [];
      setRequests(data);

      if (data.length > 0) {
        const first = data[0];
        setProvider((prev: any) => ({
          ...(prev || {}),
          id: first.providerId,
          businessName: first.providerName || prev?.businessName || 'Service Partner Agency',
          city: first.outletCity || prev?.city || 'Mumbai'
        }));
      }
    } catch (err: any) {
      console.error('Error fetching provider requests:', err);
      setAuthStatus('error');
      setErrorMessage(err.message || 'Network error occurred while fetching service requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('foodsafe365_provider');
      if (stored) {
        setProvider(JSON.parse(stored));
      }
    } catch {}
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusUpdate = async (id: string, newStatus: string, notes?: string) => {
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/service-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ status: newStatus, notes })
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setMessage({ type: 'error', text: 'Your session has expired. Please sign in again.' });
        setAuthStatus('unauthenticated');
        return;
      }
      if (res.status === 403) {
        setMessage({ type: 'error', text: 'Permission denied: This service request cannot be modified by your account.' });
        return;
      }
      if (!res.ok) {
        throw new Error(json?.error?.message || 'Failed to update request status');
      }

      setMessage({
        type: 'good',
        text: `Request updated to "${newStatus.replace(/_/g, ' ')}" successfully.`
      });

      await fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Status transition failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const newRequests = requests.filter(r => r.status === 'requested');
  const inProgressRequests = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'restaurant_confirmed' || r.status === 'declined');

  const switchProvider = async (id: string, name: string) => {
    const p = {
      id,
      businessName: name,
      contactName: 'Service Agent',
      city: 'Mumbai',
      categories: ['pest_control', 'refrigeration', 'deep_cleaning'],
      verificationStatus: 'unverified'
    };
    setProvider(p);
    try {
      localStorage.setItem('foodsafe365_provider', JSON.stringify(p));
      await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: `${id}@partner.example.com`, password: 'partner123', role: 'provider' })
      });
    } catch {}
    await fetchRequests();
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F7F8F5', color: '#0F172A', paddingBottom: 60 }}>
      {/* Topbar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
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
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>FoodSafe365</span>
          </Link>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{
            background: '#ecfdf5',
            color: '#065f46',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <ShieldCheck size={14} /> Service Provider Portal
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Active Profile: <strong>{authStatus === 'unauthenticated' ? 'Not Signed In' : (provider?.businessName || requests[0]?.providerName || 'Service Partner Agency')}</strong>
          </div>

          {authStatus === 'unauthenticated' ? (
            <Link
              href="/login?role=provider&redirect=/providers/dashboard"
              style={{
                fontSize: 12,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '6px 14px',
                background: '#059669',
                borderRadius: 6,
                fontWeight: 700
              }}
            >
              Sign In
            </Link>
          ) : (
            <Link
              href="/login?role=provider&redirect=/providers/dashboard"
              style={{
                fontSize: 12,
                color: '#475569',
                textDecoration: 'none',
                padding: '6px 10px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontWeight: 600
              }}
            >
              Switch Account
            </Link>
          )}

          <select
            aria-label="Switch active demo provider profile"
            value={provider?.id || ''}
            onChange={e => {
              if (e.target.value === 'prov-pest-apex') switchProvider('prov-pest-apex', 'Apex Commercial Pest Control');
              if (e.target.value === 'prov-refrig-frost') switchProvider('prov-refrig-frost', 'FrostLine Chillers');
              if (e.target.value === 'prov-clean-ecoclean') switchProvider('prov-clean-ecoclean', 'EcoClean Sanitation');
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 12,
              background: '#fff',
              color: '#334155'
            }}
          >
            <option value="prov-pest-apex">Apex Commercial Pest Control</option>
            <option value="prov-refrig-frost">FrostLine Chillers & Cold Chain</option>
            <option value="prov-clean-ecoclean">EcoClean Kitchen Sanitation</option>
          </select>

          <Link
            href="/onboarding/provider"
            style={{
              fontSize: 12,
              color: '#059669',
              textDecoration: 'none',
              padding: '6px 10px',
              background: '#ecfdf5',
              borderRadius: 6,
              fontWeight: 600
            }}
          >
            + Register New Agency
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '28px auto 0', padding: '0 20px' }}>
        {/* Banner */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SERVICE PROVIDER PORTAL
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: '2px 0 6px', color: '#0F172A' }}>
              SERVICE REQUESTS
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>
              FoodSafe365 Service Partner Workspace. Manage incoming corrective action requests from restaurants. Marking a service as completed notifies the restaurant manager to inspect the work on-site and independently verify compliance.
            </p>
          </div>
          <button
            onClick={() => fetchRequests()}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#334155',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {message && (
          <div style={{
            background: message.type === 'good' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${message.type === 'good' ? '#a7f3d0' : '#fecaca'}`,
            color: message.type === 'good' ? '#065f46' : '#991b1b',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13
          }}>
            {message.type === 'good' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Session Recovery / Permission Denial States */}
        {authStatus === 'unauthenticated' ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #fed7aa',
            padding: '36px 28px',
            textAlign: 'center',
            marginBottom: 24,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#0F172A' }}>
              Service Partner Authentication Required
            </h2>
            <p style={{ margin: '0 auto 20px', fontSize: 14, color: '#64748b', maxWidth: 480, lineHeight: 1.5 }}>
              Your session has expired or you are not currently signed in. Please sign in with your authorized service provider credentials to access incoming job tickets.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                href="/login?role=provider&redirect=/providers/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: '#059669',
                  color: '#ffffff',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none'
                }}
              >
                Sign In as Service Partner
              </Link>
              <button
                type="button"
                onClick={() => fetchRequests()}
                style={{
                  padding: '10px 18px',
                  background: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : authStatus === 'forbidden' ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1.5px solid #fecaca',
            padding: '36px 28px',
            textAlign: 'center',
            marginBottom: 24,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <XCircle size={28} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#0F172A' }}>
              Partner Role Access Denied
            </h2>
            <p style={{ margin: '0 auto 20px', fontSize: 14, color: '#64748b', maxWidth: 480, lineHeight: 1.5 }}>
              Your current session does not have service partner permissions (or belongs to another business journey). To manage partner service requests, please switch to a verified service provider account.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                href="/login?role=provider&redirect=/providers/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: '#0f172a',
                  color: '#ffffff',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none'
                }}
              >
                Switch to Partner Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            {authStatus === 'error' && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 10,
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchRequests()}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* SPRINT 23: 3 CLEAN TABS */}
        <div style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 24,
          paddingBottom: 4,
          overflowX: 'auto'
        }}>
          {[
            { id: 'new', label: 'New Requests', count: newRequests.length },
            { id: 'in_progress', label: 'In Progress', count: inProgressRequests.length },
            { id: 'completed', label: 'Completed', count: completedRequests.length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  color: isActive ? '#059669' : '#64748b',
                  borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
                <span style={{
                  background: isActive ? '#ecfdf5' : '#f1f5f9',
                  color: isActive ? '#059669' : '#64748b',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Loading service requests...
          </div>
        ) : (
          <div>
            {/* HELPER CARD RENDERER */}
            {(() => {
              const currentList =
                activeTab === 'new'
                  ? newRequests
                  : activeTab === 'in_progress'
                  ? inProgressRequests
                  : completedRequests;

              if (currentList.length === 0) {
                return (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    border: '1px dashed #cbd5e1',
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <Building2 size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: '0 0 6px', color: '#1e293b' }}>
                      No {activeTab === 'new' ? 'new' : activeTab === 'in_progress' ? 'in-progress' : 'completed'} requests
                    </h3>
                    <p style={{ margin: 0, fontSize: 13.5 }}>
                      {activeTab === 'new' && 'When a food business requires specialized external service, new requests will appear here.'}
                      {activeTab === 'in_progress' && 'Requests accepted or currently underway appear here. Once work is done, mark completed with notes.'}
                      {activeTab === 'completed' && 'Completed requests and restaurant-verified history will appear here.'}
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentList.map(req => {
                    const categoryLabel = CONTROLLED_SERVICE_CATEGORIES.find(c => c.id === req.serviceCategory)?.label || req.serviceCategory.replace(/_/g, ' ').toUpperCase();
                    const priorityLabel = (req.priority || 'High').toUpperCase();

                    return (
                      <div
                        key={req.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 14,
                          border: '1.5px solid #e2e8f0',
                          padding: '20px 24px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            {/* Restaurant / Outlet */}
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                              Restaurant / Outlet
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 2px', color: '#0F172A' }}>
                              {req.outletName}
                            </h3>
                            <div style={{ fontSize: 13, color: '#64748b' }}>
                              {req.outletAddress || req.outletCity || 'Mumbai'}
                            </div>
                          </div>

                          {/* Priority */}
                          <div>
                            <span style={{
                              background: req.priority === 'urgent' || req.priority === 'critical' ? '#fee2e2' : req.priority === 'high' ? '#ffedd5' : '#f1f5f9',
                              color: req.priority === 'urgent' || req.priority === 'critical' ? '#dc2626' : req.priority === 'high' ? '#c2410c' : '#475569',
                              fontSize: 12,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 6,
                              textTransform: 'uppercase'
                            }}>
                              Priority: {priorityLabel}
                            </span>
                          </div>
                        </div>

                        {/* Service Category & Issue */}
                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
                            Service Category: <span>{categoryLabel}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                            Issue: <span>{req.correctiveActionTitle}</span>
                          </div>
                          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.45 }}>
                            {req.problemDescription}
                          </div>
                        </div>

                        {/* Requested date and VIEW REQUEST button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
                          <div style={{ fontSize: 13, color: '#64748b' }}>
                            <span>Requested date: <strong style={{ color: '#0F172A' }}>{new Date(req.requestedAt).toLocaleDateString()}</strong></span>
                            {req.scheduledAt && <span style={{ marginLeft: 12 }}>Preferred: <strong>{req.scheduledAt}</strong></span>}
                          </div>

                          <button
                            onClick={() => setSelectedRequest(req)}
                            style={{
                              padding: '10px 20px',
                              minHeight: 44,
                              borderRadius: 8,
                              background: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: 13.5,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <span>VIEW REQUEST</span>
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* SPRINT 23 SECTION 5: PROVIDER REQUEST DETAIL MODAL */}
            {selectedRequest && (
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
                onClick={() => setSelectedRequest(null)}
              >
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    maxWidth: 600,
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '24px 26px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', textTransform: 'uppercase' }}>
                        {selectedRequest.status === 'completed' ? 'Ready for verification' : selectedRequest.status === 'restaurant_confirmed' ? 'Verified' : selectedRequest.status === 'in_progress' ? 'Service in progress' : selectedRequest.status === 'accepted' ? 'Accepted' : 'Requested'}
                      </span>
                      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', color: '#0F172A' }}>
                        {selectedRequest.outletName}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                    {/* 1. WHAT IS NEEDED */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        WHAT IS NEEDED
                      </span>
                      <strong style={{ fontSize: 14.5, color: '#0F172A', display: 'block', marginBottom: 4 }}>
                        {selectedRequest.correctiveActionTitle}
                      </strong>
                      <p style={{ margin: 0, fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>
                        {selectedRequest.problemDescription}
                      </p>
                    </div>

                    {/* 2. WHERE */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        WHERE
                      </span>
                      <p style={{ margin: 0, fontSize: 13.5, color: '#334155', fontWeight: 600 }}>
                        {selectedRequest.outletName}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                        {selectedRequest.outletAddress || selectedRequest.outletCity || 'Mumbai'}
                      </p>
                    </div>

                    {/* 3. WHEN */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        WHEN
                      </span>
                      <div style={{ fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div>Requested Date: <strong>{new Date(selectedRequest.requestedAt).toLocaleString()}</strong></div>
                        {selectedRequest.scheduledAt && (
                          <div>Preferred Service Date: <strong>{selectedRequest.scheduledAt}</strong></div>
                        )}
                        {selectedRequest.completedAt && (
                          <div>Completed Date: <strong>{new Date(selectedRequest.completedAt).toLocaleString()}</strong></div>
                        )}
                      </div>
                    </div>

                    {/* 4. PRIORITY */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        PRIORITY
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: selectedRequest.priority === 'urgent' || selectedRequest.priority === 'critical' ? '#dc2626' : '#d97706'
                      }}>
                        {selectedRequest.priority ? selectedRequest.priority.toUpperCase() : 'HIGH'}
                      </span>
                    </div>

                    {/* 5. ADDITIONAL INFORMATION */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        ADDITIONAL INFORMATION
                      </span>
                      <div style={{ fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>Service Category: <strong>{CONTROLLED_SERVICE_CATEGORIES.find(c => c.id === selectedRequest.serviceCategory)?.label || selectedRequest.serviceCategory.replace(/_/g, ' ').toUpperCase()}</strong></div>
                        {selectedRequest.contactPerson && (
                          <div>Contact Person: <strong>{selectedRequest.contactPerson}</strong> ({selectedRequest.contactPhone || 'Phone on file'})</div>
                        )}
                        {selectedRequest.notes && (
                          <div>Outlet Instructions: <em>{selectedRequest.notes}</em></div>
                        )}
                        {selectedRequest.rejectionNotes && (
                          <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#b91c1c' }}>
                            <strong>Returned for Further Action:</strong> {selectedRequest.rejectionNotes}
                          </div>
                        )}
                        {selectedRequest.completionNotes && (
                          <div style={{ padding: '8px 10px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 6, color: '#065f46' }}>
                            <strong>Completion Notes:</strong> {selectedRequest.completionNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* OPTIONAL READABLE AUDIT TRAIL */}
                    {selectedRequest.auditTrail && selectedRequest.auditTrail.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                          ACTIVITY HISTORY
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {selectedRequest.auditTrail.map((entry, idx) => {
                            const d = new Date(entry.timestamp);
                            const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                            let desc = entry.action;
                            if (entry.status === 'requested') desc = 'Restaurant requested service';
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
                              <div key={idx} style={{ fontSize: 12, color: '#475569' }}>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{dateStr}</span> — {desc}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SPRINT 23 ACTIONS INSIDE MODAL */}
                  <div style={{ paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
                    {selectedRequest.status === 'requested' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={async () => {
                            await handleStatusUpdate(selectedRequest.id, 'accepted');
                            setSelectedRequest(null);
                          }}
                          disabled={actionLoading === selectedRequest.id}
                          style={{
                            flex: 1,
                            padding: '12px 20px',
                            minHeight: 44,
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ACCEPT REQUEST
                        </button>
                        <button
                          onClick={async () => {
                            await handleStatusUpdate(selectedRequest.id, 'declined');
                            setSelectedRequest(null);
                          }}
                          disabled={actionLoading === selectedRequest.id}
                          style={{
                            padding: '12px 18px',
                            minHeight: 44,
                            background: '#ffffff',
                            color: '#dc2626',
                            border: '1.5px solid #fca5a5',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          DECLINE
                        </button>
                      </div>
                    )}

                    {selectedRequest.status === 'accepted' && (
                      <button
                        onClick={async () => {
                          await handleStatusUpdate(selectedRequest.id, 'in_progress');
                          setSelectedRequest(null);
                        }}
                        disabled={actionLoading === selectedRequest.id}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          minHeight: 44,
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8
                        }}
                      >
                        <Play size={16} />
                        START SERVICE
                      </button>
                    )}

                    {selectedRequest.status === 'in_progress' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            Completion note (Mandatory) *
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Describe actions taken, replaced parts, chemicals applied, or test results..."
                            value={completionNotes[selectedRequest.id] || ''}
                            onChange={e => setCompletionNotes({ ...completionNotes, [selectedRequest.id]: e.target.value })}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, boxSizing: 'border-box' }}
                          />
                        </div>

                        <button
                          onClick={async () => {
                            const note = completionNotes[selectedRequest.id]?.trim();
                            if (!note) {
                              alert('Please enter a completion note before marking service completed.');
                              return;
                            }
                            await handleStatusUpdate(selectedRequest.id, 'completed', note);
                            setSelectedRequest(null);
                          }}
                          disabled={actionLoading === selectedRequest.id}
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            minHeight: 44,
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          MARK SERVICE COMPLETED
                        </button>
                      </div>
                    )}

                    {(selectedRequest.status === 'completed' || selectedRequest.status === 'restaurant_confirmed') && (
                      <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13.5, color: '#059669', fontWeight: 700 }}>
                        {selectedRequest.status === 'restaurant_confirmed'
                          ? '✓ Verified on-site and closed by restaurant manager.'
                          : '🔵 Service completed. Ready for restaurant verification.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </main>
  );
}
