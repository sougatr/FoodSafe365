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
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';

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

  useEffect(() => {
    fetchActions();
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

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: 12,
                    color: '#64748B',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: 10,
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
      </main>
    </div>
  );
}
