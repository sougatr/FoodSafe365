'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Thermometer,
  FileText,
  Calendar,
  Layers,
  Search,
  Filter,
  Camera,
  Check
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GROCERY_PRODUCT_CATEGORIES, GroceryReceiving } from '@/lib/grocery-types';

export default function GroceryReceivingPage() {
  const [logs, setLogs] = useState<GroceryReceiving[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACCEPT' | 'HOLD' | 'REJECT'>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [supplier, setSupplier] = useState('');
  const [product, setProduct] = useState('');
  const [productCategory, setProductCategory] = useState('dairy_milk');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [useByDate, setUseByDate] = useState('');
  const [packagingCondition, setPackagingCondition] = useState<'intact' | 'damaged' | 'leaking' | 'crushed' | 'compromised'>('intact');
  const [productCondition, setProductCondition] = useState<'acceptable' | 'spoiled' | 'discolored' | 'off_odor' | 'pest_evident' | 'substandard'>('acceptable');
  const [temperature, setTemperature] = useState<string>('');
  const [isTempSensitive, setIsTempSensitive] = useState(true);
  const [receivingPerson, setReceivingPerson] = useState('Duty Receiving Supervisor');
  const [decision, setDecision] = useState<'ACCEPT' | 'HOLD' | 'REJECT'>('ACCEPT');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Inspection Checklist
  const [checklist, setChecklist] = useState({
    approvedSupplier: true,
    acceptableCondition: true,
    packagingIntact: true,
    noLeakageOrDamage: true,
    dateMarkingAcceptable: true,
    temperatureAppropriate: true,
    suitableForStorage: true,
    withinCapacity: true
  });

  const selectedCatDef = GROCERY_PRODUCT_CATEGORIES.find(c => c.code === productCategory);

  const fetchReceivingLogs = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }
      const res = await fetch(`/api/v1/grocery/receiving?outletId=${encodeURIComponent(outletId)}`);
      const json = await res.json();
      if (res.ok) {
        const records = json.data?.logs || json.logs || (Array.isArray(json.data) ? json.data : []);
        setLogs(records);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivingLogs();
  }, []);

  const handleCategoryChange = (catCode: string) => {
    setProductCategory(catCode);
    const cat = GROCERY_PRODUCT_CATEGORIES.find(c => c.code === catCode);
    if (cat) {
      setIsTempSensitive(cat.requiresTemperatureControl);
    }
  };

  const handleChecklistToggle = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);

    // If critical conditions fail, suggest Hold or Reject
    const anyFailed = !updated.approvedSupplier || !updated.acceptableCondition || !updated.packagingIntact || !updated.noLeakageOrDamage || !updated.temperatureAppropriate;
    if (anyFailed && decision === 'ACCEPT') {
      setDecision('REJECT');
    } else if (!anyFailed && decision === 'REJECT') {
      setDecision('ACCEPT');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const tempNum = isTempSensitive && temperature !== '' ? parseFloat(temperature) : undefined;

      const res = await fetch('/api/v1/grocery/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          supplier,
          product,
          productCategory,
          quantity,
          batchNumber,
          useByDate,
          packagingCondition,
          productCondition,
          temperature: tempNum,
          isTempSensitive,
          receivingPerson,
          decision,
          rejectionReason: decision !== 'ACCEPT' ? rejectionReason : undefined,
          inspectionChecklist: checklist
        })
      });

      const json = await res.json();
      if (res.ok && (json.success || json.data)) {
        setToast('Receiving entry recorded successfully.');
        setShowForm(false);
        // Reset form
        setProduct('');
        setSupplier('');
        setQuantity('');
        setBatchNumber('');
        setUseByDate('');
        setTemperature('');
        setDecision('ACCEPT');
        setRejectionReason('');
        fetchReceivingLogs();
      } else {
        const errorMsg = json.message || json.error?.message || 'Unable to record receiving entry. Please try again.';
        alert(errorMsg);
      }
    } catch (err: any) {
      alert(err.message || 'Unable to record receiving entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.decision === filter);

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

        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(5, 150, 105, 0.15)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck size={20} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0 }}>
                Incoming Food Receiving &amp; Inspection
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748B' }}>
              Inspect suppliers, delivery temperature, seal integrity, and expiry markings before stocking shelves.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? '#475569' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {showForm ? '✕ Close Form' : '+ Record Incoming Delivery'}
          </button>
        </div>

        {/* INCOMING INSPECTION ENTRY FORM */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: '#ffffff',
            border: '1.5px solid #059669',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 28,
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.1)'
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F2922', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={18} color="#059669" /> Dockside Receiving Inspection Form
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Supplier / Vendor Name *
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  placeholder="e.g. Metro Dairy Ltd, coastal fisheries"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. Whole Milk 500ml, Chicken Breast"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Product Category
                </label>
                <select
                  value={productCategory}
                  onChange={e => handleCategoryChange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box', background: '#fff' }}
                >
                  {GROCERY_PRODUCT_CATEGORIES.map(c => (
                    <option key={c.code} value={c.code}>
                      [{c.letter}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Quantity Delivered *
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 50 pouches, 20 kg, 12 crates"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Batch / Lot Number
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  placeholder="e.g. LOT-202610-A"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Use-by / Expiry Date
                </label>
                <input
                  type="date"
                  value={useByDate}
                  onChange={e => setUseByDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Temperature Condition Section */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#0F2922' }}>
                  <input
                    type="checkbox"
                    checked={isTempSensitive}
                    onChange={e => setIsTempSensitive(e.target.checked)}
                    style={{ accentColor: '#059669', width: 16, height: 16 }}
                  />
                  <span>Is this product temperature-sensitive?</span>
                </label>
                {selectedCatDef?.requiresTemperatureControl && (
                  <span style={{ fontSize: 12, color: '#0369a1', fontWeight: 600 }}>
                    Target Guideline: ≤ {selectedCatDef.defaultMaxTemp}°C ({selectedCatDef.name})
                  </span>
                )}
              </div>

              {isTempSensitive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 180 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Dock Reading (°C) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={e => setTemperature(e.target.value)}
                      placeholder="e.g. 3.4"
                      required={isTempSensitive}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', maxWidth: 450 }}>
                    ℹ️ Measure vehicle internal air temperature or probe surface of chilled crates. Configurable limits apply per category SOP.
                  </div>
                </div>
              )}
            </div>

            {/* 8-Point Receiving Inspection Checklist */}
            <div style={{ marginBottom: 20 }}>
              <strong style={{ display: 'block', fontSize: 13.5, color: '#0F2922', marginBottom: 10 }}>
                8-Point Dockside Inspection Checklist:
              </strong>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 10
              }}>
                {[
                  { key: 'approvedSupplier', label: '1. Approved, licensed supplier' },
                  { key: 'acceptableCondition', label: '2. Product in acceptable fresh condition' },
                  { key: 'packagingIntact', label: '3. Packaging intact, clean & sealed' },
                  { key: 'noLeakageOrDamage', label: '4. No leakage, punctures or crushing' },
                  { key: 'dateMarkingAcceptable', label: '5. Date marking legible & compliant' },
                  { key: 'temperatureAppropriate', label: '6. Temperature complies with SOP' },
                  { key: 'suitableForStorage', label: '7. Suitable for intended store zone' },
                  { key: 'withinCapacity', label: '8. Within store storage capacity' }
                ].map(item => {
                  const checked = (checklist as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleChecklistToggle(item.key as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: checked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${checked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        style={{ accentColor: checked ? '#059669' : '#dc2626', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: checked ? '#065f46' : '#991b1b' }}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Receiving Decision */}
            <div style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              padding: '16px',
              borderRadius: 12,
              background: decision === 'ACCEPT' ? '#f0fdf4' : decision === 'HOLD' ? '#fffbeb' : '#fef2f2',
              border: `1.5px solid ${decision === 'ACCEPT' ? '#22c55e' : decision === 'HOLD' ? '#f59e0b' : '#ef4444'}`,
              marginBottom: 18,
              flexWrap: 'wrap'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: 13, color: '#0F2922', marginBottom: 6 }}>
                  Receiving Inspection Decision:
                </strong>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setDecision('ACCEPT')}
                    style={{
                      background: decision === 'ACCEPT' ? '#16a34a' : '#ffffff',
                      color: decision === 'ACCEPT' ? '#ffffff' : '#16a34a',
                      border: '1.5px solid #16a34a',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ ACCEPT &amp; STOCK
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('HOLD')}
                    style={{
                      background: decision === 'HOLD' ? '#d97706' : '#ffffff',
                      color: decision === 'HOLD' ? '#ffffff' : '#d97706',
                      border: '1.5px solid #d97706',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ⚠ HOLD FOR REVIEW
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECT')}
                    style={{
                      background: decision === 'REJECT' ? '#dc2626' : '#ffffff',
                      color: decision === 'REJECT' ? '#ffffff' : '#dc2626',
                      border: '1.5px solid #dc2626',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ REJECT SHIPMENT
                  </button>
                </div>
              </div>

              {decision !== 'ACCEPT' && (
                <div style={{ flex: 1, minWidth: 260 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                    Reason for Exception / Rejection *
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="e.g. Temperature abuse (>5°C), torn packaging, expired batch"
                    required={true}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #f87171', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn secondary"
                style={{ padding: '10px 20px', fontSize: 13.5 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn primary"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 28px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Recording...' : 'Save Receiving Record'}
              </button>
            </div>
          </form>
        )}

        {/* LOG HISTORY TABLE */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          {/* Filter Bar */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <strong style={{ fontSize: 15, color: '#0F2922' }}>
              Receiving Log History ({filteredLogs.length})
            </strong>

            <div style={{ display: 'flex', gap: 8 }}>
              {(['ALL', 'ACCEPT', 'HOLD', 'REJECT'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? '#0F172A' : '#F1F5F9',
                    color: filter === f ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {f === 'ALL' ? 'All Records' : f}
                </button>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
              No receiving records found for this filter.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date &amp; Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Product &amp; Category</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Supplier</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Quantity / Batch</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Dock Temp</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Condition</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => {
                    const isAccept = log.decision === 'ACCEPT';
                    const isReject = log.decision === 'REJECT';
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>
                          {log.dateTime ? log.dateTime.slice(0, 16).replace('T', ' ') : 'Today'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ color: '#0F172A', display: 'block' }}>{log.product}</strong>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{log.productCategory}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          {log.supplier}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>{log.quantity}</div>
                          {log.batchNumber && <span style={{ fontSize: 11, color: '#64748B' }}>Lot: {log.batchNumber}</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {typeof log.temperature === 'number' ? (
                            <span style={{
                              fontWeight: 700,
                              color: log.temperature > 5 && log.isTempSensitive ? '#dc2626' : '#059669'
                            }}>
                              {log.temperature}°C
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>N/A (Ambient)</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ textTransform: 'capitalize', color: log.packagingCondition === 'intact' ? '#059669' : '#dc2626' }}>
                            Pkg: {log.packagingCondition}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>
                            State: {log.productCondition}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800,
                            background: isAccept ? 'rgba(16, 185, 129, 0.15)' : isReject ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isAccept ? '#059669' : isReject ? '#dc2626' : '#d97706'
                          }}>
                            {log.decision}
                          </span>
                          {log.rejectionReason && (
                            <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4, maxWidth: 180 }}>
                              {log.rejectionReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
