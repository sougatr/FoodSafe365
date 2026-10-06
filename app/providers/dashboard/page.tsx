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
import { ServiceRequest } from '@/lib/service-provider-contracts';

export default function ProviderDashboardPage() {
  const [provider, setProvider] = useState<any>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'accepted' | 'in_progress' | 'completed'>('new');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [followUpDates, setFollowUpDates] = useState<Record<string, string>>({});
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [message, setMessage] = useState<{ type: 'good' | 'error'; text: string } | null>(null);

  // Initialize provider session
  useEffect(() => {
    let currentProvider: any = null;
    try {
      const stored = localStorage.getItem('foodsafe365_provider');
      if (stored) {
        currentProvider = JSON.parse(stored);
      }
    } catch {}

    if (!currentProvider) {
      // Default to standard seed provider for easy testing/demo
      currentProvider = {
        id: 'prov-pest-apex',
        businessName: 'Apex Commercial Pest Control',
        contactName: 'Sunil Verma',
        city: 'Mumbai',
        categories: ['pest_control'],
        verificationStatus: 'unverified'
      };
      localStorage.setItem('foodsafe365_provider', JSON.stringify(currentProvider));
      document.cookie = `fs_user_id=${currentProvider.id}; path=/; max-age=2592000`;
      document.cookie = `fs_role=vendor; path=/; max-age=2592000`;
      document.cookie = `fs_provider_id=${currentProvider.id}; path=/; max-age=2592000`;
    }

    setProvider(currentProvider);
  }, []);

  const fetchRequests = useCallback(async (providerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/service-requests?providerId=${providerId}`, {
        headers: {
          'x-foodsafe-user-id': providerId,
          'x-foodsafe-role': 'vendor',
          'x-foodsafe-provider-id': providerId
        },
        cache: 'no-store'
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error('Error fetching provider requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provider?.id) {
      fetchRequests(provider.id);
    }
  }, [provider, fetchRequests]);

  const handleStatusUpdate = async (id: string, newStatus: string, notes?: string) => {
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/service-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-foodsafe-user-id': provider.id,
          'x-foodsafe-role': 'vendor',
          'x-foodsafe-provider-id': provider.id
        },
        body: JSON.stringify({ status: newStatus, notes })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || 'Failed to update request status');
      }

      setMessage({
        type: 'good',
        text: `Request updated to "${newStatus.replace(/_/g, ' ')}" successfully.`
      });

      if (provider?.id) {
        await fetchRequests(provider.id);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Status transition failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const newRequests = requests.filter(r => r.status === 'requested');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const inProgressRequests = requests.filter(r => r.status === 'in_progress');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'restaurant_confirmed' || r.status === 'declined');

  const switchProvider = (id: string, name: string) => {
    const p = {
      id,
      businessName: name,
      contactName: 'Service Agent',
      city: 'Mumbai',
      categories: ['pest_control', 'refrigeration', 'deep_cleaning'],
      verificationStatus: 'unverified'
    };
    setProvider(p);
    localStorage.setItem('foodsafe365_provider', JSON.stringify(p));
    document.cookie = `fs_user_id=${id}; path=/; credentials=same-origin; max-age=2592000`;
    document.cookie = `fs_role=vendor; path=/; credentials=same-origin; max-age=2592000`;
    document.cookie = `fs_provider_id=${id}; path=/; credentials=same-origin; max-age=2592000`;
    fetchRequests(id);
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
            Active Profile: <strong>{provider?.businessName || 'Loading...'}</strong> ({provider?.city || 'Mumbai'})
          </div>

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
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
              {provider?.businessName} — Remediation Requests
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>
              FoodSafe365 Service Partner Workspace. Manage incoming corrective action requests from restaurants. Marking a service as completed notifies the restaurant manager to inspect the work on-site and independently verify compliance.
            </p>
          </div>
          <button
            onClick={() => provider?.id && fetchRequests(provider.id)}
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

        {/* 4 Clean Tabs */}
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
            { id: 'accepted', label: 'Accepted', count: acceptedRequests.length },
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
                  : activeTab === 'accepted'
                  ? acceptedRequests
                  : activeTab === 'in_progress'
                  ? inProgressRequests
                  : completedRequests;

              const getPriorityBadge = (p?: string) => {
                const norm = (p || 'medium').toLowerCase();
                if (norm === 'urgent' || norm === 'critical') {
                  return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Urgent' };
                }
                if (norm === 'high') {
                  return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'High' };
                }
                if (norm === 'medium') {
                  return { bg: '#fefce8', color: '#a16207', border: '#fef08a', label: 'Medium' };
                }
                return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Low' };
              };

              const getStatusBadge = (s: string) => {
                switch (s) {
                  case 'requested':
                    return { bg: '#fef3c7', color: '#b45309', label: 'Requested' };
                  case 'accepted':
                    return { bg: '#e0f2fe', color: '#0369a1', label: 'Accepted' };
                  case 'in_progress':
                    return { bg: '#ffedd5', color: '#c2410c', label: 'In Progress' };
                  case 'completed':
                    return { bg: '#eff6ff', color: '#1d4ed8', label: 'Completed (Verification Pending)' };
                  case 'restaurant_confirmed':
                    return { bg: '#ecfdf5', color: '#065f46', label: 'Verified & Closed' };
                  case 'declined':
                    return { bg: '#fef2f2', color: '#b91c1c', label: 'Declined' };
                  default:
                    return { bg: '#f1f5f9', color: '#475569', label: s.toUpperCase() };
                }
              };

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
                      No {activeTab.replace('_', ' ')} requests
                    </h3>
                    <p style={{ margin: 0, fontSize: 13.5 }}>
                      {activeTab === 'new' && 'When a food business requires specialized external service, new requests will appear here.'}
                      {activeTab === 'accepted' && 'Requests you have accepted will appear here until you start on-site service.'}
                      {activeTab === 'in_progress' && 'Work currently underway appears here. Once work is done, mark completed with notes.'}
                      {activeTab === 'completed' && 'Completed requests and restaurant-verified history will appear here.'}
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentList.map(req => {
                    const prio = getPriorityBadge(req.priority);
                    const stat = getStatusBadge(req.status);
                    const noteKey = req.id;

                    return (
                      <div
                        key={req.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 14,
                          border: '1.5px solid #e2e8f0',
                          padding: '20px 24px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease'
                        }}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                              <span style={{
                                background: stat.bg,
                                color: stat.color,
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 4,
                                textTransform: 'uppercase'
                              }}>
                                {stat.label}
                              </span>

                              <span style={{
                                background: prio.bg,
                                color: prio.color,
                                border: `1px solid ${prio.border}`,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: 4
                              }}>
                                {prio.label} Priority
                              </span>

                              <span style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 4
                              }}>
                                {req.serviceCategory.replace(/_/g, ' ').toUpperCase()}
                              </span>

                              <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                                Ref #{req.id}
                              </span>
                            </div>

                            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
                              {req.correctiveActionTitle}
                            </h3>

                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span><strong>Business:</strong> {req.outletName}</span>
                              <span><MapPin size={13} style={{ display: 'inline', marginRight: 3 }} />{req.outletAddress || req.outletCity || 'Mumbai'}</span>
                              <span><Clock size={13} style={{ display: 'inline', marginRight: 3 }} />Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                              {req.scheduledAt && <span><Calendar size={13} style={{ display: 'inline', marginRight: 3 }} />Preferred: {req.scheduledAt}</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                            {req.status === 'requested' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(req.id, 'accepted')}
                                  disabled={actionLoading === req.id}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: '#059669',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <CheckCircle2 size={15} /> ACCEPT REQUEST
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(req.id, 'declined')}
                                  disabled={actionLoading === req.id}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: 8,
                                    background: '#ffffff',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  DECLINE
                                </button>
                              </>
                            )}

                            {req.status === 'accepted' && (
                              <button
                                onClick={() => handleStatusUpdate(req.id, 'in_progress')}
                                disabled={actionLoading === req.id}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <Play size={15} /> START SERVICE
                              </button>
                            )}

                            {req.status === 'in_progress' && (
                              <button
                                onClick={() => setSelectedRequest(req)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Complete Service →
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedRequest(req)}
                              style={{
                                padding: '8px 12px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: 8,
                                fontSize: 13,
                                color: '#334155',
                                cursor: 'pointer'
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        <div style={{
                          background: '#f8fafc',
                          borderRadius: 8,
                          padding: '12px 16px',
                          fontSize: 13,
                          color: '#334155',
                          border: '1px solid #f1f5f9'
                        }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Problem Summary:</p>
                          <p style={{ margin: 0, lineHeight: 1.5 }}>{req.problemDescription}</p>
                          {req.notes && (
                            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 12.5 }}>
                              <strong>Outlet Notes:</strong> {req.notes}
                            </p>
                          )}
                          {req.rejectionNotes && (
                            <div style={{ marginTop: 6, padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#b91c1c', fontSize: 12.5 }}>
                              <strong>Returned for further action:</strong> {req.rejectionNotes}
                            </div>
                          )}
                          {req.completionNotes && (
                            <p style={{ margin: '6px 0 0', color: '#166534', fontSize: 12.5 }}>
                              <strong>Technician Completion Notes:</strong> {req.completionNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* DETAILS MODAL WHEN REQUEST IS SELECTED */}
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
                  padding: 20
                }}
                onClick={() => setSelectedRequest(null)}
              >
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    maxWidth: 620,
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '24px 28px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1', textTransform: 'uppercase' }}>
                          {selectedRequest.status.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>#{selectedRequest.id}</span>
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0F172A' }}>
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
                    {/* SECTION 1: ISSUE */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        ISSUE
                      </span>
                      <strong style={{ fontSize: 15, color: '#0F172A' }}>{selectedRequest.correctiveActionTitle}</strong>
                    </div>

                    {/* SECTION 2: WHAT IS NEEDED */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        WHAT IS NEEDED
                      </span>
                      <p style={{ margin: '0 0 6px', fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>
                        {selectedRequest.problemDescription}
                      </p>
                      {selectedRequest.notes && (
                        <div style={{ fontSize: 12.5, color: '#64748b', paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                          <strong>Outlet notes:</strong> {selectedRequest.notes}
                        </div>
                      )}
                      {selectedRequest.rejectionNotes && (
                        <div style={{ marginTop: 6, padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#b91c1c', fontSize: 12.5 }}>
                          <strong>Returned for further action:</strong> {selectedRequest.rejectionNotes}
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: WHERE */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        WHERE
                      </span>
                      <p style={{ margin: 0, fontSize: 13.5, color: '#334155' }}>
                        {selectedRequest.outletName} — {selectedRequest.outletAddress || selectedRequest.outletCity || 'Mumbai'}
                      </p>
                    </div>

                    {/* SECTION 4: WHEN */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        WHEN
                      </span>
                      <div style={{ fontSize: 13, color: '#334155' }}>
                        <div>Requested: {new Date(selectedRequest.requestedAt).toLocaleString()}</div>
                        {selectedRequest.scheduledAt && (
                          <div>Preferred Service Date: <strong>{selectedRequest.scheduledAt}</strong></div>
                        )}
                        {selectedRequest.completedAt && (
                          <div>Completed: {new Date(selectedRequest.completedAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 5: CONTACT PERSON */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        CONTACT PERSON
                      </span>
                      <div style={{ fontSize: 13, color: '#334155' }}>
                        <div>👤 <strong>{selectedRequest.contactPerson || 'Store Manager'}</strong></div>
                        <div>📞 {selectedRequest.contactPhone || '+91 98200 12345'}</div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS INSIDE MODAL */}
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
                            padding: '10px 16px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13.5,
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
                            padding: '10px 16px',
                            background: '#ffffff',
                            color: '#dc2626',
                            border: '1.5px solid #fca5a5',
                            borderRadius: 8,
                            fontSize: 13.5,
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
                          padding: '10px 16px',
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13.5,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        START SERVICE (IN PROGRESS)
                      </button>
                    )}

                    {selectedRequest.status === 'in_progress' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            Work Completed Summary / Notes (Mandatory) *
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Cleared grease trap, sanitized baffles, chemical certificate #CT-808 issued."
                            value={completionNotes[selectedRequest.id] || ''}
                            onChange={e => setCompletionNotes({ ...completionNotes, [selectedRequest.id]: e.target.value })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            Recommended Follow-up Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={followUpDates[selectedRequest.id] || ''}
                            onChange={e => setFollowUpDates({ ...followUpDates, [selectedRequest.id]: e.target.value })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                          />
                        </div>

                        <button
                          onClick={async () => {
                            const note = completionNotes[selectedRequest.id]?.trim();
                            if (!note) {
                              alert('Please enter a work completed summary before marking service completed.');
                              return;
                            }
                            const followUp = followUpDates[selectedRequest.id];
                            const fullNote = followUp ? `${note} [Recommended Follow-up: ${followUp}]` : note;
                            await handleStatusUpdate(selectedRequest.id, 'completed', fullNote);
                            setSelectedRequest(null);
                          }}
                          disabled={actionLoading === selectedRequest.id}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          MARK SERVICE COMPLETED
                        </button>
                      </div>
                    )}

                    {(selectedRequest.status === 'completed' || selectedRequest.status === 'restaurant_confirmed') && (
                      <div style={{ textAlign: 'center', fontSize: 13, color: '#059669', fontWeight: 700 }}>
                        {selectedRequest.status === 'restaurant_confirmed'
                          ? '✅ Verified on-site and closed by restaurant manager.'
                          : '🔵 Service marked completed. Awaiting restaurant manager on-site verification.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
