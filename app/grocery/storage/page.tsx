'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Package,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryStorageZone, SegregationRuleCheck } from '@/lib/grocery-types';

export default function GroceryStoragePage() {
  const [zones, setZones] = useState<GroceryStorageZone[]>([]);
  const [warnings, setWarnings] = useState<SegregationRuleCheck[]>([]);
  const [stockByZone, setStockByZone] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddZone, setShowAddZone] = useState(false);

  // New Zone State
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState('ambient_dry');
  const [zoneDesc, setZoneDesc] = useState('');
  const [targetTemp, setTargetTemp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStorageData = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch(`/api/v1/grocery/storage?outletId=${encodeURIComponent(outletId)}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setZones(json.data.zones || []);
        setWarnings(json.data.segregationWarnings || []);
        setStockByZone(json.data.stockCountByZone || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch('/api/v1/grocery/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          name: zoneName,
          type: zoneType,
          description: zoneDesc,
          targetTemp: targetTemp !== '' ? parseFloat(targetTemp) : undefined
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowAddZone(false);
        setZoneName('');
        setZoneDesc('');
        setTargetTemp('');
        fetchStorageData();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating storage zone');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />
      <GroceryHeader />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {/* Section Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Layers size={20} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0 }}>
                Storage Zones &amp; Segregation Controls
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748B' }}>
              &ldquo;Are food products stored correctly?&rdquo; · Prevent cross-contamination between raw meats, chemicals, and ready-to-eat foods.
            </p>
          </div>

          <button
            onClick={() => setShowAddZone(!showAddZone)}
            style={{
              background: showAddZone ? '#475569' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {showAddZone ? '✕ Cancel' : '+ Add Storage Zone'}
          </button>
        </div>

        {/* CROSS-CONTAMINATION & SEGREGATION WARNINGS */}
        {warnings.length > 0 ? (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#dc2626', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} /> Storage Segregation Warnings ({warnings.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {warnings.map(w => (
                <div
                  key={w.id}
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: '#dc2626',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {w.severity}
                    </span>
                    <strong style={{ fontSize: 14, color: '#991b1b' }}>
                      Zone: {w.zoneName}
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#7f1d1d', fontWeight: 600 }}>
                    {w.issue}
                  </p>
                  <div style={{
                    marginTop: 6,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#fee2e2',
                    borderLeft: '4px solid #dc2626',
                    fontSize: 12.5,
                    color: '#991b1b'
                  }}>
                    <strong>ACTION REQUIRED:</strong> {w.actionRequired}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#065f46'
          }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>
              <strong>Storage Segregation Verified:</strong> No conflicting combinations (chemicals alongside food, raw meat above ready-to-eat) detected in active zones.
            </span>
          </div>
        )}

        {/* ADD STORAGE ZONE FORM */}
        {showAddZone && (
          <form onSubmit={handleAddZone} style={{
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: 16,
            padding: '20px 24px',
            marginBottom: 28,
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.1)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', margin: '0 0 14px' }}>
              Define Storage Zone / Display Area
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Zone Name *
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  placeholder="e.g. Milk & Dairy Chiller Aisle"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Zone Type
                </label>
                <select
                  value={zoneType}
                  onChange={e => setZoneType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="ambient_dry">Ambient / Dry Storage (Flours, Staples)</option>
                  <option value="chiller">General Chiller (≤5°C)</option>
                  <option value="freezer">Deep Freezer (≤-18°C)</option>
                  <option value="fresh_produce">Fresh Produce Display Area</option>
                  <option value="meat_chicken">Dedicated Meat / Poultry Cold Zone</option>
                  <option value="fish_seafood">Dedicated Seafood Iced Counter</option>
                  <option value="milk_dairy">Milk &amp; Dairy Cold Zone</option>
                  <option value="bakery">Bakery / Bread Display</option>
                  <option value="chemical_storage">Cleaning Chemicals (Segregated)</option>
                  <option value="waste_quarantine">Red Quarantine &amp; Disposal Area</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Target Temp (°C, Optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={targetTemp}
                  onChange={e => setTargetTemp(e.target.value)}
                  placeholder="e.g. 4 for chiller, -18 for freezer"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                Description &amp; Storage Instructions
              </label>
              <input
                type="text"
                value={zoneDesc}
                onChange={e => setZoneDesc(e.target.value)}
                placeholder="e.g. Shelving elevated 15cm off floor with moisture barrier"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowAddZone(false)}
                className="btn secondary"
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn primary"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Saving...' : 'Save Zone'}
              </button>
            </div>
          </form>
        )}

        {/* ZONES AND ALLOCATED PRODUCTS TABLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {stockByZone.map(zoneEntry => (
            <div
              key={zoneEntry.zoneId}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 16, color: '#0F172A' }}>{zoneEntry.name}</strong>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      background: zoneEntry.type === 'waste_quarantine' ? '#fee2e2' : zoneEntry.type === 'chemical_storage' ? '#ffedd5' : '#f1f5f9',
                      color: zoneEntry.type === 'waste_quarantine' ? '#dc2626' : zoneEntry.type === 'chemical_storage' ? '#ea580c' : '#334155'
                    }}>
                      {zoneEntry.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Zone ID: {zoneEntry.zoneId} · {zoneEntry.items.length} Product Batch(es) present
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href={`/grocery/stock`}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#059669',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    View Stock in FEFO →
                  </Link>
                </div>
              </div>

              {/* Items in this zone */}
              {zoneEntry.items.length === 0 ? (
                <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, fontSize: 12.5, color: '#94A3B8', textAlign: 'center' }}>
                  No active stock batches currently assigned to this zone.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>PRODUCT</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>CATEGORY</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>QUANTITY / BATCH</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>EXPIRY (FEFO)</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zoneEntry.items.map((item: any) => {
                        const isExpired = item.status === 'EXPIRED';
                        const isNearExpiry = item.status === 'NEAR_EXPIRY';
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>
                              {item.product}
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748B' }}>
                              {item.category}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {item.quantity} {item.unit} <span style={{ fontSize: 11, color: '#94A3B8' }}>({item.batch})</span>
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: isExpired ? '#dc2626' : isNearExpiry ? '#d97706' : '#334155' }}>
                              {item.expiryDate}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: isExpired ? '#fee2e2' : isNearExpiry ? '#fef3c7' : 'rgba(16, 185, 129, 0.15)',
                                color: isExpired ? '#dc2626' : isNearExpiry ? '#b45309' : '#059669'
                              }}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
