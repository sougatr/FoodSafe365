'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Thermometer,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Settings,
  ChevronRight
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import GroceryHeader from '@/components/GroceryHeader';
import { GroceryEquipment, GroceryTemperatureLog } from '@/lib/grocery-types';

export default function GroceryTemperaturePage() {
  const [equipmentList, setEquipmentList] = useState<GroceryEquipment[]>([]);
  const [logs, setLogs] = useState<GroceryTemperatureLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState<GroceryEquipment | null>(null);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [reading, setReading] = useState('');
  const [method, setMethod] = useState<'probe' | 'manual'>('probe');
  const [notes, setNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState('Duty Temperature Supervisor');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Equipment state
  const [newEqName, setNewEqName] = useState('');
  const [newEqType, setNewEqType] = useState('chiller');
  const [newEqLocation, setNewEqLocation] = useState('');
  const [newEqTarget, setNewEqTarget] = useState('4.0');
  const [newEqMin, setNewEqMin] = useState('1.0');
  const [newEqMax, setNewEqMax] = useState('5.0');
  const [newEqPerson, setNewEqPerson] = useState('Rajesh Nair');

  const fetchTemperatureData = async () => {
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }
      const res = await fetch(`/api/v1/grocery/temperature?outletId=${encodeURIComponent(outletId)}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setEquipmentList(json.data.equipment || []);
        setLogs(json.data.logs || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatureData();
  }, []);

  const handleRecordTemperature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLogModal) return;
    setSubmitting(true);

    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch('/api/v1/grocery/temperature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          equipmentId: showLogModal.id,
          reading: parseFloat(reading),
          recordedBy,
          method,
          notes: notes.trim() || undefined
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const status = json.data.log.status;
        setToast(`Recorded ${reading}°C for ${showLogModal.name} (${status}).`);
        setShowLogModal(null);
        setReading('');
        setNotes('');
        fetchTemperatureData();
      } else {
        alert(json.message || 'Failed to record temperature.');
      }
    } catch (err: any) {
      alert(err.message || 'Error recording temperature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let outletId = 'store-nature-basket-bandra';
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('foodsafe365_grocery_outlet_id');
        if (saved) outletId = saved;
      }

      const res = await fetch('/api/v1/grocery/temperature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          type: 'configure_equipment',
          equipmentConfig: {
            name: newEqName,
            type: newEqType,
            location: newEqLocation,
            targetTemp: parseFloat(newEqTarget),
            minTemp: parseFloat(newEqMin),
            maxTemp: parseFloat(newEqMax),
            responsiblePerson: newEqPerson,
            active: true
          }
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToast(`Added equipment: ${newEqName}`);
        setShowEquipModal(false);
        setNewEqName('');
        setNewEqLocation('');
        fetchTemperatureData();
      }
    } catch (err: any) {
      alert(err.message || 'Error adding equipment');
    } finally {
      setSubmitting(false);
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

        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Thermometer size={20} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0 }}>
                Chiller &amp; Freezer Temperature Monitoring
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748B' }}>
              Twice-daily operational logging for cold storage units. Thresholds configurable per equipment SOP.
            </p>
          </div>

          <button
            onClick={() => setShowEquipModal(true)}
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1.5px solid #CBD5E1',
              padding: '9px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Settings size={15} /> + Add Equipment
          </button>
        </div>

        {/* Regulatory & Configurable Disclaimer Banner */}
        <div style={{
          background: 'rgba(3, 105, 161, 0.08)',
          border: '1px solid rgba(3, 105, 161, 0.25)',
          borderRadius: 12,
          padding: '12px 18px',
          fontSize: 13,
          color: '#075985',
          marginBottom: 24,
          lineHeight: 1.5,
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}>
          <Info size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Operational Temperature Standards:</strong> Cold foods stored at or below <strong>5°C</strong>; frozen foods at or below <strong>-18°C</strong>.
            <div style={{ fontSize: 12, color: '#0369a1', marginTop: 2 }}>
              &ldquo;Follow product-specific storage instructions / manufacturer label where applicable.&rdquo; FSSAI retail guidance specifies temperature-sensitive products should be stored appropriately. Defaults are configurable per equipment.
            </div>
          </div>
        </div>

        {/* EQUIPMENT CARDS GRID */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', marginBottom: 14 }}>
          Active Cooling Units &amp; Display Cabinets ({equipmentList.length})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}>
          {equipmentList.map(eq => {
            const eqLogs = logs.filter(l => l.equipmentId === eq.id);
            const latestLog = eqLogs[0];
            const isRed = latestLog?.status === 'RED';
            const isAmber = latestLog?.status === 'AMBER';
            const isGreen = latestLog?.status === 'GREEN';

            return (
              <div
                key={eq.id}
                style={{
                  background: '#ffffff',
                  border: isRed ? '1.5px solid #ef4444' : '1px solid #E2E8F0',
                  borderRadius: 16,
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 16, color: '#0F172A', display: 'block' }}>{eq.name}</strong>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{eq.location}</span>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      background: eq.type === 'freezer' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: eq.type === 'freezer' ? '#2563eb' : '#059669'
                    }}>
                      {eq.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Target & Limits */}
                  <div style={{
                    display: 'flex',
                    gap: 14,
                    background: '#F8FAFC',
                    padding: '10px 12px',
                    borderRadius: 10,
                    margin: '12px 0',
                    fontSize: 12
                  }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block' }}>Target</span>
                      <strong style={{ color: '#0F172A', fontSize: 14 }}>{eq.targetTemp}°C</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block' }}>Compliant Range</span>
                      <strong style={{ color: '#0F172A', fontSize: 14 }}>{eq.minTemp}°C to {eq.maxTemp}°C</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block' }}>Responsible</span>
                      <span style={{ color: '#334155' }}>{eq.responsiblePerson}</span>
                    </div>
                  </div>

                  {/* Latest Reading Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 12.5, color: '#475569' }}>Latest Reading:</span>
                    {latestLog ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: isRed ? '#dc2626' : isAmber ? '#d97706' : '#059669'
                        }}>
                          {latestLog.reading}°C
                        </span>
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isRed ? '#fee2e2' : isAmber ? '#fef3c7' : '#dcfce7',
                          color: isRed ? '#dc2626' : isAmber ? '#b45309' : '#15803d'
                        }}>
                          {latestLog.status}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>No readings today</span>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
                    {latestLog ? `Checked ${latestLog.recordedAt.slice(11, 16)}` : 'Routine check required'}
                  </span>
                  <button
                    onClick={() => {
                      setShowLogModal(eq);
                      setReading('');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    + Enter Reading
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* LOG HISTORY TABLE */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 15, color: '#0F2922' }}>
              Recent Temperature Audit Logs ({logs.length})
            </strong>
            <span style={{ fontSize: 12, color: '#64748B' }}>Traceable digital readings</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Recorded Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Equipment</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Reading</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Method</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Inspector / Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const isRed = log.status === 'RED';
                  const isAmber = log.status === 'AMBER';
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {log.recordedAt.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>
                        {log.equipmentName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: isRed ? '#dc2626' : isAmber ? '#d97706' : '#059669', fontSize: 14 }}>
                          {log.reading}°C
                        </strong>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                          background: isRed ? '#fee2e2' : isAmber ? '#fef3c7' : '#dcfce7',
                          color: isRed ? '#dc2626' : isAmber ? '#b45309' : '#15803d'
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: '#64748B' }}>
                        {log.method}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        <div>{log.recordedBy}</div>
                        {log.notes && <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{log.notes}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: ENTER TEMPERATURE */}
        {showLogModal && (
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
            <form onSubmit={handleRecordTemperature} style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                Record Temperature: {showLogModal.name}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B' }}>
                Compliant range: {showLogModal.minTemp}°C to {showLogModal.maxTemp}°C (Target: {showLogModal.targetTemp}°C)
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Thermometer / Probe Reading (°C) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={reading}
                  onChange={e => setReading(e.target.value)}
                  placeholder="e.g. 3.8"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 16,
                    fontWeight: 800,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Reading Method
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setMethod('probe')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      border: method === 'probe' ? '1.5px solid #059669' : '1px solid #CBD5E1',
                      background: method === 'probe' ? 'rgba(5, 150, 105, 0.1)' : '#fff',
                      color: method === 'probe' ? '#065f46' : '#334155',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Digital Probe
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('manual')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      border: method === 'manual' ? '1.5px solid #059669' : '1px solid #CBD5E1',
                      background: method === 'manual' ? 'rgba(5, 150, 105, 0.1)' : '#fff',
                      color: method === 'manual' ? '#065f46' : '#334155',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Built-in Dial / Display
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Responsible Person / Inspector
                </label>
                <input
                  type="text"
                  value={recordedBy}
                  onChange={e => setRecordedBy(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Observation Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Defrost cycle just finished, door closed properly"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(null)}
                  className="btn secondary"
                  style={{ padding: '9px 18px', fontSize: 13.5 }}
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
                    padding: '9px 24px',
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Reading'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: ADD EQUIPMENT */}
        {showEquipModal && (
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
            <form onSubmit={handleAddEquipment} style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 500,
              width: '100%',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 16px' }}>
                Add New Temperature-Controlled Equipment
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    value={newEqName}
                    onChange={e => setNewEqName(e.target.value)}
                    placeholder="e.g. Meat Chiller 3, Ice Cream Chest Freezer"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Type
                  </label>
                  <select
                    value={newEqType}
                    onChange={e => {
                      setNewEqType(e.target.value);
                      if (e.target.value === 'freezer') {
                        setNewEqTarget('-18');
                        setNewEqMin('-24');
                        setNewEqMax('-18');
                      } else {
                        setNewEqTarget('4');
                        setNewEqMin('1');
                        setNewEqMax('5');
                      }
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="chiller">Chiller (≤5°C)</option>
                    <option value="freezer">Freezer (≤-18°C)</option>
                    <option value="cold_room">Walk-in Cold Room</option>
                    <option value="open_display_chiller">Open Display Chiller</option>
                    <option value="other">Other Temperature Unit</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Location in Store
                  </label>
                  <input
                    type="text"
                    value={newEqLocation}
                    onChange={e => setNewEqLocation(e.target.value)}
                    placeholder="e.g. Dairy Aisle, Butchery"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Target Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newEqTarget}
                    onChange={e => setNewEqTarget(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Max Acceptable (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newEqMax}
                    onChange={e => setNewEqMax(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Responsible Person
                  </label>
                  <input
                    type="text"
                    value={newEqPerson}
                    onChange={e => setNewEqPerson(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEquipModal(false)}
                  className="btn secondary"
                  style={{ padding: '9px 18px', fontSize: 13.5 }}
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
                    padding: '9px 24px',
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Adding...' : 'Configure Unit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
