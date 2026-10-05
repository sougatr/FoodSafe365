'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers,
  Clock,
  Trash2,
  Lock,
  History
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryStockItem, StockStatus } from '@/lib/grocery-types';

export default function GroceryStockPage() {
  const [stock, setStock] = useState<GroceryStockItem[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAuditItem, setSelectedAuditItem] = useState<GroceryStockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const url = statusFilter === 'ALL'
        ? `/api/v1/grocery/stock?outletId=${encodeURIComponent(outletId)}`
        : `/api/v1/grocery/stock?outletId=${encodeURIComponent(outletId)}&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setStock(json.data.stock || []);
        setCounts(json.data.counts || {});
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [statusFilter]);

  const handleUpdateStatus = async (itemId: string, newStatus: StockStatus, reason: string) => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch('/api/v1/grocery/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          itemId,
          newStatus,
          user: 'Store Stock Supervisor',
          reason
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToast(`Stock item updated to ${newStatus}.`);
        fetchStock();
      }
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {toast && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{toast}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
        )}

        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(234, 88, 12, 0.15)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RotateCw size={20} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0 }}>
                FIFO / FEFO Stock Rotation Management
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748B' }}>
              First Expiry First Out (FEFO) audit trail. Expired items are locked from sale and transferred to Quarantine.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            background: '#ffffff',
            padding: '6px',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            {(['ALL', 'ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DISPOSED'] as const).map(s => {
              const isActive = statusFilter === s;
              const count = s === 'ALL' ? (stock.length) : counts[s.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase())] || 0;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    background: isActive ? '#0F172A' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Lock Principle Notice */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 12,
          padding: '12px 18px',
          fontSize: 13,
          color: '#991b1b',
          marginBottom: 24,
          lineHeight: 1.5,
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}>
          <Lock size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Strict FSSAI Product Safety Lock:</strong> Expired food products must NOT remain available for sale under any circumstances.
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>
              Records are permanently preserved in the audit trail rather than deleted. When a product expires, immediately execute &ldquo;Quarantine Stock&rdquo; to remove it from consumer-facing shelves.
            </div>
          </div>
        </div>

        {/* STOCK TABLE */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 15, color: '#0F2922' }}>
              Batches in FEFO Priority Order ({stock.length})
            </strong>
            <span style={{ fontSize: 12, color: '#64748B' }}>Nearest expiry date prioritized first</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Product &amp; Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Batch / Lot</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Qty on Hand</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Received</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Expiry Date (FEFO)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Storage Zone</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Operational Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(item => {
                  const isExpired = item.status === 'EXPIRED';
                  const isNearExpiry = item.status === 'NEAR_EXPIRY';
                  const isQuarantined = item.status === 'QUARANTINED';
                  const isDisposed = item.status === 'DISPOSED';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', background: isExpired ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: '#0F172A', display: 'block' }}>{item.product}</strong>
                        <span style={{ fontSize: 11, color: '#64748B' }}>{item.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                        {item.batch}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {item.dateReceived}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{
                          fontWeight: 700,
                          color: isExpired ? '#dc2626' : isNearExpiry ? '#d97706' : '#15803d'
                        }}>
                          {item.expiryDate}
                        </div>
                        {isExpired && (
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>
                            PAST EXPIRY
                          </span>
                        )}
                        {isNearExpiry && (
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: 4 }}>
                            FEFO PRIORITY (FRONT SHELF)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {item.storageZoneName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          background: isExpired ? '#fee2e2' : isNearExpiry ? '#fef3c7' : isQuarantined ? '#ffedd5' : isDisposed ? '#f1f5f9' : '#dcfce7',
                          color: isExpired ? '#dc2626' : isNearExpiry ? '#b45309' : isQuarantined ? '#ea580c' : isDisposed ? '#64748B' : '#15803d'
                        }}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {isExpired && !isQuarantined && !isDisposed && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'QUARANTINED', 'Pulled from display shelf into Red Quarantine zone.')}
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11.5,
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Pull &amp; Quarantine
                            </button>
                          )}
                          {isQuarantined && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'DISPOSED', 'Product safely condemned and logged in disposal register.')}
                              style={{
                                background: '#475569',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11.5,
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Mark Disposed
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAuditItem(item)}
                            title="View Audit Trail"
                            style={{
                              background: '#F1F5F9',
                              color: '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '5px 8px',
                              fontSize: 11.5,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <History size={13} /> Log
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT TRAIL MODAL */}
        {selectedAuditItem && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Traceable Stock Audit Trail
                  </h3>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                    {selectedAuditItem.product} · Batch: {selectedAuditItem.batch}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAuditItem(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748B' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', marginBottom: 20 }}>
                {selectedAuditItem.auditTrail.map((entry, idx) => (
                  <div key={idx} style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12.5
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#059669' }}>{entry.action}</span>
                      <span>{entry.timestamp.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    <p style={{ margin: 0, color: '#334155' }}>
                      {entry.details}
                    </p>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                      User: {entry.user}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedAuditItem(null)}
                  className="btn secondary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
