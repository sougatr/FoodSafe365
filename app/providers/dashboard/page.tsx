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
  UserCheck
} from 'lucide-react';
import { ServiceRequest } from '@/lib/service-provider-contracts';

export default function ProviderDashboardPage() {
  const [provider, setProvider] = useState<any>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'completed'>('new');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
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
  const activeJobs = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress');
  const completedJobs = requests.filter(r => r.status === 'completed' || r.status === 'restaurant_confirmed' || r.status === 'declined');

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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 24,
          paddingBottom: 4
        }}>
          <button
            onClick={() => setActiveTab('new')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === 'new' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'new' ? '2px solid #059669' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            New Requests
            <span style={{
              background: activeTab === 'new' ? '#ecfdf5' : '#f1f5f9',
              color: activeTab === 'new' ? '#059669' : '#64748b',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {newRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === 'active' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'active' ? '2px solid #059669' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Active Jobs
            <span style={{
              background: activeTab === 'active' ? '#ecfdf5' : '#f1f5f9',
              color: activeTab === 'active' ? '#059669' : '#64748b',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {activeJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === 'completed' ? '#059669' : '#64748b',
              borderBottom: activeTab === 'completed' ? '2px solid #059669' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Completed & History
            <span style={{
              background: activeTab === 'completed' ? '#ecfdf5' : '#f1f5f9',
              color: activeTab === 'completed' ? '#059669' : '#64748b',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {completedJobs.length}
            </span>
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Loading service requests...
          </div>
        ) : (
          <div>
            {/* TAB 1: NEW REQUESTS */}
            {activeTab === 'new' && (
              <div>
                {newRequests.length === 0 ? (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px dashed #cbd5e1',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <Building2 size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: '#1e293b' }}>
                      No Pending Requests
                    </h3>
                    <p style={{ margin: 0, fontSize: 13 }}>
                      When a restaurant identifies a corrective action needing your specialization, new requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {newRequests.map(req => (
                      <div
                        key={req.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 14,
                          border: '1px solid #e2e8f0',
                          padding: '20px 24px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 4,
                                textTransform: 'uppercase'
                              }}>
                                REQUESTED
                              </span>
                              <span style={{ fontSize: 12, color: '#64748b' }}>
                                Reference: {req.id}
                              </span>
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>
                              {req.correctiveActionTitle}
                            </h3>
                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', alignItems: 'center' }}>
                              <span><strong>Restaurant:</strong> {req.outletName}</span>
                              <span><MapPin size={13} style={{ display: 'inline', marginRight: 3 }} />{req.outletCity}</span>
                              <span><Clock size={13} style={{ display: 'inline', marginRight: 3 }} />{new Date(req.requestedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 10 }}>
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
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <CheckCircle2 size={15} /> Accept Job
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
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <XCircle size={15} /> Decline
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
                          <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Food-Safety Requirement Details:</p>
                          <p style={{ margin: 0, lineHeight: 1.5 }}>{req.problemDescription}</p>
                          {req.notes && (
                            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 12 }}>
                              <strong>Restaurant Notes:</strong> {req.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACTIVE JOBS */}
            {activeTab === 'active' && (
              <div>
                {activeJobs.length === 0 ? (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px dashed #cbd5e1',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <Clock size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: '#1e293b' }}>
                      No Active Jobs
                    </h3>
                    <p style={{ margin: 0, fontSize: 13 }}>
                      Jobs you accept from the "New Requests" tab will appear here for progress updates.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {activeJobs.map(req => (
                      <div
                        key={req.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 14,
                          border: '1px solid #e2e8f0',
                          padding: '20px 24px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{
                                background: req.status === 'in_progress' ? '#fed7aa' : '#e0f2fe',
                                color: req.status === 'in_progress' ? '#c2410c' : '#0369a1',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 4,
                                textTransform: 'uppercase'
                              }}>
                                {req.status === 'in_progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                              </span>
                              <span style={{ fontSize: 12, color: '#64748b' }}>
                                {req.id}
                              </span>
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>
                              {req.correctiveActionTitle}
                            </h3>
                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', alignItems: 'center' }}>
                              <span><strong>Restaurant:</strong> {req.outletName}</span>
                              <span><MapPin size={13} style={{ display: 'inline', marginRight: 3 }} />{req.outletCity}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 10 }}>
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
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <Play size={15} /> Start Service
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const note = completionNotes[req.id] || 'Work completed per food safety guidelines.';
                                handleStatusUpdate(req.id, 'completed', note);
                              }}
                              disabled={actionLoading === req.id}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <CheckCircle2 size={15} /> Mark Service Completed
                            </button>
                          </div>
                        </div>

                        <div style={{
                          background: '#f8fafc',
                          borderRadius: 8,
                          padding: '12px 16px',
                          fontSize: 13,
                          color: '#334155',
                          marginBottom: 12
                        }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Problem Description:</p>
                          <p style={{ margin: 0 }}>{req.problemDescription}</p>
                        </div>

                        {/* Completion Note Input */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Completion Summary / Technician Notes for Restaurant:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Conducted fogging & baiting. Traps replaced. Pest certificate #PC-442 issued."
                            value={completionNotes[req.id] || ''}
                            onChange={e => setCompletionNotes({ ...completionNotes, [req.id]: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: 13,
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMPLETED JOBS */}
            {activeTab === 'completed' && (
              <div>
                {completedJobs.length === 0 ? (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px dashed #cbd5e1',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <UserCheck size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', color: '#1e293b' }}>
                      No Completed History
                    </h3>
                    <p style={{ margin: 0, fontSize: 13 }}>
                      Service requests completed or confirmed by restaurant managers will be archived here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {completedJobs.map(req => (
                      <div
                        key={req.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: 14,
                          border: '1px solid #e2e8f0',
                          padding: '18px 22px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <span style={{
                              background: req.status === 'restaurant_confirmed' ? '#ecfdf5' : req.status === 'completed' ? '#eff6ff' : '#f1f5f9',
                              color: req.status === 'restaurant_confirmed' ? '#065f46' : req.status === 'completed' ? '#1d4ed8' : '#64748b',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              textTransform: 'uppercase',
                              display: 'inline-block',
                              marginBottom: 4
                            }}>
                              {req.status === 'restaurant_confirmed'
                                ? 'RESTAURANT CONFIRMED'
                                : req.status === 'completed'
                                ? 'SERVICE COMPLETED (AWAITING RESTAURANT CONFIRMATION)'
                                : req.status.toUpperCase()}
                            </span>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                              {req.correctiveActionTitle}
                            </h3>
                          </div>

                          <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                            {req.completedAt && (
                              <div>Completed: {new Date(req.completedAt).toLocaleDateString()}</div>
                            )}
                            {req.confirmedAt && (
                              <div style={{ color: '#059669', fontWeight: 600 }}>
                                Verified by Restaurant: {new Date(req.confirmedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                          <div><strong>Location:</strong> {req.outletName} ({req.outletCity})</div>
                          <div><strong>Service:</strong> {req.problemDescription}</div>
                          {req.notes && <div style={{ marginTop: 4, color: '#64748b' }}><strong>Notes:</strong> {req.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
