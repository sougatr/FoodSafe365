'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Clock,
  Trash2,
  Lock,
  Unlock,
  History,
  Search
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryStockItem, StockStatus, RecallReasonCategory, ReleaseReasonCategory } from '@/lib/grocery-types';

export default function GroceryStockPage() {
  const [stock, setStock] = useState<GroceryStockItem[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAuditItem, setSelectedAuditItem] = useState<GroceryStockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Recall / Quarantine Modal State
  const [recallModalOpen, setRecallModalOpen] = useState(false);
  const [recallBatchNumber, setRecallBatchNumber] = useState('');
  const [recallReasonCategory, setRecallReasonCategory] = useState<RecallReasonCategory>('MANUFACTURER_RECALL');
  const [recallReasonDetails, setRecallReasonDetails] = useState('');
  const [recallSubmitting, setRecallSubmitting] = useState(false);

  // Controlled Release Modal State
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseBatchNumber, setReleaseBatchNumber] = useState('');
  const [releaseReasonCategory, setReleaseReasonCategory] = useState<ReleaseReasonCategory>('LAB_CLEARANCE_CERTIFICATE');
  const [releaseReason, setReleaseReason] = useState('');
  const [releaseSubmitting, setReleaseSubmitting] = useState(false);

  const fetchStock = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      let url = `/api/v1/grocery/stock?outletId=${encodeURIComponent(outletId)}`;
      if (statusFilter !== 'ALL') {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

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
  }, [statusFilter, searchQuery]);

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
        setToast({ message: `Stock item updated to ${newStatus}.`, type: 'success' });
        fetchStock();
      } else {
        setToast({ message: json.error?.message || 'Error updating stock', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error updating stock', type: 'error' });
    }
  };

  const handleBatchQuarantine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallBatchNumber.trim()) {
      alert('Please enter or select a Batch / Lot Number.');
      return;
    }
    setRecallSubmitting(true);
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
          action: 'QUARANTINE_BATCH',
          batchNumber: recallBatchNumber.trim(),
          reasonCategory: recallReasonCategory,
          reasonDetails: recallReasonDetails.trim() || 'Product Recall Safety Hold',
          user: 'Store Stock Manager'
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const data = json.data;
        setToast({
          message: `Batch "${recallBatchNumber}" successfully quarantined (${data.affectedCount} item(s), ${data.totalQuantity} units transferred to Red Quarantine Zone).`,
          type: 'success'
        });
        setRecallModalOpen(false);
        setRecallBatchNumber('');
        setRecallReasonDetails('');
        fetchStock();
      } else {
        alert(json.error?.message || 'Failed to quarantine batch.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error executing batch quarantine.');
    } finally {
      setRecallSubmitting(false);
    }
  };

  const handleBatchRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseReason.trim()) {
      alert('Mandatory release justification reason is required.');
      return;
    }
    setReleaseSubmitting(true);
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
          action: 'RELEASE_BATCH',
          batchNumber: releaseBatchNumber.trim(),
          reasonCategory: releaseReasonCategory,
          releaseReason: releaseReason.trim(),
          user: 'Store Stock Manager'
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const data = json.data;
        if (data.expiredCount > 0) {
          setToast({
            message: `Batch "${releaseBatchNumber}" released: ${data.activeCount} item(s) restored to Active Stock, ${data.expiredCount} item(s) kept as EXPIRED under safety lock.`,
            type: 'success'
          });
        } else {
          setToast({
            message: `Batch "${releaseBatchNumber}" released from quarantine (${data.releasedCount} item(s) restored to Active Stock).`,
            type: 'success'
          });
        }
        setReleaseModalOpen(false);
        setReleaseBatchNumber('');
        setReleaseReason('');
        fetchStock();
      } else {
        alert(json.error?.message || 'Failed to release batch.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error releasing batch.');
    } finally {
      setReleaseSubmitting(false);
    }
  };

  const openRecallModalForBatch = (batchNo: string) => {
    setRecallBatchNumber(batchNo);
    setRecallModalOpen(true);
  };

  const openReleaseModalForBatch = (batchNo: string) => {
    setReleaseBatchNumber(batchNo);
    setReleaseModalOpen(true);
  };

  // Client-side quick filter in case user types fast
  const displayedStock = stock.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.batch.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {toast && (
          <div style={{
            background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: toast.type === 'success' ? '#065f46' : '#991b1b',
            padding: '12px 18px',
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
        )}

        {/* Header Title & Emergency Action */}
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
              First Expiry First Out (FEFO) audit trail. Expired or recalled items are locked from sale and transferred to Quarantine.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setRecallBatchNumber('');
                setRecallModalOpen(true);
              }}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
              }}
            >
              <ShieldAlert size={16} />
              Recall / Batch Quarantine
            </button>

            <div style={{
              display: 'flex',
              gap: 4,
              background: '#ffffff',
              padding: '4px',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              {(['ALL', 'ACTIVE', 'NEAR_EXPIRY', 'EXPIRED', 'QUARANTINED', 'DISPOSED'] as const).map(s => {
                const isActive = statusFilter === s;
                const countKey = s === 'ALL' ? 'all' : s.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                const count = s === 'ALL' ? (counts.active || 0) + (counts.nearExpiry || 0) + (counts.expired || 0) + (counts.quarantined || 0) + (counts.disposed || 0) : counts[countKey] || 0;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      background: isActive ? '#0F172A' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {s.replace(/_/g, ' ')} {count > 0 && <span style={{ opacity: 0.8, fontSize: 10.5 }}>({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTIVE RECALL HOLD ALERT BANNER */}
        {counts.quarantined > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 12,
            padding: '14px 20px',
            fontSize: 13.5,
            color: '#7f1d1d',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldAlert size={22} style={{ flexShrink: 0, color: '#dc2626' }} />
              <div>
                <strong>Active Recall &amp; Quarantine Hold:</strong> {counts.quarantined} product batch item(s) are held under strict safety lock in the Red Quarantine Zone.
                <div style={{ fontSize: 12, color: '#991b1b', marginTop: 2 }}>
                  Under FSSAI guidelines, quarantined stock is server-side blocked from sales, ordering, or issuing until formally resolved.
                </div>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('QUARANTINED')}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              View Quarantined Stock
            </button>
          </div>
        )}

        {/* SEARCH AND CONTROLS BAR */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '14px 18px',
          border: '1px solid #E2E8F0',
          marginBottom: 18,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by Batch / Lot Number, Product Name, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#475569',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          )}
          <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
            Showing {displayedStock.length} of {stock.length} records
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
              Inventory Batches in FEFO Priority Order ({displayedStock.length})
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
                {displayedStock.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
                      {searchQuery ? `No stock items match search "${searchQuery}".` : 'No stock items found for the selected filter.'}
                    </td>
                  </tr>
                ) : (
                  displayedStock.map(item => {
                    const isExpired = item.status === 'EXPIRED';
                    const isNearExpiry = item.status === 'NEAR_EXPIRY';
                    const isQuarantined = item.status === 'QUARANTINED';
                    const isDisposed = item.status === 'DISPOSED';

                    return (
                      <tr key={item.id} style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: isQuarantined ? 'rgba(239, 68, 68, 0.05)' : isExpired ? 'rgba(239, 68, 68, 0.03)' : undefined
                      }}>
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ color: '#0F172A', display: 'block' }}>{item.product}</strong>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{item.category}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                          <span style={{ fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                            {item.batch}
                          </span>
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
                        <td style={{ padding: '12px 16px', color: isQuarantined ? '#dc2626' : '#334155', fontWeight: isQuarantined ? 700 : 500 }}>
                          {item.storageZoneName}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            background: isQuarantined ? '#fee2e2' : isExpired ? '#fef2f2' : isNearExpiry ? '#fef3c7' : isDisposed ? '#f1f5f9' : '#dcfce7',
                            color: isQuarantined ? '#b91c1c' : isExpired ? '#dc2626' : isNearExpiry ? '#b45309' : isDisposed ? '#64748B' : '#15803d',
                            border: isQuarantined ? '1px solid #f87171' : undefined
                          }}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* RECALL QUARANTINE QUICK BUTTON */}
                            {!isQuarantined && !isDisposed && (
                              <button
                                onClick={() => openRecallModalForBatch(item.batch)}
                                title="Quarantine this entire product batch due to recall or safety concern"
                                style={{
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5',
                                  borderRadius: 6,
                                  padding: '5px 8px',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <ShieldAlert size={12} /> Recall Batch
                              </button>
                            )}

                            {/* CONTROLLED RELEASE BUTTON */}
                            {isQuarantined && (
                              <button
                                onClick={() => openReleaseModalForBatch(item.batch)}
                                title="Authorised release of batch back to active stock"
                                style={{
                                  background: '#ecfdf5',
                                  color: '#047857',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: 6,
                                  padding: '5px 8px',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Unlock size={12} /> Release Batch
                              </button>
                            )}

                            {/* MARK DISPOSED BUTTON */}
                            {isQuarantined && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'DISPOSED', 'Product condemned and logged in municipal disposal register.')}
                                style={{
                                  background: '#475569',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '5px 8px',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Trash2 size={12} /> Dispose
                              </button>
                            )}

                            {/* AUDIT LOG BUTTON */}
                            <button
                              onClick={() => setSelectedAuditItem(item)}
                              title="View Audit Trail"
                              style={{
                                background: '#F1F5F9',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                borderRadius: 6,
                                padding: '5px 8px',
                                fontSize: 11,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <History size={12} /> Log
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: BATCH RECALL QUARANTINE */}
        {recallModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 500,
              width: '100%',
              padding: '26px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#991b1b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={20} />
                    Initiate Batch Recall / Quarantine
                  </h3>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
                    Locks the affected batch across inventory and relocates it to the Red Quarantine Zone.
                  </div>
                </div>
                <button
                  onClick={() => setRecallModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748B' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBatchQuarantine} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Target Batch / Lot Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-PRIDE-99"
                    value={recallBatchNumber}
                    onChange={(e) => setRecallBatchNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Mandatory Recall Reason Category *
                  </label>
                  <select
                    value={recallReasonCategory}
                    onChange={(e) => setRecallReasonCategory(e.target.value as RecallReasonCategory)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="MANUFACTURER_RECALL">Manufacturer Formal Recall Notice</option>
                    <option value="SUPPLIER_ALERT">Supplier Quality Alert / Advisory</option>
                    <option value="CONTAMINATION_SUSPECTED">Suspected Microbial / Foreign Contamination</option>
                    <option value="PACKAGING_DEFECT">Packaging Integrity / Seal Breach</option>
                    <option value="OTHER_SAFETY_CONCERN">Other Critical Food Safety Concern</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Traceability Details &amp; Supplier Reference
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide recall circular number, supplier contact, or observed defect details..."
                    value={recallReasonDetails}
                    onChange={(e) => setRecallReasonDetails(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#991b1b',
                  lineHeight: 1.4
                }}>
                  <strong>Strict Safety Lock:</strong> Quarantined items are immediately excluded from active shelf stock and sales availability. Records and quantities are permanently preserved in the audit log.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setRecallModalOpen(false)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recallSubmitting}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      opacity: recallSubmitting ? 0.7 : 1
                    }}
                  >
                    {recallSubmitting ? 'Quarantining...' : 'Lock & Quarantine Entire Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CONTROLLED RELEASE WORKFLOW */}
        {releaseModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: '26px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#047857', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Unlock size={20} />
                    Authorised Release from Quarantine
                  </h3>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
                    Restores cleared stock back to Active Inventory with full traceability log.
                  </div>
                </div>
                <button
                  onClick={() => setReleaseModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748B' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBatchRelease} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Releasing Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={releaseBatchNumber}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Release Resolution Category *
                  </label>
                  <select
                    value={releaseReasonCategory}
                    onChange={(e) => setReleaseReasonCategory(e.target.value as ReleaseReasonCategory)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="LAB_CLEARANCE_CERTIFICATE">Laboratory Clearance Certificate (COA)</option>
                    <option value="FORMAL_RECALL_WITHDRAWAL">Manufacturer Formal Recall Withdrawal</option>
                    <option value="SUPPLIER_ADVISORY_REVOKED">Supplier Quality Advisory Revocation</option>
                    <option value="PRECAUTIONARY_HOLD_CLEARED">Precautionary Internal Hold Cleared</option>
                    <option value="AUTHORISED_SAFETY_CLEARANCE">Authorised QA Regulatory Safety Clearance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Mandatory Release Justification Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Supplier lab clearance COA certificate #772 verified, Precautionary supplier alert formally withdrawn..."
                    value={releaseReason}
                    onChange={(e) => setReleaseReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{
                  background: 'rgba(5, 150, 105, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#065f46',
                  lineHeight: 1.4
                }}>
                  <strong>Authorisation Log:</strong> This release will be recorded under your managerial ID. Matching stock will be transferred back to compliant storage and made available under FEFO rules.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setReleaseModalOpen(false)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={releaseSubmitting}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      opacity: releaseSubmitting ? 0.7 : 1
                    }}
                  >
                    {releaseSubmitting ? 'Releasing...' : 'Confirm Safe Release to Active Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    background: entry.action.includes('QUARANTINED') ? 'rgba(239, 68, 68, 0.05)' : entry.action.includes('RELEASED') ? 'rgba(5, 150, 105, 0.05)' : '#F8FAFC',
                    border: `1px solid ${entry.action.includes('QUARANTINED') ? '#fca5a5' : entry.action.includes('RELEASED') ? '#a7f3d0' : '#E2E8F0'}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12.5
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: 4 }}>
                      <span style={{
                        fontWeight: 700,
                        color: entry.action.includes('QUARANTINED') ? '#dc2626' : entry.action.includes('RELEASED') ? '#059669' : '#0F172A'
                      }}>
                        {entry.action}
                      </span>
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
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
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
